import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptApiKey, decryptApiKey } from '@/lib/encryption'
import { z } from 'zod'

const apiKeySchema = z.object({
  provider: z.string(),
  key: z.string(),
  model: z.string().optional(),
  name: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        provider: true,
        model: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, key, model, name } = apiKeySchema.parse(body)

    // Encrypt API key
    const encryptedKey = encryptApiKey(key)

    // Delete existing key for this provider
    await prisma.apiKey.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    })

    // Create new key
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        provider,
        key: encryptedKey,
        model,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        provider: true,
        model: true,
      },
    })

    return NextResponse.json({ success: true, apiKey })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Save API key error:', error)
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    )
  }
}
