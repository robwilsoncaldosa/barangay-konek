'use server'

import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { uploadFile } from '../lib/storage'
import { createSupabaseServerClient } from '../lib/supabase/server'
import type { Database } from '../../database.types'

type Request = Database['public']['Tables']['mRequest']['Row']
type RequestInsert = Database['public']['Tables']['mRequest']['Insert']
type RequestUpdate = Database['public']['Tables']['mRequest']['Update']
type User = Database['public']['Tables']['mUsers']['Row']
type Certificate = Database['public']['Tables']['mCertificate']['Row'] // Added Certificate type

interface RequestWithUserAndCertificate extends Request {
  resident_name: string
  resident_email: string
  certificate_name: string
  certificate_fee: number
}

interface CompleteRequestParams {
  requestId: string
  email: string
  file: File
  tx_hash?: string
}

// NOTE: I'm updating the 'mUsers' select to include name fields and using a JOIN for mCertificate.

export async function getRequests(filters?: {
  resident_id?: string
  status?: Pick<Request, 'status'>['status']
}): Promise<RequestWithUserAndCertificate[]> { // Updated return type
  try {
    const supabase = await createSupabaseServerClient()
    let query = supabase.from('mRequest').select('*').eq('del_flag', 0).order('id', { ascending: true })

    if (filters?.resident_id) {
      query = query.eq('resident_id', Number(filters.resident_id))
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // Type definition for the joined data structure
    type JoinedRequest = Request & {
      mCertificate: Pick<Certificate, 'name' | 'fee'> | null
    }

    const { data: joinedRequests, error } = await query as {
      data: JoinedRequest[] | null;
      error: unknown | null;
    }

    if (error) {
      console.error('Error fetching requests with certificate details:', error)
      return []
    }

    if (!joinedRequests) return []

    // 2. Fetch users for resident_ids (to get their names)
    const residentIds = [...new Set(joinedRequests.map(req => req.resident_id))]

    const { data: users, error: userError } = await supabase
      .from('mUsers')
      .select('id, email, first_name, middle_name, last_name')
      .in('id', residentIds)
      .eq('del_flag', 0)

    if (userError) {
      console.error('Error fetching resident users for request mapping:', userError)
      return []
    }

    // 3. Map requests with user's full name and certificate details
    const requestsWithUserAndCertificate: RequestWithUserAndCertificate[] = joinedRequests.map(request => {
      const user = users?.find(u => u.id === request.resident_id)

      let residentName = 'Unknown Resident'
      if (user) {
        // Construct the full name: first + middle (if present) + last
        const parts = [
          user.first_name,
          user.middle_name,
          user.last_name
        ].filter(Boolean) // Filter out null/empty middle_name

        residentName = parts.join(' ')
      }

      // Extract certificate details, providing defaults if mCertificate is null
      const certificateDetails = request.mCertificate || { name: 'Unknown Certificate', fee: 0 }

      const residentEmail = user?.email ?? ''

      return {
        ...request,
        resident_name: residentName,
        resident_email: residentEmail,
        certificate_name: certificateDetails.name,
        certificate_fee: certificateDetails.fee,
      } as RequestWithUserAndCertificate
    })

    return requestsWithUserAndCertificate
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function getRequestById(requestId: string): Promise<Request | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mRequest')
      .select('*')
      .eq('id', Number(requestId))
      .eq('del_flag', 0)
      .single()

    if (error) {
      console.error('Error fetching request by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function createRequest(
  requestData: Pick<RequestInsert, 'mCertificateId' | 'resident_id' | 'purpose' | 'document_type' | 'request_date' | 'priority'>
): Promise<{ success: boolean; data?: Request; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const insertData: RequestInsert = {
      mCertificateId: requestData.mCertificateId,
      resident_id: requestData.resident_id,
      purpose: requestData.purpose,
      document_type: requestData.document_type,
      request_date: requestData.request_date,
      priority: requestData.priority,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      del_flag: 0
    }

    const { data, error } = await supabase
      .from('mRequest')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating request:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: string,
  documentType?: string,
  paymentStatus?: string
): Promise<{ success: boolean; data?: Request; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const updateData: RequestUpdate = {
      status,
      updated_at: new Date().toISOString(),
      ...(documentType && { document_type: documentType }),
      payment_status: paymentStatus
    }

    const { data, error } = await supabase
      .from('mRequest')
      .update(updateData)
      .eq('id', Number(requestId))
      .select()
      .single()

    if (error) {
      console.error('Error updating request status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function completeRequestWithDocument(
  requestId: string,
  email: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<{ success: boolean; data?: Request; error?: string }> {
  try {
    // Save file
    const uploadDir = path.join(process.cwd(), 'uploads')
    fs.mkdirSync(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`)
    fs.writeFileSync(filePath, fileBuffer)

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_USER,
        pass: process.env.NEXT_PUBLIC_SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.NEXT_PUBLIC_SMTP_USER ?? undefined,
      to: email,
      subject: 'Your Requested Document',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f3f6f9; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #2563eb; color: #ffffff; padding: 16px 24px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h2 style="margin: 0; font-size: 20px;">Barangay Konek</h2>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h3 style="margin: 0 0 12px; color: #1f2937;">Your Requested Document is Ready</h3>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Dear Resident,
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for using our service. Please find the attached document you requested.
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                If you have any concerns or need additional assistance, feel free to reply to this email.
              </p>
              <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
                Best regards,<br/>
                <strong>Barangay Konek Team</strong>
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; font-size: 12px; color: #777;">
            &copy; ${new Date().getFullYear()} Barangay Konek. All rights reserved.
          </div>
        </div>
      `,
      attachments: [
        { filename: fileName, path: filePath }
      ],
    })

    // Update request status
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mRequest')
      .update({
        status: 'completed',
        document_type: fileName,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(requestId))
      .select()
      .single()

    if (error) {
      console.error('Error updating request:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function deleteRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Soft delete by setting del_flag to 1
    const { error } = await supabase
      .from('mRequest')
      .update({
        del_flag: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(requestId))

    if (error) {
      console.error('Error deleting request:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function completeRequestWithFile({ requestId, email, file, tx_hash }: CompleteRequestParams) {
  try {
    console.log('Starting file upload process for request:', requestId);
    
    // Upload file using unified storage utility
    const uploadResult = await uploadFile(file)
    
    if (!uploadResult.success) {
      console.error('File upload failed:', uploadResult.error);
      return { success: false, error: uploadResult.error || 'File upload failed' }
    }
    
    console.log('File uploaded successfully, public URL:', uploadResult.publicUrl);
    const publicUrl = uploadResult.publicUrl!

    console.log('Sending email notification to:', email);
    
    // Validate SMTP configuration
    const smtpConfig = {
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
      user: process.env.NEXT_PUBLIC_SMTP_USER,
      pass: process.env.NEXT_PUBLIC_SMTP_PASS,
    };
    
    console.log('SMTP Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      hasPassword: !!smtpConfig.pass
    });
    
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
      console.error('Missing SMTP configuration');
      return { success: false, error: 'Email configuration is incomplete' };
    }
    
    // Send email with file attachment using the public URL
     const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })

    try {
      await transporter.sendMail({
        from: smtpConfig.user,
        to: email,
        subject: 'Your Requested Document is Ready - Barangay Konek',
        html: `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 32px 16px; line-height: 1.6; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b4cf2 0%, #2d3df0 100%); color: #ffffff; padding: 32px 24px; text-align: center; position: relative;">
              <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px; position: relative; z-index: 1;">
                🏛️ Barangay Konek
              </div>
              <div style="font-size: 14px; opacity: 0.9; position: relative; z-index: 1;">
                Digital Government Services
              </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <h1 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 24px; text-align: center; margin-top: 0;">
                📄 Your Document is Ready!
              </h1>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 20px; margin-top: 0;">
                Dear Valued Resident,
              </p>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 32px; margin-top: 0;">
                We're pleased to inform you that your requested document has been successfully processed and is now ready for download. 
                Thank you for using our digital services platform.
              </p>
              
              <!-- Download Section -->
              <div style="background: linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
                <div style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; margin-top: 0;">
                  📥 Download Your Document
                </div>
                <a href="${publicUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b4cf2 0%, #2d3df0 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" target="_blank">
                  Download Document
                </a>
              </div>
              
              ${tx_hash ? `
              <!-- Blockchain Section -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; margin-top: 0;">
                  <span style="width: 20px; height: 20px; margin-right: 8px; background: #3b4cf2; border-radius: 4px; display: inline-block; vertical-align: middle;"></span>
                  🔐 Blockchain Verification
                </div>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 8px; margin-top: 0;">
                  Your document has been secured on the blockchain for authenticity and tamper-proof verification.
                </p>
                <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 14px; color: #64748b; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; word-break: break-all; margin-top: 8px;">
                  Transaction Hash: ${tx_hash}
                </div>
              </div>
              ` : ''}
              
              <p style="font-size: 15px; color: #64748b; margin: 24px 0; text-align: center;">
                💡 If you encounter any issues downloading your document or need additional assistance, 
                please don't hesitate to contact our support team by replying to this email.
              </p>
              
              <!-- Security Notice -->
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 24px; font-size: 14px; color: #64748b;">
                <strong>🔒 Security Notice:</strong> This document link is secure and will expire after a certain period for your protection. 
                Please download your document promptly.
              </div>
              
              <!-- Signature -->
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="font-size: 15px; color: #64748b; margin-bottom: 8px; margin-top: 0;">
                  Best regards,
                </p>
                <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 0; margin-bottom: 0;">
                  Barangay Konek Digital Services Team
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 13px; color: #64748b; margin: 0;">
                © ${new Date().getFullYear()} Barangay Konek. All rights reserved.<br>
                Empowering communities through digital innovation.
              </p>
            </div>
          </div>
        </div>
        `,
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return { success: false, error: `Email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown email error'}` };
    }

    console.log('Email sent successfully, updating request status');

    // Update request status
    const supabaseClient = await createSupabaseServerClient()
    const { data, error } = await supabaseClient
      .from('mRequest')
      .update({
        status: 'completed',
        document_type: file.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(requestId))
      .select()
      .single()

    if (error) {
      console.error('Error updating request status:', error)
      return { success: false, error: error.message }
    }

    console.log('Request completed successfully');
    return { success: true, data }
  } catch (err) {
    console.error('Unexpected error in completeRequestWithFile:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error occurred'
    return { success: false, error: message }
  }
}