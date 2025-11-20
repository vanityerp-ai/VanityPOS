import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function checkMigrations() {
  try {
    console.log('🔍 Checking database migrations...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Try to get the list of tables
    console.log('📋 Checking existing tables...')
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    console.log('Tables in database:', tables)
    
    // Check if any of our expected tables exist
    const expectedTables = ['users', 'staff_members', 'clients', 'locations']
    for (const table of expectedTables) {
      const exists: any = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${table})`
      console.log(`Table ${table}:`, exists[0].exists ? '✅ EXISTS' : '❌ MISSING')
    }
    
  } catch (error) {
    console.error('❌ Error checking migrations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMigrations()