'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginUser(email: string, password: string) {
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

    // Create a proper Supabase auth session using signInWithPassword
    // First, we need to sign them in with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (authError) {
      // If Supabase auth fails, create a custom session
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
    }

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