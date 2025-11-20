import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function createTables() {
  try {
    console.log('🔧 Creating database tables...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Drop existing tables if they exist (to start fresh)
    console.log('Dropping existing tables...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS users, staff_members, clients, locations CASCADE`
    
    // Create users table with all required columns
    console.log('Creating users table...')
    await prisma.$executeRaw`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'CLIENT',
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "lastLogin" TIMESTAMP
      )
    `
    
    // Create staff_members table
    console.log('Creating staff_members table...')
    await prisma.$executeRaw`
      CREATE TABLE "staff_members" (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        color TEXT,
        "jobRole" TEXT,
        "dateOfBirth" TIMESTAMP,
        "homeService" BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'ACTIVE',
        "employeeNumber" TEXT,
        "qidNumber" TEXT,
        "passportNumber" TEXT,
        "qidValidity" TEXT,
        "passportValidity" TEXT,
        "medicalValidity" TEXT,
        "profileImage" TEXT,
        "profileImageType" TEXT,
        specialties TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create clients table
    console.log('Creating clients table...')
    await prisma.$executeRaw`
      CREATE TABLE clients (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        "dateOfBirth" TIMESTAMP,
        preferences TEXT,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        address TEXT,
        city TEXT,
        email TEXT,
        "isAutoRegistered" BOOLEAN DEFAULT false,
        "preferredLocationId" TEXT,
        "registrationSource" TEXT,
        state TEXT,
        "zipCode" TEXT
      )
    `
    
    // Create locations table
    console.log('Creating locations table...')
    await prisma.$executeRaw`
      CREATE TABLE locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT,
        "zipCode" TEXT,
        country TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        coordinates TEXT
      )
    `
    
    console.log('✅ Tables created successfully!')
    
    // Create indexes
    console.log('Creating indexes...')
    await prisma.$executeRaw`CREATE INDEX "users_email_idx" ON users(email)`
    await prisma.$executeRaw`CREATE INDEX "users_role_isActive_idx" ON users(role, "isActive")`
    await prisma.$executeRaw`CREATE INDEX "locations_name_idx" ON locations(name)`
    await prisma.$executeRaw`CREATE INDEX "locations_city_country_idx" ON locations(city, country)`
    await prisma.$executeRaw`CREATE INDEX "locations_isActive_idx" ON locations("isActive")`
    
    console.log('✅ Indexes created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTables()