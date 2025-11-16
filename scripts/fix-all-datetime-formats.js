const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔧 Fixing ALL DateTime formats in database...\n');

try {
  // Get all staff members
  const staff = db.prepare('SELECT id, name, dateOfBirth, createdAt, updatedAt FROM staff_members').all();
  
  console.log(`📋 Found ${staff.length} staff members\n`);
  
  let fixedCount = 0;
  
  staff.forEach(member => {
    let needsUpdate = false;
    const updates = {};
    
    // Check and fix createdAt
    if (member.createdAt) {
      const createdAtStr = String(member.createdAt);
      // If it's a number (timestamp)
      if (!isNaN(member.createdAt) && typeof member.createdAt === 'number') {
        const date = new Date(member.createdAt);
        updates.createdAt = date.toISOString();
        needsUpdate = true;
      }
      // If it's a string without 'T' (like "2025-11-16 21:06:50")
      else if (typeof member.createdAt === 'string' && !member.createdAt.includes('T')) {
        const date = new Date(member.createdAt.replace(' ', 'T') + 'Z');
        updates.createdAt = date.toISOString();
        needsUpdate = true;
      }
    }
    
    // Check and fix updatedAt
    if (member.updatedAt) {
      const updatedAtStr = String(member.updatedAt);
      // If it's a number (timestamp)
      if (!isNaN(member.updatedAt) && typeof member.updatedAt === 'number') {
        const date = new Date(member.updatedAt);
        updates.updatedAt = date.toISOString();
        needsUpdate = true;
      }
      // If it's a string without 'T' (like "2025-11-16 21:06:50")
      else if (typeof member.updatedAt === 'string' && !member.updatedAt.includes('T')) {
        const date = new Date(member.updatedAt.replace(' ', 'T') + 'Z');
        updates.updatedAt = date.toISOString();
        needsUpdate = true;
      }
    }
    
    // Check and fix dateOfBirth
    if (member.dateOfBirth && typeof member.dateOfBirth === 'string') {
      // If it's in YYYY-MM-DD format (without time)
      if (/^\d{4}-\d{2}-\d{2}$/.test(member.dateOfBirth)) {
        const date = new Date(member.dateOfBirth + 'T00:00:00.000Z');
        updates.dateOfBirth = date.toISOString();
        needsUpdate = true;
      }
      // If it's a string without 'T' (like "2025-11-16 21:06:50")
      else if (!member.dateOfBirth.includes('T')) {
        const date = new Date(member.dateOfBirth.replace(' ', 'T') + 'Z');
        updates.dateOfBirth = date.toISOString();
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(member.id);
      
      db.prepare(`UPDATE staff_members SET ${setClause} WHERE id = ?`).run(...values);
      
      console.log(`✅ Fixed: ${member.name}`);
      if (updates.createdAt) console.log(`   createdAt: ${member.createdAt} → ${updates.createdAt}`);
      if (updates.updatedAt) console.log(`   updatedAt: ${member.updatedAt} → ${updates.updatedAt}`);
      if (updates.dateOfBirth) console.log(`   dateOfBirth: ${member.dateOfBirth} → ${updates.dateOfBirth}`);
      console.log('');
      
      fixedCount++;
    }
  });
  
  if (fixedCount === 0) {
    console.log('✅ All DateTime fields are already in correct format!\n');
  } else {
    console.log(`\n✅ Fixed ${fixedCount} staff members\n`);
  }
  
  // Verify the fix
  console.log('🔍 Verifying fix...');
  const verifyStaff = db.prepare('SELECT id, name, dateOfBirth, createdAt, updatedAt FROM staff_members LIMIT 5').all();
  
  console.log('\n📋 Sample records after fix:');
  verifyStaff.forEach(member => {
    console.log(`\n${member.name}:`);
    console.log(`   dateOfBirth: ${member.dateOfBirth}`);
    console.log(`   createdAt: ${member.createdAt}`);
    console.log(`   updatedAt: ${member.updatedAt}`);
  });
  
  console.log('\n✅ All DateTime formats have been standardized to ISO format!');
  console.log('🔄 Please refresh your browser to see the changes.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:', error);
}

db.close();

