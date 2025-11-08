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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership
    const page = await prisma.page.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!page || page.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get history
    const history = await prisma.pageHistory.findMany({
      where: { pageId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
