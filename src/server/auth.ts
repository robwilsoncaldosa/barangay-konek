'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '../../database.types'

type User = Database['public']['Tables']['mUsers']['Row']

// Types for better type safety
export interface LoginResult {
  success: boolean
  error?: string
  user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'user_type'>
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    const supabase = await createSupabaseServerClient()

    // Fetch user from your custom table
    const { data: user, error } = await supabase
      .from('mUsers')
      .select('*')
      .eq('email', email)
      .eq('del_flag', 0) // Only get active users
      .single()

    if (error || !user) {
      return { success: false, error: 'User not found' }
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { success: false, error: 'Invalid password' }
    }

    // Check account approval
    if (user.sign_up_status !== 'approved') {
      return {
        success: false,
        error: `Account is ${user.sign_up_status}. Please contact admin.`
      }
    }

    // Check if user is not deleted
    if (user.del_flag === 1) {
      return { success: false, error: 'Account not found' }
    }

    // Create a custom session since we're using our own password hashing
    const cookieStore = await cookies()
    cookieStore.set('custom-auth-user', JSON.stringify({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      mbarangayid: user.mbarangayid
    }), {
      path: '/',
      maxAge: 3600, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })

    return {
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_type: user.user_type,
      },
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

// Dedicated server action for resident login with proper redirect handling
export async function loginResidentAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Server-side validation
  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  // Additional email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect('/login?error=' + encodeURIComponent('Please enter a valid email address'))
  }

  const result = await loginUser(email, password)
  
  if (result.success) {
    // Redirect based on user type
    const userType = result.user?.user_type
    switch (userType) {
      case 'resident':
        redirect('/resident')
        break
      case 'admin':
        redirect('/admin')
        break
      case 'official':
        redirect('/official')
        break
      default:
        redirect('/resident') // Default fallback
    }
  } else {
    redirect(`/login?error=${encodeURIComponent(result.error || 'Login failed')}`)
  }
}

export async function logoutUser() {
  try {
    const supabase = await createSupabaseServerClient()
    const cookieStore = await cookies()

    // Sign out from Supabase auth
    await supabase.auth.signOut()

    // Clear custom authentication cookies
    cookieStore.set('custom-auth-user', '', { path: '/', maxAge: 0 })

    return { success: true, message: 'Logged out successfully' }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function authenticateUser(email: string, password: string) {
  const result = await loginUser(email, password)

  if (result.success) {
    // Redirect to dashboard or appropriate page after successful login
    redirect('/dashboard')
  }

  return result
}