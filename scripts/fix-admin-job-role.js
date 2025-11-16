const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔧 Fixing ADMIN jobRole to lowercase...\n');

try {
  // Find staff with ADMIN jobRole (uppercase)
  const adminStaff = db.prepare("SELECT id, name, jobRole FROM staff_members WHERE jobRole = 'ADMIN'").all();
  
  if (adminStaff.length === 0) {
    console.log('✅ No staff with uppercase ADMIN jobRole found\n');
  } else {
    console.log(`📋 Found ${adminStaff.length} staff with uppercase ADMIN jobRole:\n`);
    
    adminStaff.forEach(staff => {
      console.log(`   - ${staff.name} (ID: ${staff.id})`);
      
      // Update to lowercase
      db.prepare("UPDATE staff_members SET jobRole = 'admin' WHERE id = ?").run(staff.id);
      console.log(`     ✅ Updated to lowercase 'admin'\n`);
    });
    
    console.log(`✅ Fixed ${adminStaff.length} staff members\n`);
  }
  
  // Verify the fix
  console.log('🔍 Verifying fix...');
  const allAdmins = db.prepare("SELECT id, name, jobRole FROM staff_members WHERE jobRole LIKE '%admin%'").all();
  
  console.log('\n📋 All admin staff after fix:');
  allAdmins.forEach(staff => {
    console.log(`   - ${staff.name}: jobRole = "${staff.jobRole}"`);
  });
  
  console.log('\n✅ Fix complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();

