import * as React from "react"
import Image from "next/image"
import { getBarangays } from "@/server/barangay"
import { REGISTRATION_CONSTANTS } from "@/lib/constants"
import { RegistrationClient } from "./_components/registration-client"

// Logo component for reusability
function RegistrationLogo() {
  return (
    <div className="w-16 h-16 md:w-24 md:h-24">
      <Image
        src={REGISTRATION_CONSTANTS.LOGO_PATH}
        alt="Logo"
        width={100}
        height={100}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

interface RegisterPageProps {
  searchParams: { role?: string }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  // Extract role from search params, default to 'resident'
  const role = searchParams.role === 'official' ? 'official' : 'resident'
  
  // Fetch barangays server-side
  const barangaysResult = await getBarangays()
  const barangays = barangaysResult.success ? barangaysResult.data || [] : []

  return (
    <div className="min-h-dvh w-full bg-background">
      <div className={`w-full max-w-none ${REGISTRATION_CONSTANTS.FORM_MAX_WIDTH} md:mx-auto h-full min-h-dvh flex flex-col`}>
        <RegistrationClient
          barangays={barangays}
          logo={<RegistrationLogo />}
          userType={role}
        />
      </div>
    </div>
  )
}