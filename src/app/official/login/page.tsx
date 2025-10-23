// official/login/page.tsx (FIXED: Added useEffect)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '../../../server/auth';

const OfficialLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  // 1. Client-side Protection Fallback
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.user_type === "official") {
          router.push("/official");
        } else if (user.user_type === "super_admin") {
          router.push("/admin");
        }
      } catch (e) {
        console.log("message", e);
      }
    }
  }, [router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Logging in...')

    try {
      const result = await loginUser(email, password)

      if (!result.success) {
        setMessage(`❌ ${result.error || 'Login failed'}`)
        return
      }

      localStorage.setItem('user', JSON.stringify(result.user))

      // 2. Client-side redirect after successful login
      switch (result.user?.user_type) {
        case 'official':
          router.push('/official')
          break
        case 'resident':
          router.push('/resident')
          break
        case 'super_admin':
          router.push('/admin')
          break
        default:
          router.push('/')
      }
    } catch (err) {
      console.error('Login failed:', err)
      setMessage('❌ Unexpected error occurred.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
      </div>
    </div>
  )
}

export default OfficialLogin