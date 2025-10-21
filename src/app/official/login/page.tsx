'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { loginUser } from '../../../server/auth';

const OfficialLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

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

      switch (result.user?.user_type) {
        case 'official':
          router.push('/official')
          break
        case 'resident':
          router.push('/resident')
          break
        case 'admin':
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
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Official Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <a
            href="/official/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </a>
          <a
            href="/register/official?userType=official"
            className="text-blue-600 hover:underline"
          >
            Create Account
          </a>
        </div>

        {message && <p className="mt-2 text-center text-gray-600">{message}</p>}
      </div>
    </div>
  )
}

export default OfficialLogin
