import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import ResetPasswordForm from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}