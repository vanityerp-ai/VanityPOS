import { PrismaClient } from '@prisma/client'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function debugAPIRoutes() {
  try {
    console.log('🔍 Debugging API routes...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Test the exact query that the API route uses
    console.log('🔄 Testing services query...')
    
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
    
    // Transform exactly like the API route does
    const transformedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: Number(service.price),
      category: service.category,
      categoryName: service.category,
      showPrices: service.showPricesToClients,
      locations: service.locations.map(loc => loc.locationId),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }))
    
    console.log('✅ Services transformed successfully')
    console.log('📋 Sample transformed service:')
    console.log(JSON.stringify(transformedServices[0], null, 2))
    
    // Test categories query
    console.log('\n🔄 Testing categories query...')
    const allServices = await prisma.service.findMany({
      where: {
        isActive: true
      },
      select: {
        category: true
      }
    })
    
    // Extract unique categories and count services for each
    const categoryMap = new Map<string, number>()
    
    allServices.forEach(service => {
      const category = (service.category || "Uncategorized").trim()
      if (category && category !== "") {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      }
    })
    
    // Convert to the expected format
    const categories = Array.from(categoryMap.entries()).map(([name, count], index) => {
      const normalizedName = name.trim()
      const id = normalizedName.toLowerCase().replace(/\s+/g, '-')
      
      return {
        id: id,
        name: normalizedName,
        description: `${normalizedName} services`,
        serviceCount: count,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
    
    console.log(`✅ Found ${categories.length} categories`)
    console.log('📋 Sample category:')
    console.log(JSON.stringify(categories[0], null, 2))
    
  } catch (error) {
    console.error('❌ Error debugging API routes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAPIRoutes()