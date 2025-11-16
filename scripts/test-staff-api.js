const http = require('http');

console.log('🧪 Testing Staff API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/staff',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ API is working!');
        console.log(`📊 Found ${jsonData.staff?.length || 0} staff members\n`);
        
        if (jsonData.staff && jsonData.staff.length > 0) {
          console.log('📋 Sample staff members:');
          jsonData.staff.slice(0, 5).forEach(staff => {
            console.log(`   - ${staff.name} (${staff.role || staff.jobRole})`);
          });
        }
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e.message);
        console.log('Response:', data);
      }
    } else {
      console.error('❌ API returned error status');
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();

