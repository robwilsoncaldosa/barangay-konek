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
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'barangay-konek-storage'
  const prefix = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PREFIX ?? 'documents'
  const expirySeconds = Number(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_SIGNED_URL_EXPIRY ?? 604800)
  
  // Use server-side only environment variables for S3 credentials (no NEXT_PUBLIC_ prefix)
  const s3Endpoint = process.env.S3_ENDPOINT
  const useS3 = !!s3Endpoint
  
  const config: StorageConfig = {
    bucket,
    prefix,
    expirySeconds,
    useS3
  }
  
  if (useS3) {
    // Validate required S3 credentials
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('S3 credentials are required when S3_ENDPOINT is set')
    }
    
    config.s3Config = {
      endpoint: s3Endpoint,
      region: process.env.S3_REGION ?? 'us-east-1',
      accessKeyId,
      secretAccessKey,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
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
    const supabaseClient = await createSupabaseServerClient()
    const buffer = await file.arrayBuffer()
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(config.bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }
    
    // Generate signed URL for download
    const { data: signedData, error: signedError } = await supabaseClient.storage
      .from(config.bucket)
      .createSignedUrl(filePath, config.expirySeconds)
    
    if (signedError) {
      console.error('Error creating signed URL:', signedError)
      return { success: false, error: `Signed URL failed: ${signedError.message}` }
    }
    
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
  const config = getStorageConfig()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${config.prefix}/${fileName}`
  
  if (config.useS3) {
    return uploadToS3(file, filePath, config)
  } else {
    return uploadToSupabase(file, filePath, config)
  }
}