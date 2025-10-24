'use server'

import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '../../database.types'

type Request = Database['public']['Tables']['mRequest']['Row']
type RequestInsert = Database['public']['Tables']['mRequest']['Insert']
type RequestUpdate = Database['public']['Tables']['mRequest']['Update']
type User = Database['public']['Tables']['mUsers']['Row']
type Certificate = Database['public']['Tables']['mCertificate']['Row'] // Added Certificate type

interface RequestWithUserAndCertificate extends Request {
  resident_name: string
  certificate_name: string
  certificate_fee: number
}

interface CompleteRequestParams {
  requestId: string
  email: string
  file: File
  tx_hash: string
}

// NOTE: I'm updating the 'mUsers' select to include name fields and using a JOIN for mCertificate.

export async function getRequests(filters?: {
  resident_id?: string
  status?: Pick<Request, 'status'>['status']
}): Promise<RequestWithUserAndCertificate[]> { // Updated return type
  try {
    const supabase = await createSupabaseServerClient()
    
    // 1. Initial query using Supabase JOIN syntax
    let query = supabase
      .from('mRequest')
      .select('*, mCertificate(name, fee)') // Fetch request data PLUS certificate name and fee
      .eq('del_flag', 0)
      .order('id', { ascending: true })

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
        error: any;
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
      .select('id, first_name, middle_name, last_name')
      .in('id', residentIds)

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

      return {
        ...request,
        resident_name: residentName,        // Corrected property name
        certificate_name: certificateDetails.name,
        certificate_fee: certificateDetails.fee,
      } as RequestWithUserAndCertificate // Cast to the final type
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
    // Save the file
    const uploadDir = path.join(process.cwd(), 'uploads')
    fs.mkdirSync(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`)

    // Read file as arrayBuffer and write to disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

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
              ${tx_hash
          ? `<p style="color: #374151; font-size: 15px; line-height: 1.6;">
                      Blockchain transaction: <a href="https://sepolia-blockscout.lisk.com/tx/${tx_hash}">${tx_hash}</a>
                     </p>`
          : ""
        }
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
      attachments: [{ filename: file.name, path: filePath }],
    })

    // Update request status
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
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
      console.error('Error updating request:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Unexpected error in completeRequestWithFile:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error occurred'
    return { success: false, error: message }
  }
}