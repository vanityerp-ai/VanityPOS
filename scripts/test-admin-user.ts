import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testAdminUser() {
  try {
    console.log('🔍 Testing admin user...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Try to find the admin user
    console.log('🔄 Looking for admin user...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' },
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
    
    if (adminUser) {
      console.log('✅ Admin user found:')
      console.log('   Email:', adminUser.email)
      console.log('   Role:', adminUser.role)
      console.log('   Active:', adminUser.isActive)
      console.log('   Staff Profile:', adminUser.staffProfile ? 'Yes' : 'No')
      
      if (adminUser.staffProfile) {
        console.log('   Staff Name:', adminUser.staffProfile.name)
        console.log('   Staff Locations:', adminUser.staffProfile.locations.map(sl => sl.location.name))
      }
    } else {
      console.log('❌ Admin user not found')
      
      // Let's check if any users exist
      const users = await prisma.user.findMany()
      console.log(`📊 Total users in database: ${users.length}`)
      
      if (users.length > 0) {
        console.log('📋 All users:')
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`)
        })
      }
    }
    
    // Test password verification
    if (adminUser) {
      console.log('\n🔍 Testing password verification...')
      const passwordMatch = await bcrypt.compare('Admin33#', adminUser.password)
      console.log(`✅ Password verification: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`)
    }
    
  } catch (error) {
    console.error('❌ Error testing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminUser()