const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Prisma 7 requires an explicit driver adapter — there is no implicit
// connection from schema.prisma at runtime anymore.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting
// the Postgres connection pool.
const prisma = global.__applyiqPrisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  global.__applyiqPrisma = prisma;
}

module.exports = prisma;
