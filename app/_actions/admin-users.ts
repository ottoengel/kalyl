"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"

const PAGE_SIZE = 20

const isAdminSession = async () => {
  const session = await getServerSession(authOptions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session?.user as any)?.role === "ADMIN"
}

export interface AdminUserRow {
  id: string
  name: string | null
  email: string
  image: string | null
  number: string | null
  role: string
  blocked: boolean
  createdAt: Date
  bookingsCount: number
}

export interface AdminUserStats {
  total: number
  mensalistas: number
  blocked: number
}

export const getAdminUserStats = async (): Promise<AdminUserStats> => {
  if (!(await isAdminSession())) {
    return { total: 0, mensalistas: 0, blocked: 0 }
  }

  const [total, mensalistas, blocked] = await Promise.all([
    db.user.count(),
    db.user.count({
      where: { role: { in: ["MENSALISTAC", "MENSALISTAB", "MENSALISTACB"] } },
    }),
    db.user.count({ where: { blocked: true } }),
  ])

  return { total, mensalistas, blocked }
}

interface GetAdminUsersParams {
  search?: string
  onlyBlocked?: boolean
  skip?: number
  take?: number
}

export const getAdminUsers = async ({
  search,
  onlyBlocked,
  skip = 0,
  take = PAGE_SIZE,
}: GetAdminUsersParams = {}): Promise<{
  users: AdminUserRow[]
  hasMore: boolean
}> => {
  if (!(await isAdminSession())) {
    return { users: [], hasMore: false }
  }

  const cleanSearch = search?.trim()

  const users = await db.user.findMany({
    where: {
      ...(onlyBlocked ? { blocked: true } : {}),
      ...(cleanSearch
        ? {
            OR: [
              { name: { contains: cleanSearch, mode: "insensitive" } },
              { email: { contains: cleanSearch, mode: "insensitive" } },
              { number: { contains: cleanSearch } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      number: true,
      role: true,
      blocked: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: take + 1,
  })

  return {
    users: users.slice(0, take).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      number: user.number,
      role: user.role,
      blocked: user.blocked,
      createdAt: user.createdAt,
      bookingsCount: user._count.bookings,
    })),
    hasMore: users.length > take,
  }
}

export const setUserBlocked = async (
  userId: string,
  blocked: boolean,
): Promise<{ success: boolean; error?: string }> => {
  if (!(await isAdminSession())) {
    return { success: false, error: "unauthorized" }
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!target) {
    return { success: false, error: "not_found" }
  }
  if (target.role === "ADMIN") {
    return { success: false, error: "cannot_block_admin" }
  }

  await db.user.update({
    where: { id: userId },
    data: { blocked },
  })

  return { success: true }
}
