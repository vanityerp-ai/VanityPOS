import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function createTables() {
  try {
    console.log('🔧 Creating all database tables...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Drop existing tables if they exist (to start fresh)
    console.log('Dropping existing tables...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS audit_logs, gift_card_transactions, gift_cards, inventory_audits, loyalty_programs, membership_transactions, memberships, membership_tiers, product_batches, product_locations, products, transfers, appointment_products, appointment_services, location_services, staff_services, staff_schedules, staff_locations, appointments, services, locations, clients, staff_members, users CASCADE`
    
    // Create users table
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
    
    // Create services table
    console.log('Creating services table...')
    await prisma.$executeRaw`
      CREATE TABLE services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        price DECIMAL NOT NULL,
        category TEXT NOT NULL,
        "showPricesToClients" BOOLEAN DEFAULT true,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create appointments table
    console.log('Creating appointments table...')
    await prisma.$executeRaw`
      CREATE TABLE appointments (
        id TEXT PRIMARY KEY,
        "bookingReference" TEXT UNIQUE NOT NULL,
        "clientId" TEXT NOT NULL,
        "staffId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        "totalPrice" DECIMAL NOT NULL,
        status TEXT DEFAULT 'PENDING',
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create staff_locations table
    console.log('Creating staff_locations table...')
    await prisma.$executeRaw`
      CREATE TABLE "staff_locations" (
        id TEXT PRIMARY KEY,
        "staffId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create staff_services table
    console.log('Creating staff_services table...')
    await prisma.$executeRaw`
      CREATE TABLE "staff_services" (
        id TEXT PRIMARY KEY,
        "staffId" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create location_services table
    console.log('Creating location_services table...')
    await prisma.$executeRaw`
      CREATE TABLE "location_services" (
        id TEXT PRIMARY KEY,
        "locationId" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        price DECIMAL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create appointment_services table
    console.log('Creating appointment_services table...')
    await prisma.$executeRaw`
      CREATE TABLE "appointment_services" (
        id TEXT PRIMARY KEY,
        "appointmentId" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        price DECIMAL NOT NULL,
        duration INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create products table (inventory)
    console.log('Creating products table...')
    await prisma.$executeRaw`
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        cost REAL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        brand TEXT,
        sku TEXT,
        barcode TEXT,
        image TEXT,
        images TEXT,
        "isRetail" BOOLEAN DEFAULT false,
        "isActive" BOOLEAN DEFAULT true,
        "isFeatured" BOOLEAN DEFAULT false,
        "isNew" BOOLEAN DEFAULT false,
        "isBestSeller" BOOLEAN DEFAULT false,
        "isSale" BOOLEAN DEFAULT false,
        "salePrice" REAL,
        rating REAL DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        features TEXT,
        ingredients TEXT,
        "howToUse" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create product_locations table
    console.log('Creating product_locations table...')
    await prisma.$executeRaw`
      CREATE TABLE "product_locations" (
        id TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        price REAL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create product_batches table
    console.log('Creating product_batches table...')
    await prisma.$executeRaw`
      CREATE TABLE "product_batches" (
        id TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        "batchNumber" TEXT NOT NULL,
        "expiryDate" TIMESTAMP,
        quantity INTEGER DEFAULT 0,
        "costPrice" REAL,
        "supplierInfo" TEXT,
        notes TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create transfers table
    console.log('Creating transfers table...')
    await prisma.$executeRaw`
      CREATE TABLE transfers (
        id TEXT PRIMARY KEY,
        "transferId" TEXT UNIQUE NOT NULL,
        "productId" TEXT NOT NULL,
        "productName" TEXT NOT NULL,
        "fromLocationId" TEXT NOT NULL,
        "toLocationId" TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT DEFAULT 'completed',
        reason TEXT,
        notes TEXT,
        "createdBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "completedAt" TIMESTAMP
      )
    `
    
    // Create appointment_products table
    console.log('Creating appointment_products table...')
    await prisma.$executeRaw`
      CREATE TABLE "appointment_products" (
        id TEXT PRIMARY KEY,
        "appointmentId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        price REAL NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create inventory_audits table
    console.log('Creating inventory_audits table...')
    await prisma.$executeRaw`
      CREATE TABLE "inventory_audits" (
        id TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        "adjustmentType" TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        "previousStock" INTEGER NOT NULL,
        "newStock" INTEGER NOT NULL,
        reason TEXT NOT NULL,
        notes TEXT,
        "userId" TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create staff_schedules table
    console.log('Creating staff_schedules table...')
    await prisma.$executeRaw`
      CREATE TABLE "staff_schedules" (
        id TEXT PRIMARY KEY,
        "staffId" TEXT NOT NULL,
        "dayOfWeek" INTEGER NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create loyalty_programs table
    console.log('Creating loyalty_programs table...')
    await prisma.$executeRaw`
      CREATE TABLE "loyalty_programs" (
        id TEXT PRIMARY KEY,
        "clientId" TEXT UNIQUE NOT NULL,
        points INTEGER DEFAULT 0,
        tier TEXT DEFAULT 'Bronze',
        "totalSpent" DECIMAL DEFAULT 0,
        "joinDate" TIMESTAMP DEFAULT NOW(),
        "lastActivity" TIMESTAMP DEFAULT NOW(),
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create membership_tiers table
    console.log('Creating membership_tiers table...')
    await prisma.$executeRaw`
      CREATE TABLE "membership_tiers" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL NOT NULL,
        duration TEXT NOT NULL,
        benefits TEXT NOT NULL,
        "discountPercentage" INTEGER NOT NULL,
        "maxDiscountAmount" DECIMAL,
        "includedServices" TEXT NOT NULL,
        "priorityBooking" BOOLEAN DEFAULT false,
        "freeServices" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create memberships table
    console.log('Creating memberships table...')
    await prisma.$executeRaw`
      CREATE TABLE memberships (
        id TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "tierId" TEXT NOT NULL,
        "tierName" TEXT NOT NULL,
        status TEXT NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "autoRenew" BOOLEAN DEFAULT true,
        price DECIMAL NOT NULL,
        "discountPercentage" INTEGER NOT NULL,
        "usedFreeServices" INTEGER DEFAULT 0,
        "totalFreeServices" INTEGER DEFAULT 0,
        location TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create membership_transactions table
    console.log('Creating membership_transactions table...')
    await prisma.$executeRaw`
      CREATE TABLE "membership_transactions" (
        id TEXT PRIMARY KEY,
        "membershipId" TEXT NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL,
        description TEXT,
        "serviceId" TEXT,
        "serviceName" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create gift_cards table
    console.log('Creating gift_cards table...')
    await prisma.$executeRaw`
      CREATE TABLE "gift_cards" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        "originalAmount" DECIMAL NOT NULL,
        "currentBalance" DECIMAL NOT NULL,
        status TEXT NOT NULL,
        "issuedDate" TIMESTAMP NOT NULL,
        "expirationDate" TIMESTAMP,
        "issuedBy" TEXT NOT NULL,
        "issuedByName" TEXT NOT NULL,
        "issuedTo" TEXT,
        "issuedToName" TEXT,
        "purchaserEmail" TEXT,
        "purchaserPhone" TEXT,
        message TEXT,
        location TEXT NOT NULL,
        "transactionId" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create gift_card_transactions table
    console.log('Creating gift_card_transactions table...')
    await prisma.$executeRaw`
      CREATE TABLE "gift_card_transactions" (
        id TEXT PRIMARY KEY,
        "giftCardId" TEXT NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL NOT NULL,
        "balanceBefore" DECIMAL NOT NULL,
        "balanceAfter" DECIMAL NOT NULL,
        description TEXT,
        "transactionId" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    // Create audit_logs table
    console.log('Creating audit_logs table...')
    await prisma.$executeRaw`
      CREATE TABLE "audit_logs" (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        "userId" TEXT,
        "userEmail" TEXT,
        "userRole" TEXT,
        "resourceType" TEXT,
        "resourceId" TEXT,
        details TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        location TEXT,
        severity TEXT DEFAULT 'LOW',
        metadata TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `
    
    console.log('✅ All tables created successfully!')
    
    // Create indexes
    console.log('Creating indexes...')
    await prisma.$executeRaw`CREATE INDEX "users_email_idx" ON users(email)`
    await prisma.$executeRaw`CREATE INDEX "users_role_isActive_idx" ON users(role, "isActive")`
    await prisma.$executeRaw`CREATE INDEX "users_createdAt_idx" ON users("createdAt")`
    await prisma.$executeRaw`CREATE INDEX "staff_members_name_idx" ON "staff_members"(name)`
    await prisma.$executeRaw`CREATE INDEX "staff_members_status_idx" ON "staff_members"(status)`
    await prisma.$executeRaw`CREATE INDEX "clients_name_idx" ON clients(name)`
    await prisma.$executeRaw`CREATE INDEX "locations_name_idx" ON locations(name)`
    await prisma.$executeRaw`CREATE INDEX "locations_city_country_idx" ON locations(city, country)`
    await prisma.$executeRaw`CREATE INDEX "locations_isActive_idx" ON locations("isActive")`
    await prisma.$executeRaw`CREATE INDEX "services_name_idx" ON services(name)`
    await prisma.$executeRaw`CREATE INDEX "services_category_isActive_idx" ON services(category, "isActive")`
    await prisma.$executeRaw`CREATE INDEX "services_price_idx" ON services(price)`
    await prisma.$executeRaw`CREATE INDEX "appointments_date_idx" ON appointments(date)`
    await prisma.$executeRaw`CREATE INDEX "appointments_clientId_idx" ON appointments("clientId")`
    await prisma.$executeRaw`CREATE INDEX "appointments_staffId_idx" ON appointments("staffId")`
    await prisma.$executeRaw`CREATE INDEX "appointments_locationId_idx" ON appointments("locationId")`
    await prisma.$executeRaw`CREATE INDEX "appointments_status_idx" ON appointments(status)`
    await prisma.$executeRaw`CREATE INDEX "products_sku_key" ON products(sku)`
    await prisma.$executeRaw`CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId")`
    await prisma.$executeRaw`CREATE INDEX "audit_logs_action_idx" ON "audit_logs"(action)`
    await prisma.$executeRaw`CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"(severity)`
    await prisma.$executeRaw`CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt")`
    
    console.log('✅ Indexes created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTables()