import { loginResidentAction } from '@/server/auth'
import { BrandingSection } from './_components/branding-section'
import { FormSection } from './_components/form-section'

export default function ResidentLoginPage() {
  return (
    <div className="min-h-screen bg-muted flex">
      <BrandingSection />
      <FormSection action={loginResidentAction} />
    </div>
  )
}
