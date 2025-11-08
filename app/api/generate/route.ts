import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generatePage, getUserApiKey } from '@/lib/ai'
import { checkUserLimits, incrementUserUsage } from '@/lib/limits'
import { z } from 'zod'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { captureHTMLScreenshot } from '@/lib/screenshot'

const generateSchema = z.object({
  prompt: z.string().min(1),
  model: z.string(),
  title: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, model, title } = generateSchema.parse(body)

    // Check user limits
    const limits = await checkUserLimits(session.user.id, prisma)
    if (!limits.canCreatePage) {
      return NextResponse.json(
        { error: limits.message || 'Page limit reached' },
        { status: 403 }
      )
    }

    // Get user's API key if they have one
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
    })
    const userApiKey = getUserApiKey(session.user.id, apiKeys)

    // Generate page content using AI
    const content = await generatePage(prompt, model, userApiKey)

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate page content' },
        { status: 500 }
      )
    }

    // Get user to check if they're paid
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPaid: true },
    })

    // Create page in database
    const page = await prisma.page.create({
      data: {
        title: title || 'Untitled Page',
        content,
        isShareable: !user?.isPaid, // Free users pages are shareable by default
        userId: session.user.id,
      },
    })

    // Create initial history entry
    await prisma.pageHistory.create({
      data: {
        pageId: page.id,
        content,
        editedBy: session.user.id,
      },
    })

    // Increment usage
    await incrementUserUsage(session.user.id, 'page', prisma)

    // Generate screenshot in background (don't wait for it)
    generateScreenshot(page.id, content).catch(err => 
      console.error('Screenshot generation failed:', err)
    )

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        content: page.content,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate page' },
      { status: 500 }
    )
  }
}

async function generateScreenshot(pageId: string, htmlContent: string) {
  try {
    const screenshot = await captureHTMLScreenshot(htmlContent)
    
    // Save screenshot to public folder
    const filename = `${pageId}.png`
    const filepath = join(process.cwd(), 'public', 'screenshots', filename)
    await writeFile(filepath, screenshot)
    
    // Update page with screenshot path
    await prisma.page.update({
      where: { id: pageId },
      data: { screenshot: `/screenshots/${filename}` },
    })
  } catch (error) {
    console.error('Screenshot generation failed:', error)
  }
}
