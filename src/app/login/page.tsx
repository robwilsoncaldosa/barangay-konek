'use client'

import { loginResidentAction } from '@/server/auth'
import { BrandingSection } from './_components/branding-section'
import { FormSection } from './_components/form-section'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role')
  
  return (
    <div className="min-h-screen flex">
      <BrandingSection />
      <FormSection action={loginResidentAction} role={role} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
