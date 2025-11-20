import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Set the database URL directly
process.env.DATABASE_URL = 'postgresql://postgres.tyxthyqrbmgjokfcfqgc:nMraMBe5JOLKcYvX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

const prisma = new PrismaClient()

async function simpleSetup() {
  try {
    console.log('🔧 Complete setup...')
    
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
        id: uuidv4(),
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
        id: uuidv4(),
        name: 'D-Ring Road',
        address: 'D-Ring Road, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 1234 5678',
        email: 'dring@habeshasalon.com',
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Medinat Khalifa',
        address: 'Medinat Khalifa, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 2345 6789',
        email: 'medinat@habeshasalon.com',
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Muaither',
        address: 'Muaither, Doha, Qatar',
        city: 'Doha',
        country: 'Qatar',
        phone: '+974 3456 7890',
        email: 'muaither@habeshasalon.com',
        isActive: true,
      },
    ]
    
    const createdLocations = [];
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
      createdLocations.push(location);
      console.log(`   ✅ ${location.name} location created/updated`)
    }
    
    // Create sample staff members
    console.log('👥 Creating sample staff members...')
    const staffMembers = [
      {
        name: 'Tsedey Asefa',
        email: 'tsedey@habeshasalon.com',
        phone: '+974 5555 5555',
        jobRole: 'Owner',
        status: 'ACTIVE',
        employeeNumber: '9100',
        homeService: false,
      },
      {
        name: 'Mekdes Bekele',
        email: 'mekdes@habeshasalon.com',
        phone: '+974 3348 1527',
        jobRole: 'Stylist',
        status: 'ACTIVE',
        employeeNumber: '9101',
        homeService: true,
      },
      {
        name: 'Aster Tarekegn',
        email: 'aster@habeshasalon.com',
        phone: '+974 6686 8083',
        jobRole: 'Stylist',
        status: 'ACTIVE',
        employeeNumber: '9102',
        homeService: true,
      }
    ]
    
    for (const staffData of staffMembers) {
      // First create a user for the staff member
      const staffUser = await prisma.user.upsert({
        where: { email: staffData.email },
        update: {
          role: 'STAFF',
          isActive: true,
        },
        create: {
          id: uuidv4(),
          email: staffData.email,
          password: await bcrypt.hash('Staff123#', 10),
          role: 'STAFF',
          isActive: true,
        },
      })
      
      // Then create the staff member profile
      const staffMember = await prisma.staffMember.upsert({
        where: { userId: staffUser.id },
        update: {
          name: staffData.name,
          phone: staffData.phone,
          jobRole: staffData.jobRole,
          status: staffData.status,
          employeeNumber: staffData.employeeNumber,
          homeService: staffData.homeService,
        },
        create: {
          id: uuidv4(),
          userId: staffUser.id,
          name: staffData.name,
          phone: staffData.phone,
          jobRole: staffData.jobRole,
          status: staffData.status,
          employeeNumber: staffData.employeeNumber,
          homeService: staffData.homeService,
        },
      })
      
      // Assign staff to all locations
      for (const location of createdLocations) {
        // First check if the staff-location relationship already exists
        const existingStaffLocation = await prisma.staffLocation.findFirst({
          where: {
            staffId: staffMember.id,
            locationId: location.id
          }
        })
        
        // If it doesn't exist, create it
        if (!existingStaffLocation) {
          await prisma.staffLocation.create({
            data: {
              id: uuidv4(),
              staffId: staffMember.id,
              locationId: location.id,
              isActive: true,
            },
          })
        }
      }
      
      console.log(`   ✅ ${staffMember.name} staff member created/updated`)
    }
    
    // Create sample services
    console.log('💇 Creating sample services...')
    const services = [
      {
        id: uuidv4(),
        name: 'Hair Cut',
        description: 'Professional hair cutting service',
        duration: 30,
        price: 25.00,
        category: 'Hair',
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        duration: 120,
        price: 80.00,
        category: 'Hair',
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Manicure',
        description: 'Professional manicure service',
        duration: 45,
        price: 35.00,
        category: 'Nails',
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Pedicure',
        description: 'Professional pedicure service',
        duration: 60,
        price: 45.00,
        category: 'Nails',
        isActive: true,
      }
    ]
    
    for (const serviceData of services) {
      // Find existing service by name
      const existingService = await prisma.service.findFirst({
        where: { name: serviceData.name }
      })
      
      let service;
      if (existingService) {
        // Update existing service
        service = await prisma.service.update({
          where: { id: existingService.id },
          data: serviceData
        })
      } else {
        // Create new service
        service = await prisma.service.create({
          data: serviceData
        })
      }
      
      // Assign service to all locations
      for (const location of createdLocations) {
        // First check if the location-service relationship already exists
        const existingLocationService = await prisma.locationService.findFirst({
          where: {
            locationId: location.id,
            serviceId: service.id
          }
        })
        
        // If it doesn't exist, create it
        if (!existingLocationService) {
          await prisma.locationService.create({
            data: {
              id: uuidv4(),
              locationId: location.id,
              serviceId: service.id,
              isActive: true,
            },
          })
        }
      }
      
      console.log(`   ✅ ${service.name} service created/updated`)
    }
    
    // Create sample products (inventory)
    console.log('🛍️ Creating sample products...')
    const products = [
      {
        id: uuidv4(),
        name: 'Shampoo - Repair',
        description: 'Professional repair shampoo for damaged hair',
        price: 25.00,
        cost: 12.00,
        category: 'Hair Care',
        type: 'Shampoo',
        brand: 'Loreal',
        sku: 'SHAM-001',
        isActive: true,
        isRetail: true,
      },
      {
        id: uuidv4(),
        name: 'Hair Conditioner - Moisture',
        description: 'Moisturizing conditioner for dry hair',
        price: 28.00,
        cost: 14.00,
        category: 'Hair Care',
        type: 'Conditioner',
        brand: 'Loreal',
        sku: 'COND-001',
        isActive: true,
        isRetail: true,
      },
      {
        id: uuidv4(),
        name: 'Nail Polish - Red',
        description: 'Professional long-lasting nail polish',
        price: 15.00,
        cost: 7.00,
        category: 'Nails',
        type: 'Polish',
        brand: 'OPI',
        sku: 'POLISH-001',
        isActive: true,
        isRetail: true,
      }
    ]
    
    for (const productData of products) {
      // First check if the product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { sku: productData.sku }
      })
      
      let product;
      if (existingProduct) {
        // Update existing product
        product = await prisma.product.update({
          where: { id: existingProduct.id },
          data: productData
        })
      } else {
        // Create new product
        product = await prisma.product.create({
          data: productData
        })
      }
      
      // Create product locations with stock
      for (const location of createdLocations) {
        // First check if the product-location relationship already exists
        const existingProductLocation = await prisma.productLocation.findFirst({
          where: {
            productId: product.id,
            locationId: location.id
          }
        })
        
        // If it doesn't exist, create it
        if (!existingProductLocation) {
          await prisma.productLocation.create({
            data: {
              id: uuidv4(),
              productId: product.id,
              locationId: location.id,
              stock: 50,
              isActive: true,
            },
          })
        }
      }
      
      console.log(`   ✅ ${product.name} product created/updated`)
    }
    
    // Create sample clients
    console.log('👥 Creating sample clients...')
    const clients = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+974 1111 1111',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+974 2222 2222',
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        phone: '+974 3333 3333',
      }
    ]
    
    for (const clientData of clients) {
      // First create a user for the client
      const clientUser = await prisma.user.upsert({
        where: { email: clientData.email },
        update: {
          role: 'CLIENT',
          isActive: true,
        },
        create: {
          id: uuidv4(),
          email: clientData.email,
          password: await bcrypt.hash('Client123#', 10),
          role: 'CLIENT',
          isActive: true,
        },
      })
      
      // Then create the client profile
      const client = await prisma.client.upsert({
        where: { userId: clientUser.id },
        update: {
          name: clientData.name,
          phone: clientData.phone,
        },
        create: {
          id: uuidv4(),
          userId: clientUser.id,
          name: clientData.name,
          phone: clientData.phone,
        },
      })
      
      console.log(`   ✅ ${client.name} client created/updated`)
    }
    
    console.log('\n🎉 Complete setup completed successfully!')
    console.log('\n🔐 Admin Login Credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    console.log('   Role: ADMIN')
    
  } catch (error) {
    console.error('❌ Error in complete setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simpleSetup()