import { Prisma } from "@prisma/client"
import { cache } from "react"
import "server-only"
import { prisma } from "./db"
import ms from "ms"

export const getEmojis = cache(async (take: number = 100) =>
  prisma.emoji.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: Prisma.SortOrder.desc },
    where: { isFlagged: false, originalUrl: { not: null }, noBackgroundUrl: { not: null } },
    take,
    cacheStrategy: { ttl: ms("30s"), swr: ms("60s") },
  })
)
