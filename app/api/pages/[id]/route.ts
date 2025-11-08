import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = params

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Check if user can access this page
    const isOwner = session?.user?.id === page.userId
    const isShareable = page.isShareable

    if (!isOwner && !isShareable) {
      return NextResponse.json({ error: 'Page is not public' }, { status: 403 })
    }

    return NextResponse.json({
      page: {
        id: page.id,
        title: page.title,
        content: page.content,
        isOwner,
        user: page.user,
      },
    })
  } catch (error) {
    console.error('Get page error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

// PUT - Update page content manually
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { content } = await request.json()

    // Verify ownership
    const page = await prisma.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    if (page.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update page
    const updatedPage = await prisma.page.update({
      where: { id },
      data: { content },
    })

    // Create history entry
    await prisma.pageHistory.create({
      data: {
        pageId: id,
        content,
        editedBy: session.user.id,
      },
    })

    return NextResponse.json({ success: true, page: updatedPage })
  } catch (error) {
    console.error('Update page error:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}
