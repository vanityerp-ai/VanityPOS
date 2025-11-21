// Test the locations API route directly
import { NextRequest } from "next/server"
import { GET as LocationsGET } from "@/app/api/locations/route"

async function testLocationsAPIRoute() {
  try {
    console.log('🔍 Testing locations API route directly...')
    
    // Create a mock request
    const mockRequest = {
      url: 'http://localhost:3000/api/locations',
      method: 'GET',
      headers: {
        get: (name: string) => null
      }
    } as unknown as NextRequest
    
    // Call the GET function directly
    console.log('🔄 Calling locations GET route...')
    const response = await LocationsGET(mockRequest)
    
    console.log(`📡 Response status: ${response.status}`)
    
    if (response.status === 200) {
      const data = await response.json()
      console.log(`✅ Success! Found ${data.locations?.length || 0} locations`)
      
      if (data.locations && data.locations.length > 0) {
        console.log('📋 First location:')
        console.log(JSON.stringify(data.locations[0], null, 2))
      }
    } else {
      const errorData = await response.json()
      console.error(`❌ Error response:`, errorData)
    }
  } catch (error) {
    console.error('❌ Error testing locations API route:', error)
  }
}

testLocationsAPIRoute()