import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testLocationsAPI() {
  try {
    console.log('🔍 Testing locations API connection...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Try to fetch locations
    console.log('🔄 Fetching locations...')
    const locations = await prisma.location.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`✅ Found ${locations.length} locations`)
    
    // Show first few locations
    if (locations.length > 0) {
      console.log('\n📋 First 3 locations:')
      locations.slice(0, 3).forEach((location, index) => {
        console.log(`${index + 1}. ${location.name} - ${location.city}, ${location.country}`)
      })
    }
    
    // Check if locations table exists and has data
    const locationCount = await prisma.location.count()
    console.log(`\n📊 Total locations in database: ${locationCount}`)
    
  } catch (error) {
    console.error('❌ Error testing locations API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLocationsAPI()