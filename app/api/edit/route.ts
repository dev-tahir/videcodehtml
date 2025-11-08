import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { agenticDecision, applyLineEdits, getUserApiKey } from '@/lib/ai'
import { checkUserLimits, incrementUserUsage } from '@/lib/limits'
import { z } from 'zod'

const editSchema = z.object({
  pageId: z.string(),
  prompt: z.string().min(1),
  model: z.string(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, prompt, model, conversationHistory = [] } = editSchema.parse(body)

    // Get page and verify ownership
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    if (page.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check history limits
    const limits = await checkUserLimits(session.user.id, prisma)
    if (!limits.canCreateHistory) {
      return NextResponse.json(
        { error: limits.message || 'History limit reached' },
        { status: 403 }
      )
    }

    // Get user's API key
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
    })
    const userApiKey = getUserApiKey(session.user.id, apiKeys)

    // Use agentic AI to decide what to do
    const aiResponse = await agenticDecision(
      prompt,
      page.content,
      conversationHistory,
      userApiKey
    )

    let newContent = page.content

    if (aiResponse.type === 'edit' && aiResponse.edits) {
      // Apply line edits
      newContent = applyLineEdits(page.content, aiResponse.edits)

      // Update page
      await prisma.page.update({
        where: { id: pageId },
        data: { content: newContent },
      })

      // Create history entry
      await prisma.pageHistory.create({
        data: {
          pageId,
          content: newContent,
          editedBy: session.user.id,
        },
      })

      await incrementUserUsage(session.user.id, 'history', prisma)
    } else if (aiResponse.type === 'create' && aiResponse.content) {
      // Replace entire content
      newContent = aiResponse.content

      await prisma.page.update({
        where: { id: pageId },
        data: { content: newContent },
      })

      await prisma.pageHistory.create({
        data: {
          pageId,
          content: newContent,
          editedBy: session.user.id,
        },
      })

      await incrementUserUsage(session.user.id, 'history', prisma)
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      content: newContent,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Edit error:', error)
    return NextResponse.json(
      { error: 'Failed to edit page' },
      { status: 500 }
    )
  }
}
