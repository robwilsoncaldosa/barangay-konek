import Link from 'next/link'

export function LoginLinks() {
  return (
    <div className="space-y-4 text-center">
      <Link 
        href="/forgot-password" 
        className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
      >
        Forgot Password?
      </Link>
      <div className="text-muted-foreground">
         Don&apos;t have an account?{' '}
         <Link 
           href="/register" 
           className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
         >
           Create Account
         </Link>
       </div>
    </div>
  )
}