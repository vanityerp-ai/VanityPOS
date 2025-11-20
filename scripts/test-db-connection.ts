import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Try to connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database successfully!')
    
    // Try a simple query
    const users = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', users)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()