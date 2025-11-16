const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Checking jobRole values in database...\n');

try {
  const staff = db.prepare('SELECT id, name, jobRole FROM staff_members ORDER BY name').all();
  
  console.log(`📋 Found ${staff.length} staff members\n`);
  
  // Group by jobRole
  const roleGroups = {};
  
  staff.forEach(member => {
    const role = member.jobRole || 'NULL';
    if (!roleGroups[role]) {
      roleGroups[role] = [];
    }
    roleGroups[role].push(member.name);
  });
  
  console.log('📊 Staff grouped by jobRole:\n');
  
  Object.keys(roleGroups).sort().forEach(role => {
    console.log(`${role}:`);
    roleGroups[role].forEach(name => {
      console.log(`   - ${name}`);
    });
    console.log('');
  });
  
  // Check for roles that should be hidden
  console.log('⚠️  Roles that should be HIDDEN from calendar:');
  const hiddenRoles = ['receptionist', 'online_store_receptionist', 'admin', 'manager', 'super_admin'];
  
  hiddenRoles.forEach(role => {
    const count = roleGroups[role]?.length || 0;
    if (count > 0) {
      console.log(`   - ${role}: ${count} staff members`);
      roleGroups[role].forEach(name => {
        console.log(`      • ${name}`);
      });
    }
  });
  
  console.log('\n✅ Check complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();

