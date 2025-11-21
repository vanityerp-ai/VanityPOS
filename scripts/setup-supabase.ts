import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupSupabase() {
  try {
    console.log('🚀 Setting up Supabase database...')
    
    // Create the admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('Admin33#', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@vanityhub.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        email: 'admin@vanityhub.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })
    
    console.log('✅ Admin user created/updated successfully')
    console.log('   Email:', adminUser.email)
    console.log('   Role:', adminUser.role)
    
    // Create sample locations if they don't exist
    console.log('📍 Creating sample locations...')
    const locations = [
      {
        name: 'D-Ring Road',
        address: 'D-Ring Road, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 1234 5678',
        email: 'dring@habeshasalon.com',
      },
      {
        name: 'Medinat Khalifa',
        address: 'Medinat Khalifa, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 2345 6789',
        email: 'medinat@habeshasalon.com',
      },
      {
        name: 'Muaither',
        address: 'Muaither, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 3456 7890',
        email: 'muaither@habeshasalon.com',
      },
    ]
    
    for (const locationData of locations) {
      // First, try to find locations by name
      const existingLocations = await prisma.location.findMany({
        where: { name: locationData.name }
      })
      
      if (existingLocations.length > 0) {
        // Update the first existing location
        const location = await prisma.location.update({
          where: { id: existingLocations[0].id },
          data: locationData
        })
        console.log(`   ✅ ${location.name} location updated`)
      } else {
        // Create new location
        const location = await prisma.location.create({
          data: locationData
        })
        console.log(`   ✅ ${location.name} location created`)
      }
    }
    
    console.log('\n🎉 Supabase setup completed successfully!')
    console.log('\n🔐 Admin Login Credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    console.log('   Role: ADMIN')
    
    console.log('\n📋 Next steps:')
    console.log('1. Update your .env.production file with your Supabase credentials')
    console.log('2. Run `npx prisma migrate deploy` to apply database migrations')
    console.log('3. Deploy to Vercel')
    
  } catch (error) {
    console.error('❌ Error setting up Supabase:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupSupabase()