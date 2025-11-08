'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Page {
  id: string
  title: string
  screenshot: string | null
  upvotes: number
  downvotes: number
  createdAt: string
  user?: {
    name: string | null
    email: string
  }
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myPages, setMyPages] = useState<Page[]>([])
  const [communityPages, setCommunityPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [session])

  const fetchPages = async () => {
    try {
      setLoading(true)
      
      // Fetch community pages
      const communityRes = await fetch('/api/pages?type=community')
      if (communityRes.ok) {
        const data = await communityRes.json()
        setCommunityPages(data.pages || [])
      }

      // Fetch user's pages if logged in
      if (session?.user) {
        const myRes = await fetch('/api/pages?type=my')
        if (myRes.ok) {
          const data = await myRes.json()
          setMyPages(data.pages || [])
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pageId: string, type: 'up' | 'down') => {
    if (!session?.user) {
      toast.error('Please sign in to vote')
      return
    }

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, type }),
      })

      if (res.ok) {
        toast.success('Vote recorded!')
        fetchPages() // Refresh pages
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to vote')
      }
    } catch (error) {
      toast.error('Failed to vote')
    }
  }

  const handleDuplicate = async (page: Page) => {
    if (!session?.user) {
      toast.error('Please sign in to duplicate')
      return
    }

    toast.error('Duplication feature coming soon - requires paid plan')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Page Creator
          </Link>
          <div className="flex gap-4 items-center">
            {session?.user ? (
              <>
                <Link href="/chat" className="text-gray-700 hover:text-purple-600 transition">
                  Create Page
                </Link>
                <Link href="/settings" className="text-gray-700 hover:text-purple-600 transition">
                  Settings
                </Link>
                <Link href="/api/auth/signout" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-purple-600 transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered HTML Page Creation</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Beautiful Pages with AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Transform your ideas into stunning HTML pages using AI. 
            Edit with precision using our intelligent line-stitching technology.
          </p>
          
          <button
            onClick={() => session?.user ? router.push('/chat') : router.push('/auth/signup')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:opacity-90 transition shadow-lg hover:shadow-xl"
          >
            {session?.user ? 'Create Your Page' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User's Pages Section */}
      {session?.user && myPages.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-6">Your Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {myPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
                onClick={() => router.push(`/view/${page.id}`)}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {page.screenshot ? (
                    <Image
                      src={page.screenshot}
                      alt={page.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No preview</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{page.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {page.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4" />
                      {page.downvotes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Pages Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Community Showcase</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : communityPages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No community pages yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div
                  className="aspect-video bg-gray-100 flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedPage(page)}
                >
                  {page.screenshot ? (
                    <Image
                      src={page.screenshot}
                      alt={page.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No preview</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{page.title}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    by {page.user?.name || page.user?.email || 'Anonymous'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleVote(page.id, 'up')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {page.upvotes}
                    </button>
                    <button
                      onClick={() => handleVote(page.id, 'down')}
                      className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {page.downvotes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing community page */}
      {selectedPage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{selectedPage.title}</h2>
                <p className="text-gray-600">
                  by {selectedPage.user?.name || selectedPage.user?.email || 'Anonymous'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicate(selectedPage)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Duplicate This Page
                </button>
                <button
                  onClick={() => setSelectedPage(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedPage.screenshot ? (
                <Image
                  src={selectedPage.screenshot}
                  alt={selectedPage.title}
                  width={800}
                  height={600}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  No preview available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
