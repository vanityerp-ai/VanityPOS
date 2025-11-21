// Test the frontend service call simulation
import { createServer } from 'node:http'
import { parse } from 'node:url'
import next from 'next'

async function testFrontendServiceCall() {
  try {
    console.log('🔍 Testing frontend service call simulation...')
    
    const dev = process.env.NODE_ENV !== 'production'
    const hostname = 'localhost'
    const port = 3001
    const app = next({ dev, hostname, port })
    const handle = app.getRequestHandler()
    
    await app.prepare()
    console.log(`✅ Next.js app prepared on http://${hostname}:${port}`)
    
    // Create a simple server to test the API call
    const server = createServer(async (req, res) => {
      const parsedUrl = parse(req.url!, true)
      
      // Test the services API endpoint
      if (parsedUrl.pathname === '/test-services') {
        try {
          console.log('🔄 Making services API call...')
          
          // Simulate the frontend fetch call
          const response = await fetch(`http://${hostname}:${port}/api/services`)
          
          console.log(`📡 Services API response status: ${response.status}`)
          
          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Services API success! Found ${data.services?.length || 0} services`)
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: true,
              servicesCount: data.services?.length || 0,
              message: `Successfully fetched ${data.services?.length || 0} services`
            }))
          } else {
            const errorText = await response.text()
            console.error(`❌ Services API error: ${response.status} - ${errorText}`)
            
            res.writeHead(response.status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: false,
              error: `Services API error: ${response.status}`,
              details: errorText
            }))
          }
        } catch (error) {
          console.error('❌ Error in services API call:', error)
          
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
          }))
        }
      } else {
        // Handle with Next.js
        handle(req, res, parsedUrl)
      }
    })
    
    server.listen(port, () => {
      console.log(`🚀 Test server running on http://${hostname}:${port}`)
      console.log(`🔄 Testing services API call...`)
      
      // Make the test call
      fetch(`http://${hostname}:${port}/test-services`)
        .then(async response => {
          const data = await response.json()
          console.log('📋 Test result:', data)
          
          // Close the server
          server.close(() => {
            console.log('🛑 Test server closed')
          })
        })
        .catch(error => {
          console.error('❌ Test call failed:', error)
          
          // Close the server
          server.close(() => {
            console.log('🛑 Test server closed')
          })
        })
    })
    
  } catch (error) {
    console.error('❌ Error in frontend service call test:', error)
  }
}

testFrontendServiceCall()