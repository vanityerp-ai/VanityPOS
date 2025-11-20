/**
 * Diagnostic script to check for duplicate services in the database
 */

async function diagnoseDuplicateServices() {
  console.log('🔍 Diagnosing duplicate services...');
  
  try {
    // Fetch all services from the API
    const response = await fetch('http://localhost:3001/api/services');
    
    if (!response.ok) {
      console.error('❌ Failed to fetch services:', response.statusText);
      return;
    }
    
    const data = await response.json();
    const services = data.services || [];
    
    console.log(`📊 Total services: ${services.length}`);
    
    // Check for duplicate service IDs
    const serviceIds = services.map(s => s.id);
    const uniqueServiceIds = [...new Set(serviceIds)];
    
    if (serviceIds.length !== uniqueServiceIds.length) {
      console.log(`⚠️ Duplicate service IDs found!`);
      console.log(`   Total IDs: ${serviceIds.length}`);
      console.log(`   Unique IDs: ${uniqueServiceIds.length}`);
      
      // Find duplicate IDs
      const duplicateIds = serviceIds.filter((id, index) => serviceIds.indexOf(id) !== index);
      console.log(`   Duplicate IDs:`, [...new Set(duplicateIds)]);
    } else {
      console.log('✅ All service IDs are unique');
    }
    
    // Check for services with identical names
    const serviceNames = services.map(s => s.name);
    const uniqueServiceNames = [...new Set(serviceNames)];
    
    if (serviceNames.length !== uniqueServiceNames.length) {
      console.log(`⚠️ Duplicate service names found!`);
      console.log(`   Total names: ${serviceNames.length}`);
      console.log(`   Unique names: ${uniqueServiceNames.length}`);
      
      // Find duplicate names
      const duplicateNames = serviceNames.filter((name, index) => serviceNames.indexOf(name) !== index);
      console.log(`   Duplicate names:`, [...new Set(duplicateNames)]);
      
      // Show services with duplicate names
      duplicateNames.forEach(name => {
        const duplicateServices = services.filter(s => s.name === name);
        console.log(`   Services with name "${name}":`, duplicateServices.map(s => ({
          id: s.id,
          category: s.category,
          price: s.price,
          duration: s.duration
        })));
      });
    } else {
      console.log('✅ All service names are unique');
    }
    
    // Specifically check for Brazilian Keratin Treatment services
    const keratinServices = services.filter(s => s.name.includes('Brazilian Keratin Treatment'));
    if (keratinServices.length > 0) {
      console.log(`\n🔍 Brazilian Keratin Treatment services:`);
      keratinServices.forEach(service => {
        console.log(`   - ${service.name} (ID: ${service.id})`);
      });
    }
    
    // Check for services with special characters in names that might cause issues
    const specialCharServices = services.filter(s => 
      s.name.includes('(') || s.name.includes(')') || s.name.includes('[') || s.name.includes(']')
    );
    if (specialCharServices.length > 0) {
      console.log(`\n⚠️ Services with special characters:`);
      specialCharServices.forEach(service => {
        console.log(`   - ${service.name} (ID: ${service.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error diagnosing services:', error);
  }
}

// Run the diagnostic
diagnoseDuplicateServices();