const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Checking date fields in staff_members table...\n');

try {
  // Get table schema
  const schema = db.prepare("PRAGMA table_info(staff_members)").all();
  
  console.log('📋 Table Schema:');
  schema.forEach(col => {
    console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
  });
  
  console.log('\n🔍 Checking dateOfBirth values...\n');
  
  const staff = db.prepare('SELECT id, name, dateOfBirth, createdAt, updatedAt FROM staff_members').all();
  
  staff.forEach(member => {
    console.log(`${member.name}:`);
    console.log(`   dateOfBirth: ${member.dateOfBirth} (type: ${typeof member.dateOfBirth})`);
    console.log(`   createdAt: ${member.createdAt} (type: ${typeof member.createdAt})`);
    console.log(`   updatedAt: ${member.updatedAt} (type: ${typeof member.updatedAt})`);
    console.log('');
  });
  
  // Check for any non-standard date formats
  console.log('🔍 Looking for problematic date values...\n');
  
  const problematic = staff.filter(member => {
    if (member.dateOfBirth) {
      // Check if it's a valid ISO date string or timestamp
      const isValidDate = /^\d{4}-\d{2}-\d{2}/.test(member.dateOfBirth) || !isNaN(Date.parse(member.dateOfBirth));
      if (!isValidDate) {
        return true;
      }
    }
    return false;
  });
  
  if (problematic.length > 0) {
    console.log(`❌ Found ${problematic.length} staff with problematic dateOfBirth values:`);
    problematic.forEach(member => {
      console.log(`   - ${member.name}: "${member.dateOfBirth}"`);
    });
  } else {
    console.log('✅ All dateOfBirth values are in valid format');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();

