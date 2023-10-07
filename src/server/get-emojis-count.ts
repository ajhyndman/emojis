import { cache } from "react"
import "server-only"
import { prisma } from "./db"
import ms from "ms"

export const getEmojisCount = cache(async () =>
  prisma.emoji.count({
    cacheStrategy: { ttl: ms("5m"), swr: ms("5m") },
  })
)
