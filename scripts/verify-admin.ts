import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyAdmin() {
  try {
    console.log('🔍 Checking admin user...\n')

    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' },
      include: {
        staffProfile: true
      }
    })

    if (!admin) {
      console.log('❌ Admin user not found!')
      console.log('Creating admin user...\n')
      
      const hashedPassword = await bcrypt.hash('Admin33#', 10)
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@vanityhub.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        }
      })
      
      console.log('✅ Admin user created successfully!')
      console.log('📧 Email: admin@vanityhub.com')
      console.log('🔑 Password: Admin33#')
      console.log('👤 User ID:', newAdmin.id)
      console.log('🔓 Active:', newAdmin.isActive)
      console.log('👑 Role:', newAdmin.role)
    } else {
      console.log('✅ Admin user found!')
      console.log('📧 Email:', admin.email)
      console.log('👤 User ID:', admin.id)
      console.log('🔓 Active:', admin.isActive)
      console.log('👑 Role:', admin.role)
      console.log('👤 Staff Profile:', admin.staffProfile ? 'Yes' : 'No')
      
      // Test password
      const passwordMatch = await bcrypt.compare('Admin33#', admin.password)
      console.log('🔑 Password "Admin33#" matches:', passwordMatch ? '✅ YES' : '❌ NO')
      
      if (!passwordMatch) {
        console.log('\n⚠️  Password mismatch detected! Resetting password...')
        const hashedPassword = await bcrypt.hash('Admin33#', 10)
        await prisma.user.update({
          where: { email: 'admin@vanityhub.com' },
          data: {
            password: hashedPassword,
            isActive: true,
          }
        })
        console.log('✅ Password reset to: Admin33#')
      }
    }

    // List all users
    console.log('\n📋 All users in database:')
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        isActive: true,
      }
    })
    console.table(allUsers)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin()

