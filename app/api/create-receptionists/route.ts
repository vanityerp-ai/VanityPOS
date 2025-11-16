import { NextResponse } from 'next/server'
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

export async function POST() {
  try {
    const credentials: Array<{ email: string; password: string; location: string }> = []
    const results: Array<{ email: string; status: string; message: string }> = []

    for (const receptionist of receptionists) {
      try {
        // Generate random password
        const password = generateRandomPassword()
        const hashedPassword = hashPassword(password)

        // Check if location exists
        const location = await prisma.location.findUnique({
          where: { id: receptionist.locationId }
        })

        if (!location) {
          results.push({
            email: receptionist.email,
            status: 'skipped',
            message: `Location not found: ${receptionist.locationName}`
          })
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
          results.push({
            email: receptionist.email,
            status: 'updated',
            message: 'User account updated'
          })
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
          results.push({
            email: receptionist.email,
            status: 'created',
            message: 'User account created'
          })
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
        }

        // Assign to location
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
        }

        // Store credentials for response
        credentials.push({
          email: receptionist.email,
          password: password,
          location: receptionist.locationName
        })

      } catch (error) {
        console.error(`Error creating receptionist ${receptionist.email}:`, error)
        results.push({
          email: receptionist.email,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Receptionist accounts processed',
      credentials,
      results
    })

  } catch (error) {
    console.error('Error creating receptionist accounts:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

