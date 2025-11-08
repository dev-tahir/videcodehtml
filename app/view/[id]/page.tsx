'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Edit, Eye, History, Code } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const pageId = params?.id as string
  
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'preview' | 'edit' | 'history'>('preview')
  const [editedContent, setEditedContent] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (pageId) {
      loadPage()
    }
  }, [pageId])

  const loadPage = async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`)
      if (!res.ok) {
        toast.error('Page not found or not accessible')
        router.push('/')
        return
      }
      
      const data = await res.json()
      setPage(data.page)
      setEditedContent(data.page.content)
      
      if (data.page.isOwner) {
        loadHistory()
      }
    } catch (error) {
      console.error('Error loading page:', error)
      toast.error('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}/history`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      })

      if (res.ok) {
        toast.success('Page saved!')
        loadPage()
        setMode('preview')
      } else {
        toast.error('Failed to save page')
      }
    } catch (error) {
      toast.error('Failed to save page')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!page) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-sm text-gray-600 hover:text-purple-600">
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold mt-2">{page.title}</h1>
              <p className="text-sm text-gray-600">
                by {page.user?.name || page.user?.email || 'Anonymous'}
              </p>
            </div>
            
            {page.isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('preview')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    mode === 'preview' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    mode === 'edit' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Edit Code
                </button>
                <button
                  onClick={() => setMode('history')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    mode === 'history' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <Link
                  href={`/chat/${pageId}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit with AI
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {mode === 'preview' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              srcDoc={page.content}
              className="w-full h-[calc(100vh-200px)]"
              title="Page Preview"
            />
          </div>
        )}

        {mode === 'edit' && page.isOwner && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit HTML Code</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('preview')}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-[calc(100vh-300px)] font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>
        )}

        {mode === 'history' && page.isOwner && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Edit History</h2>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-600">No history yet</p>
              ) : (
                history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setEditedContent(entry.content)
                      setMode('preview')
                      toast.success(`Viewing version from ${new Date(entry.createdAt).toLocaleString()}`)
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Version {history.length - index}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
