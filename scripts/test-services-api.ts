import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testServicesAPI() {
  try {
    console.log('🔍 Testing services API connection...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Try to fetch services
    console.log('🔄 Fetching services...')
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      include: {
        locations: {
          where: {
            isActive: true
          },
          include: {
            location: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`✅ Found ${services.length} services`)
    
    // Show first few services
    if (services.length > 0) {
      console.log('\n📋 First 3 services:')
      services.slice(0, 3).forEach((service, index) => {
        console.log(`${index + 1}. ${service.name} - ${service.category} - $${service.price}`)
        console.log(`   Locations: ${service.locations.map(loc => loc.location?.name || loc.locationId).join(', ')}`)
      })
    }
    
    // Check if services table exists and has data
    const serviceCount = await prisma.service.count()
    console.log(`\n📊 Total services in database: ${serviceCount}`)
    
  } catch (error) {
    console.error('❌ Error testing services API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testServicesAPI()