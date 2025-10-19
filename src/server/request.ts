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

interface RequestWithUser extends Request {
  resident_email: string
}

export async function getRequests(filters?: {
  resident_id?: string
  status?: string
}): Promise<RequestWithUser[]> {
  try {
    const supabase = await createSupabaseServerClient()
    let query = supabase.from('mRequest').select('*').order('id', { ascending: true })

    if (filters?.resident_id) {
      query = query.eq('resident_id', Number(filters.resident_id))
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('Error fetching requests:', error)
      return []
    }

    if (!requests) return []

    // Fetch users for resident_ids
    const residentIds = [...new Set(requests.map((r: Request) => r.resident_id))]
    const { data: users, error: usersError } = await supabase
      .from('mUsers')
      .select('id, email')
      .in('id', residentIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return requests.map(request => ({
        ...request,
        resident_email: 'Unknown'
      }))
    }

    // Map users to requests
    const requestsWithUsers = requests.map((request: Request) => {
      const user = users?.find((u: Pick<User, 'id' | 'email'>) => u.id === request.resident_id)
      return {
        ...request,
        resident_email: user?.email || 'Unknown'
      }
    })

    return requestsWithUsers
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

export async function createRequest(requestData: {
  mCertificateId: number
  resident_id: number
  purpose: string
  document_type?: string
  request_date?: string
  priority?: string
}): Promise<{ success: boolean; data?: Request; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const insertData: RequestInsert = {
      mCertificateId: requestData.mCertificateId,
      resident_id: requestData.resident_id,
      purpose: requestData.purpose,
      document_type: requestData.document_type || '',
      request_date: requestData.request_date || new Date().toISOString().split('T')[0],
      priority: requestData.priority || 'Normal',
      status: 'pending',
      payment_status: 'unpaid',
      del_flag: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
  documentType?: string
): Promise<{ success: boolean; data?: Request; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const updateData: RequestUpdate = {
      status,
      updated_at: new Date().toISOString(),
      ...(documentType && { document_type: documentType })
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
    const { error } = await supabase
      .from('mRequest')
      .delete()
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