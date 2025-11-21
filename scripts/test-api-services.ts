import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testAPIServices() {
  try {
    console.log('🔍 Testing API services directly...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Simulate the API route logic
    console.log('🔄 Fetching services from database...')
    
    // Fetch services with location relationships
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
    
    console.log(`✅ Found ${services.length} services in database`)
    
    // Transform to expected format
    const transformedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: Number(service.price),
      category: service.category,
      categoryName: service.category,
      showPrices: service.showPricesToClients,
      locations: service.locations.map(loc => loc.locationId), // Include actual location IDs
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }))
    
    console.log(`✅ Successfully transformed ${transformedServices.length} services`)
    
    // Show first service
    if (transformedServices.length > 0) {
      console.log('\n📋 First service:')
      console.log(JSON.stringify(transformedServices[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error testing API services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIServices()