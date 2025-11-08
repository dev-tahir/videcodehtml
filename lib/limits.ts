export const FREE_USER_LIMITS = {
  PAGES_PER_MONTH: 10,
  HISTORY_ENTRIES_PER_MONTH: 100,
} as const

export const SUBSCRIPTION_PRICE = 5 // USD per month

export async function checkUserLimits(
  userId: string,
  prisma: any
): Promise<{ canCreatePage: boolean; canCreateHistory: boolean; message?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPaid: true, pagesCreated: true, historyCount: true },
  })

  if (!user) {
    return { canCreatePage: false, canCreateHistory: false, message: 'User not found' }
  }

  if (user.isPaid) {
    return { canCreatePage: true, canCreateHistory: true }
  }

  // Free user limits
  const canCreatePage = user.pagesCreated < FREE_USER_LIMITS.PAGES_PER_MONTH
  const canCreateHistory = user.historyCount < FREE_USER_LIMITS.HISTORY_ENTRIES_PER_MONTH

  return {
    canCreatePage,
    canCreateHistory,
    message: !canCreatePage
      ? `Free tier limit reached. You can create ${FREE_USER_LIMITS.PAGES_PER_MONTH} pages per month.`
      : !canCreateHistory
      ? `Free tier history limit reached. You can create ${FREE_USER_LIMITS.HISTORY_ENTRIES_PER_MONTH} history entries per month.`
      : undefined,
  }
}

export async function incrementUserUsage(
  userId: string,
  type: 'page' | 'history',
  prisma: any
): Promise<void> {
  if (type === 'page') {
    await prisma.user.update({
      where: { id: userId },
      data: { pagesCreated: { increment: 1 } },
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { historyCount: { increment: 1 } },
    })
  }
}
