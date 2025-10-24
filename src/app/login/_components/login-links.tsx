import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LoginLinks() {
  return (
    <div className="flex flex-col space-y-2 text-center text-sm">
      <Link href="/forgot-password">
        <Button variant="link" className="p-0 h-auto text-sm">
          Forgot your password?
        </Button>
      </Link>
      <div className="text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/role-selection">
          <Button variant="link" className="p-0 h-auto text-sm">
            Sign up
          </Button>
        </Link>
      </div>
    </div>
  )
}