require("dotenv").config();
const { defineConfig } = require("prisma/config");

// Prisma 7 moved connection strings for the CLI (migrate/studio) out of
// schema.prisma and into this file. Runtime queries in application code still
// go through utils/prisma.js, which passes a driver adapter to PrismaClient.
module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
