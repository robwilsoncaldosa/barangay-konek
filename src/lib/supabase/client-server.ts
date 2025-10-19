import { createSupabaseServerClient } from './server'

/**
 * Get a reusable Supabase server client instance
 * This function creates a new client for each request to ensure proper cookie handling
 */
export async function getSupabaseServer() {
  return await createSupabaseServerClient()
}

/**
 * Utility function to get authenticated user from Supabase
 */
export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}