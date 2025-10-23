import Link from 'next/link'

export function LoginLinks() {
  return (
    <div className="space-y-4 text-center">
      <Link 
        href="/forgot-password" 
        className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 block"
      >
        Forgot password
      </Link>
      <div className="text-muted-foreground">
         Don&apos;t have an account?{' '}
         <Link 
           href="/role-selection" 
           className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
         >
           Sign up
         </Link>
       </div>
    </div>
  )
}