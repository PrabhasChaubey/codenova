import PrismaPkg from "@prisma/client"

const { PrismaClient } = PrismaPkg as typeof import("@prisma/client") | any

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db