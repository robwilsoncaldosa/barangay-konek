'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '@/server/certificate'

type CertificateParams = {
  id: number
  name: string
  fee: number
  requirements?: string
  processing_time?: string
}

export default function CertificatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<CertificateParams[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // modal states
  const [showModal, setShowModal] = useState(false)
  const [editingCert, setEditingCert] = useState<CertificateParams | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    fee: '',
    requirements: '',
    processing_time: '',
  })

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/official/login')
      return
    }
    const userType = JSON.parse(user).user_type
    if (userType !== 'official') {
      router.push('/official/login')
      return
    }

    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const data = await getCertificates()
      setCertificates(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      startTransition(async () => {
        const res = await deleteCertificate(String(id))
        if (res.success) {
          setCertificates((prev) => prev.filter((c) => c.id !== id))
        } else {
          alert(res.error)
        }
      })
    }
  }

  const handleAdd = () => {
    setEditingCert(null)
    setFormData({
      name: '',
      fee: '',
      requirements: '',
      processing_time: '',
    })
    setShowModal(true)
  }

  const handleEdit = (cert: CertificateParams) => {
    setEditingCert(cert)
    setFormData({
      name: cert.name,
      fee: String(cert.fee),
      requirements: cert.requirements || '',
      processing_time: cert.processing_time || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        fee: Number(formData.fee),
        requirements: formData.requirements.trim(),
        processing_time: formData.processing_time.trim(),
      }

      if (editingCert) {
        // update
        const res = await updateCertificate(String(editingCert.id), payload)
        if (res.success) {
          setCertificates((prev) =>
            prev.map((c) =>
              c.id === editingCert.id ? { ...c, ...payload } : c
            )
          )
          setShowModal(false)
        } else {
          alert(res.error)
        }
      } else {
        // add new
        const res = await createCertificate(payload)
        if (res.success && res.data) {
          const newCert = Array.isArray(res.data) ? res.data[0] : res.data
          setCertificates((prev) => [...prev, newCert])
          setShowModal(false)
        } else {
          alert(res.error)
        }
      }
    })
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center my-4">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Certificate
        </button>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Fee</th>
            <th className="border px-4 py-2">Processing Time</th>
            <th className="border px-4 py-2">Requirements</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td className="border px-4 py-2">{cert.id}</td>
              <td className="border px-4 py-2">{cert.name}</td>
              <td className="border px-4 py-2">
                ₱{cert.fee?.toFixed(2) ?? '0.00'}
              </td>
              <td className="border px-4 py-2">{cert.processing_time || '-'}</td>
              <td className="border px-4 py-2">{cert.requirements || '-'}</td>
              <td className="border px-4 py-2 text-center space-x-3">
                <button
                  onClick={() => handleEdit(cert)}
                  className="text-blue-600 hover:underline"
                  disabled={isPending}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="text-red-600 hover:underline"
                  disabled={isPending}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingCert ? 'Edit Certificate' : 'Add Certificate'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Fee</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, fee: e.target.value }))
                  }
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Processing Time</label>
                <input
                  type="text"
                  value={formData.processing_time}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      processing_time: e.target.value,
                    }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, requirements: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isPending}
                >
                  {editingCert ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
