import type { Database } from '../../database.types'

type UserInsert = Database['public']['Tables']['mUsers']['Insert']

export interface RegistrationData {
  // Personal Info
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  password?: string
  birthdate?: string
  
  // Address Details (form field names)
  address?: string
  barangay?: string
  contact_number?: string
  
  // Database field names (for mapping)
  permanent_address?: string
  permanent_barangay?: string
  current_address?: string
  current_barangay?: string
  contact_no?: string
  
  // User type and barangay
  user_type?: 'official' | 'resident'
  mbarangayid?: number

  // Voter's Details (commented out for now)
  // votersId?: string
  // precinctNumber?: string

  [key: string]: unknown
}

// Type for creating user that matches server function
export type CreateUserData = Pick<UserInsert, 
  'first_name' | 'last_name' | 'email' | 'password' | 'birthdate' | 
  'permanent_address' | 'permanent_barangay' | 'current_address' | 
  'current_barangay' | 'contact_no' | 'middle_name' | 'mbarangayid' | 'user_type'
>

export interface FormSection {
  title: string
  fields: FormField[]
}

export interface FormField {
  key: keyof RegistrationData
  label: string
  displayValue?: string
}

export interface StepIndicator {
  icon: React.ReactNode
  label: string
}