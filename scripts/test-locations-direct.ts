import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testLocationsDirect() {
  try {
    console.log('🔍 Testing locations fetch directly from database...')
    
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
    
    // Show all locations
    if (locations.length > 0) {
      console.log('\n📋 All locations:')
      locations.forEach((location, index) => {
        console.log(`${index + 1}. ${location.name}`)
        console.log(`   ID: ${location.id}`)
        console.log(`   Address: ${location.address}`)
        console.log(`   City: ${location.city}`)
        console.log(`   Country: ${location.country}`)
        console.log(`   Active: ${location.isActive}`)
        console.log('')
      })
    }
    
    // Check if locations table exists and has data
    const locationCount = await prisma.location.count()
    console.log(`\n📊 Total locations in database: ${locationCount}`)
    
  } catch (error) {
    console.error('❌ Error testing locations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLocationsDirect()