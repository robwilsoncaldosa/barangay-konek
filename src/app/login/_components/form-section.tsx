import Image from 'next/image'
import { LoginForm } from './login-form'
import { LoginLinks } from './login-links'

interface FormSectionProps {
  action: (formData: FormData) => Promise<void>
}

export function FormSection({ action }: FormSectionProps) {
  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white shadow-md">
      <div className="w-full max-w-md space-y-8">
        {/* Logo at the top */}
        <div className="flex flex-col items-center text-center space-y-6">
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={200}
            priority
          />
        </div>
        <LoginForm action={action} />
        <LoginLinks />
      </div>
    </div>
  )
}