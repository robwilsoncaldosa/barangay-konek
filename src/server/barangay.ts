'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '../../database.types'

type Barangay = Database['public']['Tables']['mBarangay']['Row']
type BarangayInsert = Database['public']['Tables']['mBarangay']['Insert']
type BarangayUpdate = Database['public']['Tables']['mBarangay']['Update']

export async function getBarangays(): Promise<{ success: boolean; data?: Barangay[]; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mBarangay')
      .select('*')
      .eq('del_flag', 0)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching barangays:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching barangays:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getBarangayById(id: number): Promise<{ success: boolean; data?: Barangay; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mBarangay')
      .select('*')
      .eq('id', id)
      .eq('del_flag', 0)
      .single()

    if (error) {
      console.error('Error fetching barangay by ID:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to fetch barangay' }
  }
}

export async function createBarangay(
  barangayData: Pick<BarangayInsert, 'name' | 'city' | 'province'>
): Promise<{ success: boolean; data?: Barangay; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const insertData: BarangayInsert = {
      name: barangayData.name,
      city: barangayData.city,
      province: barangayData.province,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      del_flag: 0
    }

    const { data, error } = await supabase
      .from('mBarangay')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating barangay:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function updateBarangay(
  barangayId: string, 
  barangayData: Pick<BarangayUpdate, 'name' | 'city' | 'province'>
): Promise<{ success: boolean; data?: Barangay; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const updateData: BarangayUpdate = {
      ...barangayData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('mBarangay')
      .update(updateData)
      .eq('id', Number(barangayId))
      .select()
      .single()

    if (error) {
      console.error('Error updating barangay:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function deleteBarangay(barangayId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Soft delete by setting del_flag to 1
    const { error } = await supabase
      .from('mBarangay')
      .update({ 
        del_flag: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(barangayId))

    if (error) {
      console.error('Error deleting barangay:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}