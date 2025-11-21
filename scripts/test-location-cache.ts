import { locationCache } from "@/lib/location-cache"

async function testLocationCache() {
  try {
    console.log('🔍 Testing location cache...')
    
    // Try to refresh the cache
    console.log('🔄 Refreshing location cache...')
    await locationCache.refreshCache()
    
    // Get all locations
    console.log('📋 Getting all locations...')
    const allLocations = locationCache.getAllLocations()
    console.log(`✅ Found ${allLocations.length} locations in cache`)
    
    // Show all locations
    if (allLocations.length > 0) {
      console.log('\n📋 All locations in cache:')
      allLocations.forEach((location, index) => {
        console.log(`${index + 1}. ${location.name} (${location.id})`)
        console.log(`   Status: ${location.status}`)
        if (location.phone) {
          console.log(`   Phone: ${location.phone}`)
        }
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('❌ Error testing location cache:', error)
  }
}

testLocationCache()