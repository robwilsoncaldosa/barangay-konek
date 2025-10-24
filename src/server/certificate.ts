'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '../../database.types'

type Certificate = Database['public']['Tables']['mCertificate']['Row']
type CertificateInsert = Database['public']['Tables']['mCertificate']['Insert']
type CertificateUpdate = Database['public']['Tables']['mCertificate']['Update']

export async function getCertificates(filters?: {
  resident_id?: string
}): Promise<Certificate[]> {
  try {
    const supabase = await createSupabaseServerClient()
    
    if (filters?.resident_id) {
      // For residents, get certificates they have requested
      const { data: requests, error: requestError } = await supabase
        .from('mRequest')
        .select('mCertificateId')
        .eq('resident_id', Number(filters.resident_id))
        .eq('del_flag', 0)

      if (requestError) {
        console.error('Error fetching user requests:', requestError)
        return []
      }

      const certificateIds = [...new Set(requests?.map(req => req.mCertificateId).filter(id => id !== null) || [])]
      
      if (certificateIds.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from('mCertificate')
        .select('*')
        .in('id', certificateIds)
        .eq('del_flag', 0)
        .order('id', { ascending: true })

      if (error) {
        console.error('Error fetching certificates:', error)
        return []
      }

      return data || []
    } else {
      // For officials/admins, get all certificates
      const { data, error } = await supabase
        .from('mCertificate')
        .select('*')
        .eq('del_flag', 0)
        .order('id', { ascending: true })

      if (error) {
        console.error('Error fetching certificates:', error)
        return []
      }

      return data || []
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function getCertificateById(certificateId: string): Promise<Certificate | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mCertificate')
      .select('*')
      .eq('id', Number(certificateId))
      .single()

    if (error) {
      console.error('Error fetching certificate by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function createCertificate(
  certificateData: Pick<CertificateInsert, 'name' | 'requirements' | 'fee'>
): Promise<{ success: boolean; data?: Certificate; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const insertData: CertificateInsert = {
      name: certificateData.name,
      requirements: certificateData.requirements,
      fee: certificateData.fee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      del_flag: 0
    }

    const { data, error } = await supabase
      .from('mCertificate')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating certificate:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function updateCertificate(
  certificateId: string, 
  certificateData: Pick<CertificateUpdate, 'name' | 'requirements' | 'fee'>
): Promise<{ success: boolean; data?: Certificate; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const updateData: CertificateUpdate = {
      ...certificateData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('mCertificate')
      .update(updateData)
      .eq('id', Number(certificateId))
      .select()
      .single()

    if (error) {
      console.error('Error updating certificate:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function deleteCertificate(
  certificateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Soft delete by setting del_flag to 1
    const { error } = await supabase
      .from('mCertificate')
      .update({ 
        del_flag: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(certificateId))

    if (error) {
      console.error('Error deleting certificate:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
