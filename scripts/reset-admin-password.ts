import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...')
    
    // Hash the new password
    const newPassword = 'Admin33#'
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the admin user's password
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@vanityhub.com' },
      data: {
        password: hashedPassword,
      },
    })
    
    console.log('✅ Admin password reset successfully!')
    console.log('   Email:', updatedUser.email)
    console.log('   New Password:', newPassword)
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()