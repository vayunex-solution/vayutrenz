// Prisma Database Client with separate DB variables
const { PrismaClient } = require('@prisma/client');

// Construct DATABASE_URL from individual variables if not set directly
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const dbUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`;
  process.env.DATABASE_URL = dbUrl;
  console.log('📦 Database URL constructed from individual variables');
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

module.exports = prisma;
