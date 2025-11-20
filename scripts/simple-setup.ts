import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function simpleSetup() {
  try {
    console.log('🔧 Simple setup...')
    
    // Connect to the database
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Create the admin user
    console.log('👤 Creating/updating admin user...')
    const hashedPassword = await bcrypt.hash('Admin33#', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@vanityhub.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        id: 'admin-1',
        email: 'admin@vanityhub.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })
    
    console.log('✅ Admin user created/updated successfully')
    console.log('   Email:', adminUser.email)
    console.log('   Role:', adminUser.role)
    
    // Create sample locations
    console.log('📍 Creating sample locations...')
    const locations = [
      {
        id: 'loc-1',
        name: 'D-Ring Road',
        address: 'D-Ring Road, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 1234 5678',
        email: 'dring@habeshasalon.com',
        isActive: true,
      },
      {
        id: 'loc-2',
        name: 'Medinat Khalifa',
        address: 'Medinat Khalifa, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 2345 6789',
        email: 'medinat@habeshasalon.com',
        isActive: true,
      },
      {
        id: 'loc-3',
        name: 'Muaither',
        address: 'Muaither, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 3456 7890',
        email: 'muaither@habeshasalon.com',
        isActive: true,
      },
    ]
    
    for (const locationData of locations) {
      // Find existing locations by name using findFirst
      const existingLocation = await prisma.location.findFirst({
        where: { name: locationData.name }
      })
      
      let location;
      if (existingLocation) {
        // Update existing location
        location = await prisma.location.update({
          where: { id: existingLocation.id },
          data: locationData
        })
      } else {
        // Create new location
        location = await prisma.location.create({
          data: locationData
        })
      }
      console.log(`   ✅ ${location.name} location created/updated`)
    }
    
    console.log('\n🎉 Setup completed successfully!')
    console.log('\n🔐 Admin Login Credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    console.log('   Role: ADMIN')
    
  } catch (error) {
    console.error('❌ Error in simple setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simpleSetup()