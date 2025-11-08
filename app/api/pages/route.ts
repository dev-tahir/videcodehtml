import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all pages (with filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'my' or 'community'

    if (type === 'my') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const pages = await prisma.page.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          screenshot: true,
          upvotes: true,
          downvotes: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json({ pages })
    }

    // Community pages (shareable only)
    const pages = await prisma.page.findMany({
      where: { isShareable: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        screenshot: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

// DELETE a page
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 })
    }

    // Verify ownership
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    if (page.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.page.delete({
      where: { id: pageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete page error:', error)
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}
