'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '../../database.types'

type User = Database['public']['Tables']['mUsers']['Row']
type UserInsert = Database['public']['Tables']['mUsers']['Insert']
type UserUpdate = Database['public']['Tables']['mUsers']['Update']

interface CustomAuthUser {
  id: number
  email: string
  user_type: 'official' | 'resident'
  mbarangayid: number
}

export interface AuthUser {
  id: number
  email: string
  user_metadata: {
    user_type: 'official' | 'resident'
    mbarangayid: number
  }
}

export async function getUser(): Promise<AuthUser | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()

    // Check for custom auth cookie
    const customAuthCookie = cookieStore.get('custom-auth-user')

    if (customAuthCookie) {
      try {
        const userData: CustomAuthUser = JSON.parse(customAuthCookie.value)
        return {
          id: userData.id,
          email: userData.email,
          user_metadata: {
            user_type: userData.user_type,
            mbarangayid: userData.mbarangayid
          }
        }
      } catch (parseError) {
        console.error('Error parsing custom auth cookie:', parseError)
      }
    }

    // If no custom auth, return null (user not authenticated)
    return null
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mUsers')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function getUsersByType(userType: 'official' | 'resident' = 'official'): Promise<User[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('mUsers')
      .select('*')
      .eq('user_type', userType)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching users by type:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function createUser(userData: {
  first_name: string
  last_name: string
  email: string
  password: string
  birthdate: string
  permanent_address: string
  permanent_barangay: string
  current_address: string
  current_barangay: string
  contact_no: string
  middle_name?: string
  mbarangayid: number
  user_type: 'official' | 'resident'
}): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const insertData: UserInsert = {
      ...userData,
      sign_up_status: 'pending',
      del_flag: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('mUsers')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function updateUser(
  userId: string, 
  userData: Partial<{
    first_name: string
    last_name: string
    email: string
    password: string
    birthdate: string
    permanent_address: string
    permanent_barangay: string
    current_address: string
    current_barangay: string
    contact_no: string
    middle_name: string
    mbarangayid: number
    user_type: 'official' | 'resident'
    sign_up_status: string
  }>
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const updateData: UserUpdate = {
      ...userData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('mUsers')
      .update(updateData)
      .eq('id', Number(userId))
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
      .from('mUsers')
      .delete()
      .eq('id', Number(userId))

    if (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function handleUserRedirect(user: AuthUser | null) {
  if (!user) return

  const userType = user.user_metadata?.user_type

  switch (userType) {
    case 'official':
      return '/official'
    case 'resident':
      return '/resident'
    default:
      return '/dashboard'
  }
}