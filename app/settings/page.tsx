'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Key, User, CreditCard, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      setName(session.user.name || '')
      loadApiKeys()
    }
  }, [status, session, router])

  const loadApiKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-keys')
      if (res.ok) {
        const data = await res.json()
        if (data.apiKeys.length > 0) {
          setApiKey('••••••••••••••••') // Mask existing key
          setModel(data.apiKeys[0].model || '')
        }
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey === '••••••••••••••••') {
      toast.error('Please enter a valid API key')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openrouter',
          key: apiKey,
          model,
          name: 'OpenRouter API Key',
        }),
      })

      if (res.ok) {
        toast.success('API key saved!')
        loadApiKeys()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save API key')
      }
    } catch (error) {
      toast.error('Failed to save API key')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Page Creator
            </Link>
            <Link href="/" className="text-gray-600 hover:text-purple-600">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* API Keys Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">API Keys</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - Use your own OpenRouter API key for unlimited usage
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Model (optional)
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="google/gemini-2.0-flash-lite-001"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            <button
              onClick={handleSaveApiKey}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save API Key'}
            </button>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Default Backend Agent:</strong> Using Gemini 2.0 Flash Thinking Exp for intelligent decision-making
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Subscription</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Current Plan: Free Tier</p>
              <p className="text-sm text-gray-600 mt-1">
                • 10 pages per month<br />
                • 100 history entries per month<br />
                • Pages shared by default
              </p>
            </div>

            <Link
              href="/pricing"
              className="block text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Upgrade to Pro - $5/month
            </Link>

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Pro Plan Benefits:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Unlimited pages</li>
                <li>Unlimited history entries</li>
                <li>Private pages option</li>
                <li>Manual code editing</li>
                <li>Duplicate community pages</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
