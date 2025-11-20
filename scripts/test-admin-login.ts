import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login functionality...')
    
    // Connect to the database
    await prisma.$connect()
    
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' }
    })
    
    if (!admin) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log('   Email:', admin.email)
    console.log('   Role:', admin.role)
    console.log('   Active:', admin.isActive)
    console.log('   ID:', admin.id)
    
    // Test password
    const testPassword = 'Admin33#'
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password)
    console.log('')
    console.log(`🔐 Password test (${testPassword}):`, isPasswordValid ? '✅ CORRECT' : '❌ INCORRECT')
    
    if (!isPasswordValid) {
      console.log('❌ Password is incorrect!')
    } else {
      console.log('✅ Password is correct!')
    }
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()