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
    
    // Set user session cookie for middleware
    const userSession = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      user_type: user.user_type
    }
    
    cookieStore.set('user-session', JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Legacy cookie for backward compatibility
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

    // Return user data without password
    return {
      success: true,
      user: userSession
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
    cookieStore.set('user-session', '', { path: '/', maxAge: 0 })

    return { success: true, message: 'Logged out successfully' }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export async function authenticateUser(email: string, password: string) {
  const result = await loginUser(email, password)
  return result
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address' }
  }

  try {
    const supabase = await createSupabaseServerClient()

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('mUsers')
      .select('email')
      .eq('email', email)
      .eq('del_flag', 0)
      .single()

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return { success: true }
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return { error: 'Failed to send reset email. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Forgot password error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const accessToken = formData.get('access_token') as string
  const refreshToken = formData.get('refresh_token') as string

  if (!password || !accessToken || !refreshToken) {
    return { error: 'Missing required parameters' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' }
  }

  try {
    const supabase = await createSupabaseServerClient()

    // Set the session using the tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !sessionData.user) {
      return { error: 'Invalid or expired reset link' }
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return { error: 'Failed to update password. Please try again.' }
    }

    // Hash the new password for our database
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update the password in our users table
    if (sessionData.user.email) {
      const { error: dbError } = await supabase
        .from('mUsers')
        .update({ password: hashedPassword })
        .eq('email', sessionData.user.email)

      if (dbError) {
        console.error('Database password update error:', dbError)
        // Don't return error here as Supabase auth password is already updated
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}