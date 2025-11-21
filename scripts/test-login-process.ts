// Test the complete login process
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testLoginProcess() {
  try {
    console.log('🔍 Testing complete login process...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Step 1: Authenticate user
    console.log('\n1️⃣ Authenticating user...')
    const email = 'admin@vanityhub.com'
    const password = 'Admin33#'
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        staffProfile: {
          include: {
            locations: {
              include: {
                location: true
              }
            }
          }
        }
      }
    })
    
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive')
      return
    }
    
    console.log('✅ User found:')
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Active:', user.isActive)
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      console.log('❌ Password verification failed')
      return
    }
    
    console.log('✅ Password verification successful')
    
    // Get user locations
    let locationIds: string[] = []
    if (user.staffProfile?.locations) {
      locationIds = user.staffProfile.locations
        .filter(sl => sl.isActive)
        .map(sl => sl.location.id)
    }
    
    const userLocations = user.role === "ADMIN" ? ["all"] : locationIds
    console.log('📍 User locations:', userLocations)
    
    // Step 2: Fetch locations from API
    console.log('\n2️⃣ Fetching locations from API...')
    
    // Simulate the locations API call
    const locations = await prisma.location.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`✅ Found ${locations.length} locations`)
    
    // Transform locations to match expected format
    const transformedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      country: location.country,
      phone: location.phone,
      email: location.email,
      isActive: location.isActive,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt
    }))
    
    console.log('📍 Transformed locations:', transformedLocations.length)
    
    // Apply user-based access control (simplified)
    let filteredLocations = transformedLocations
    if (user.role !== "ADMIN") {
      // For non-admin users, filter by their accessible locations
      filteredLocations = transformedLocations.filter(location => 
        userLocations.includes(location.id) || userLocations.includes("all")
      )
    }
    
    console.log('📍 Filtered locations:', filteredLocations.length)
    
    console.log('\n✅ Login process completed successfully!')
    console.log('📊 Summary:')
    console.log('   - User authenticated: ✅')
    console.log('   - Password verified: ✅')
    console.log('   - Locations fetched: ✅')
    console.log('   - Locations transformed: ✅')
    console.log('   - Locations filtered: ✅')
    
  } catch (error) {
    console.error('❌ Error in login process:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginProcess()