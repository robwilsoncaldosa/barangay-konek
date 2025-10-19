"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RegistrationData, CreateUserData } from "@/lib/types"
import { REGISTRATION_CONSTANTS } from "@/lib/constants"
import { registerUser } from "@/server/user"

export function useRegistration() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<RegistrationData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegistration = async (data: RegistrationData) => {
    setFormData(data)
    setShowConfirmation(true)
    // Don't actually complete the form yet, just show the confirmation dialog
    return false // This prevents the form from completing
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    
    try {
      // Convert form data to the format expected by the server
      const userData: CreateUserData = {
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        middle_name: formData.middle_name || '',
        email: formData.email || '',
        password: formData.password || '',
        birthdate: formData.birthdate || '',
        permanent_address: formData.address || '', // Map address to permanent_address
        permanent_barangay: formData.barangay || '', // Map barangay to permanent_barangay
        current_address: formData.address || '', // Use same address for current
        current_barangay: formData.barangay || '', // Use same barangay for current
        contact_no: formData.contact_number || '', // Map contact_number to contact_no
        mbarangayid: formData.mbarangayid || 1, // Default barangay ID
        user_type: formData.user_type || 'resident'
      }

      const result = await registerUser(userData)
      
      if (result.success) {
        console.log("Registration successful:", result.data)
        setShowConfirmation(false)
        
        // Redirect to thank you page
        router.push(REGISTRATION_CONSTANTS.THANK_YOU_ROUTE)
      } else {
        console.error("Registration failed:", result.error)
        // Handle error - could show error message to user
        alert(`Registration failed: ${result.error}`)
      }
    } catch (error) {
      console.error("Unexpected registration error:", error)
      alert("An unexpected error occurred during registration")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    // Just close the dialog, stay on the current step
  }

  const handleStepChange = (prev: number, next: number) => {
    console.log(`Moving from step ${prev} to ${next}`)
  }

  return {
    showConfirmation,
    setShowConfirmation,
    formData,
    isSubmitting,
    handleRegistration,
    handleConfirm,
    handleCancel,
    handleStepChange
  }
}