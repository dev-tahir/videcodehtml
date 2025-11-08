'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Send, Sidebar, Maximize2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  type?: 'create' | 'edit' | 'answer'
  edits?: any[]
}

const MODELS = [
  { id: 'google/gemini-2.0-flash-lite-001', name: 'Gemini 2.0 Flash', description: 'Fast & efficient' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most capable' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Multimodal' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Balanced' },
]

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const pageId = params?.pageId as string | undefined
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [currentPageContent, setCurrentPageContent] = useState<string | null>(null)
  const [currentPageId, setCurrentPageId] = useState<string | null>(pageId || null)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [pageHistory, setPageHistory] = useState<string[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (pageId) {
      loadPage(pageId)
    }
  }, [pageId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadPage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCurrentPageContent(data.page.content)
        setCurrentPageId(id)
        setShowSidebar(true)
        setPageHistory([data.page.content])
        setHistoryIndex(0)
      }
    } catch (error) {
      console.error('Failed to load page:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) {
      if (!selectedModel) {
        toast.error('Please select a model first')
      }
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      if (!currentPageId) {
        // Generate new page
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: input,
            model: selectedModel,
            title: input.slice(0, 50),
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || 'Failed to generate page')
          setLoading(false)
          return
        }

        setCurrentPageId(data.page.id)
        setCurrentPageContent(data.page.content)
        setShowSidebar(true)
        setPageHistory([data.page.content])
        setHistoryIndex(0)

        const assistantMessage: Message = {
          role: 'assistant',
          content: 'Page created successfully!',
          type: 'create',
        }
        setMessages(prev => [...prev, assistantMessage])
        toast.success('Page created!')
      } else {
        // Edit existing page
        const res = await fetch('/api/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: currentPageId,
            prompt: input,
            model: selectedModel,
            conversationHistory: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || 'Failed to edit page')
          setLoading(false)
          return
        }

        setCurrentPageContent(data.content)
        setPageHistory(prev => [...prev, data.content])
        setHistoryIndex(prev => prev + 1)

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response.message || 'Page updated successfully!',
          type: data.response.type,
          edits: data.response.edits,
        }
        setMessages(prev => [...prev, assistantMessage])
        toast.success('Page updated!')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const goToHistoryState = (index: number) => {
    if (index >= 0 && index < pageHistory.length) {
      setCurrentPageContent(pageHistory[index])
      setHistoryIndex(index)
      toast.success(`Showing version ${index + 1} of ${pageHistory.length}`)
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Preview */}
      {showSidebar && (
        <div className="w-1/2 border-r bg-white flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Page Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => goToHistoryState(historyIndex - 1)}
                disabled={historyIndex <= 0}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 self-center">
                {historyIndex + 1} / {pageHistory.length}
              </span>
              <button
                onClick={() => goToHistoryState(historyIndex + 1)}
                disabled={historyIndex >= pageHistory.length - 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {currentPageContent ? (
              <iframe
                srcDoc={currentPageContent}
                className="w-full h-full border rounded"
                title="Page Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No page content
              </div>
            )}
          </div>
          {currentPageId && (
            <div className="p-4 border-t">
              <Link
                href={`/view/${currentPageId}`}
                className="block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                View Full Page
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${showSidebar ? '' : 'max-w-4xl mx-auto w-full'}`}>
        {/* Header */}
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Page Creator
          </Link>
          {currentPageContent && !showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            >
              <Sidebar className="w-4 h-4" />
              Show Preview
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && !selectedModel && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose Your AI Model</h2>
              <p className="text-gray-600 mb-8">Select a model to start creating</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:shadow-lg transition text-left"
                  >
                    <h3 className="font-semibold text-lg mb-1">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.edits && message.edits.length > 0 && (
                  <div className="mt-2 text-sm opacity-75">
                    {message.edits.length} edit(s) applied
                  </div>
                )}
                {index > 0 && (
                  <button
                    onClick={() => goToHistoryState(index)}
                    className="text-xs mt-2 underline opacity-75 hover:opacity-100"
                  >
                    Go to this state
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-lg bg-white border">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          {selectedModel && (
            <div className="mb-2 text-sm text-gray-600">
              Using: {MODELS.find(m => m.id === selectedModel)?.name}
              <button
                onClick={() => setSelectedModel(null)}
                className="ml-2 text-purple-600 hover:underline"
              >
                Change
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={selectedModel ? "Describe what you want to create or edit..." : "Select a model first"}
              disabled={!selectedModel || loading}
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !selectedModel || loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
