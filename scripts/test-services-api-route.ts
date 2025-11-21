// Test the services API route directly
import { NextRequest } from "next/server"
import { GET as ServicesGET } from "@/app/api/services/route"

async function testServicesAPIRoute() {
  try {
    console.log('🔍 Testing services API route directly...')
    
    // Create a mock request
    const mockRequest = {
      url: 'http://localhost:3000/api/services',
      method: 'GET',
      headers: {
        get: (name: string) => null
      }
    } as unknown as NextRequest
    
    // Call the GET function directly
    console.log('🔄 Calling services GET route...')
    const response = await ServicesGET(mockRequest)
    
    console.log(`📡 Response status: ${response.status}`)
    
    if (response.status === 200) {
      const data = await response.json()
      console.log(`✅ Success! Found ${data.services?.length || 0} services`)
      
      if (data.services && data.services.length > 0) {
        console.log('📋 First service:')
        console.log(JSON.stringify(data.services[0], null, 2))
      }
    } else {
      const errorData = await response.json()
      console.error(`❌ Error response:`, errorData)
    }
  } catch (error) {
    console.error('❌ Error testing services API route:', error)
  }
}

testServicesAPIRoute()