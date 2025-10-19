import Image from 'next/image'
import { LoginHeader } from './login-header'
import { LoginForm } from './login-form'
import { LoginLinks } from './login-links'

interface FormSectionProps {
  action: (formData: FormData) => Promise<void>
}

export function FormSection({ action }: FormSectionProps) {
  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 shadow">
      <div className="w-full max-w-md space-y-8">
        {/* Logo at the top */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Image
            src="/logo.png"
            alt="Barangay Konek Logo"
            width={80}
            height={80}
            className="drop-shadow-sm"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">BARANGAY</h1>
            <h1 className="text-2xl font-bold text-primary">KONEK</h1>
          </div>
        </div>

        <LoginHeader />
        <LoginForm action={action} />
        <LoginLinks />
      </div>
    </div>
  )
}