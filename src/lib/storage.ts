import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createSupabaseServerClient } from './supabase/server'

interface UploadResult {
  success: boolean
  error?: string
  filePath?: string
  publicUrl?: string
}

interface StorageConfig {
  bucket: string
  prefix: string
  expirySeconds: number
  useS3: boolean
  s3Config?: {
    endpoint: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    forcePathStyle: boolean
  }
}

function getStorageConfig(): StorageConfig {
  // Provide fallback values to prevent empty bucket names
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET is required') })()
  const prefix = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PREFIX ?? (() => { throw new Error('NEXT_PUBLIC_SUPABASE_STORAGE_PREFIX is required') })()
  const expirySeconds = Number(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_SIGNED_URL_EXPIRY || 604800)

  // Use server-side only environment variables for S3 credentials (no NEXT_PUBLIC_ prefix)
  const s3Endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT
  const useS3 = !!s3Endpoint

  // Validate bucket name is not empty
  if (!bucket.trim()) {
    throw new Error('Storage bucket name cannot be empty. Please set NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET environment variable.')
  }

  const config: StorageConfig = {
    bucket: bucket.trim(),
    prefix: prefix.trim(),
    expirySeconds,
    useS3
  }

  if (useS3) {
    // Validate required S3 credentials
    const accessKeyId = process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('S3 credentials are required when NEXT_PUBLIC_S3_ENDPOINT is set')
    }

    config.s3Config = {
      endpoint: s3Endpoint,
      region: process.env.NEXT_PUBLIC_S3_REGION ?? 'us-east-1',
      accessKeyId,
      secretAccessKey,
      forcePathStyle: process.env.NEXT_PUBLIC_S3_FORCE_PATH_STYLE === 'true'
    }
  }

  return config
}

async function uploadToS3(file: File, filePath: string, config: StorageConfig): Promise<UploadResult> {
  if (!config.s3Config) {
    return { success: false, error: 'S3 configuration missing' }
  }

  try {
    const s3Client = new S3Client({
      endpoint: config.s3Config.endpoint,
      region: config.s3Config.region,
      credentials: {
        accessKeyId: config.s3Config.accessKeyId,
        secretAccessKey: config.s3Config.secretAccessKey
      },
      forcePathStyle: config.s3Config.forcePathStyle
    })

    const buffer = await file.arrayBuffer()

    const uploadCommand = new PutObjectCommand({
      Bucket: config.bucket,
      Key: filePath,
      Body: new Uint8Array(buffer),
      ContentType: file.type
    })

    await s3Client.send(uploadCommand)

    // Generate signed URL for download
    const getCommand = new GetObjectCommand({
      Bucket: config.bucket,
      Key: filePath
    })

    const publicUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: config.expirySeconds
    })

    return {
      success: true,
      filePath,
      publicUrl
    }
  } catch (error) {
    console.error('S3 upload error:', error instanceof Error ? error.message : 'Unknown S3 error')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'S3 upload failed'
    }
  }
}

async function uploadToSupabase(file: File, filePath: string, config: StorageConfig): Promise<UploadResult> {
  try {
    console.log('Initializing Supabase client for upload');
    const supabaseClient = await createSupabaseServerClient()

    // Check if bucket exists first
    console.log('Checking if bucket exists:', config.bucket);
    const { data: buckets, error: bucketError } = await supabaseClient.storage.listBuckets()

    if (bucketError) {
      console.error('Error listing buckets:', bucketError.message)
      return { success: false, error: `Failed to access storage: ${bucketError.message}` }
    }

    console.log('Available buckets:', buckets?.map(b => b.name));
    const bucketExists = buckets?.some(bucket => bucket.name === config.bucket)

    if (!bucketExists) {
      console.error(`Bucket '${config.bucket}' not found. Available buckets:`, buckets?.map(b => b.name))
      return {
        success: false,
        error: `Storage bucket '${config.bucket}' not found. Please ensure the bucket exists in your Supabase project.`
      }
    }

    console.log('Converting file to buffer');
    const buffer = await file.arrayBuffer()
    console.log('Buffer size:', buffer.byteLength);

    console.log('Starting upload to Supabase storage');
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(config.bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError.message)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    console.log('Upload successful, creating signed URL');
    // Generate signed URL for download
    const { data: signedData, error: signedError } = await supabaseClient.storage
      .from(config.bucket)
      .createSignedUrl(filePath, config.expirySeconds)

    if (signedError) {
      console.error('Error creating signed URL:', signedError.message)
      return { success: false, error: `Signed URL failed: ${signedError.message}` }
    }

    console.log('Signed URL created successfully:', signedData.signedUrl);
    return {
      success: true,
      filePath,
      publicUrl: signedData.signedUrl
    }
  } catch (error) {
    console.error('Supabase upload error:', error instanceof Error ? error.message : 'Unknown Supabase error')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Supabase upload failed'
    }
  }
}

export async function uploadFile(file: File): Promise<UploadResult> {
  try {
    console.log('Starting file upload for:', file.name, 'Size:', file.size, 'Type:', file.type);

    const config = getStorageConfig()
    console.log('Storage config:', {
      bucket: config.bucket,
      prefix: config.prefix,
      useS3: config.useS3
    });

    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${config.prefix}/${fileName}`
    console.log('Generated file path:', filePath);

    if (config.useS3) {
      console.log('Using S3 storage');
      return uploadToS3(file, filePath, config)
    } else {
      console.log('Using Supabase storage');
      return uploadToSupabase(file, filePath, config)
    }
  } catch (error) {
    console.error('Storage configuration error:', error instanceof Error ? error.message : 'Unknown configuration error')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage configuration failed'
    }
  }
}