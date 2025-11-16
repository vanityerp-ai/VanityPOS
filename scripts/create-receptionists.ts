#!/usr/bin/env tsx

/**
 * Create Receptionist Accounts Script
 * 
 * This script creates receptionist user accounts for each location:
 * - medinat@habeshasalon.com (Medinat Khalifa)
 * - dring@habeshasalon.com (D-ring road)
 * - muaither@habeshasalon.com (Muaither)
 * - store@habeshasalon.com (Online Store)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Generate random password (8 characters: letters and numbers)
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Hash password using bcrypt
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

const receptionists = [
  {
    email: 'medinat@habeshasalon.com',
    name: 'Medinat Khalifa Receptionist',
    locationId: 'loc3', // Medinat Khalifa
    locationName: 'Medinat Khalifa',
    phone: '+974 345-6789'
  },
  {
    email: 'dring@habeshasalon.com',
    name: 'D-Ring Road Receptionist',
    locationId: 'loc1', // D-ring road
    locationName: 'D-ring road',
    phone: '+974 123-4567'
  },
  {
    email: 'muaither@habeshasalon.com',
    name: 'Muaither Receptionist',
    locationId: 'loc2', // Muaither
    locationName: 'Muaither',
    phone: '+974 234-5678'
  },
  {
    email: 'store@habeshasalon.com',
    name: 'Online Store Receptionist',
    locationId: 'online', // Online Store
    locationName: 'Online Store',
    phone: '+974 567-8901'
  }
]

async function createReceptionists() {
  console.log('🔐 Creating receptionist accounts...\n')

  const credentials: Array<{ email: string; password: string; location: string }> = []

  try {
    for (const receptionist of receptionists) {
      // Generate random password
      const password = generateRandomPassword()
      const hashedPassword = hashPassword(password)

      // Check if location exists
      const location = await prisma.location.findUnique({
        where: { id: receptionist.locationId }
      })

      if (!location) {
        console.log(`  ⚠️  Location not found: ${receptionist.locationName} (${receptionist.locationId})`)
        console.log(`     Skipping ${receptionist.email}`)
        continue
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: receptionist.email }
      })

      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { email: receptionist.email },
          data: {
            password: hashedPassword,
            role: 'STAFF',
            isActive: true
          }
        })
        console.log(`  ✅ Updated user: ${receptionist.email}`)
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: receptionist.email,
            password: hashedPassword,
            role: 'STAFF',
            isActive: true
          }
        })
        console.log(`  ✅ Created user: ${receptionist.email}`)
      }

      // Check if staff member already exists
      let staffMember = await prisma.staffMember.findUnique({
        where: { userId: user.id }
      })

      if (staffMember) {
        // Update existing staff member
        staffMember = await prisma.staffMember.update({
          where: { userId: user.id },
          data: {
            name: receptionist.name,
            phone: receptionist.phone,
            jobRole: 'receptionist',
            status: 'ACTIVE',
            avatar: receptionist.name.split(' ').map(n => n[0]).join(''),
            color: 'bg-blue-100 text-blue-800'
          }
        })
        console.log(`  ✅ Updated staff member: ${receptionist.name}`)
      } else {
        // Create new staff member
        staffMember = await prisma.staffMember.create({
          data: {
            userId: user.id,
            name: receptionist.name,
            phone: receptionist.phone,
            jobRole: 'receptionist',
            status: 'ACTIVE',
            avatar: receptionist.name.split(' ').map(n => n[0]).join(''),
            color: 'bg-blue-100 text-blue-800',
            homeService: false
          }
        })
        console.log(`  ✅ Created staff member: ${receptionist.name}`)
      }

      // Assign to location (create or update staff location)
      const existingStaffLocation = await prisma.staffLocation.findUnique({
        where: {
          staffId_locationId: {
            staffId: staffMember.id,
            locationId: receptionist.locationId
          }
        }
      })

      if (!existingStaffLocation) {
        await prisma.staffLocation.create({
          data: {
            staffId: staffMember.id,
            locationId: receptionist.locationId,
            isActive: true
          }
        })
        console.log(`  ✅ Assigned to location: ${receptionist.locationName}`)
      } else {
        console.log(`  ⏭️  Already assigned to location: ${receptionist.locationName}`)
      }

      // Store credentials for display
      credentials.push({
        email: receptionist.email,
        password: password,
        location: receptionist.locationName
      })

      console.log('')
    }

    // Display all credentials
    console.log('\n' + '='.repeat(80))
    console.log('📋 RECEPTIONIST LOGIN CREDENTIALS')
    console.log('='.repeat(80) + '\n')

    credentials.forEach(cred => {
      console.log(`Location: ${cred.location}`)
      console.log(`Email:    ${cred.email}`)
      console.log(`Password: ${cred.password}`)
      console.log('')
    })

    console.log('='.repeat(80))
    console.log('⚠️  IMPORTANT: Save these credentials securely!')
    console.log('='.repeat(80) + '\n')

    console.log('✅ All receptionist accounts created successfully!\n')

  } catch (error) {
    console.error('❌ Error creating receptionist accounts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createReceptionists()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

