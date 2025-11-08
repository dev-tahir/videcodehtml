import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const voteSchema = z.object({
  pageId: z.string(),
  type: z.enum(['up', 'down']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, type } = voteSchema.parse(body)

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pageId: {
          userId: session.user.id,
          pageId,
        },
      },
    })

    if (existingVote) {
      // Update vote if different
      if (existingVote.type !== type) {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        })

        // Update page vote counts
        await prisma.page.update({
          where: { id: pageId },
          data: {
            upvotes: type === 'up' ? { increment: 1 } : { decrement: 1 },
            downvotes: type === 'down' ? { increment: 1 } : { decrement: 1 },
          },
        })
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          pageId,
          type,
        },
      })

      // Update page vote counts
      await prisma.page.update({
        where: { id: pageId },
        data: {
          upvotes: type === 'up' ? { increment: 1 } : 0,
          downvotes: type === 'down' ? { increment: 1 } : 0,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

// DELETE (remove vote)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 })
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pageId: {
          userId: session.user.id,
          pageId,
        },
      },
    })

    if (!existingVote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 })
    }

    // Remove vote
    await prisma.vote.delete({
      where: { id: existingVote.id },
    })

    // Update page vote counts
    await prisma.page.update({
      where: { id: pageId },
      data: {
        upvotes: existingVote.type === 'up' ? { decrement: 1 } : 0,
        downvotes: existingVote.type === 'down' ? { decrement: 1 } : 0,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete vote error:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}
