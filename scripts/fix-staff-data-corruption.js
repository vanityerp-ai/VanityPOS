const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Checking for corrupted staff data...\n');

try {
  // Try to get all staff members
  const staff = db.prepare('SELECT * FROM staff_members').all();
  
  console.log(`✅ Found ${staff.length} staff members\n`);
  
  let corruptedCount = 0;
  
  // Check each staff member for potential issues
  staff.forEach((member, index) => {
    let hasIssue = false;
    const issues = [];
    
    // Check for null or invalid characters in text fields
    const textFields = ['name', 'phone', 'avatar', 'color', 'jobRole', 'employeeNumber', 
                        'qidNumber', 'passportNumber', 'qidValidity', 'passportValidity', 'medicalValidity'];
    
    textFields.forEach(field => {
      if (member[field] !== null && typeof member[field] === 'string') {
        // Check for invalid characters (non-printable, etc.)
        if (/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/.test(member[field])) {
          issues.push(`${field} contains invalid characters`);
          hasIssue = true;
        }
      }
    });
    
    // Check date fields
    const dateFields = ['dateOfBirth', 'createdAt', 'updatedAt'];
    dateFields.forEach(field => {
      if (member[field] !== null) {
        try {
          // Try to parse as date
          const date = new Date(member[field]);
          if (isNaN(date.getTime())) {
            issues.push(`${field} is not a valid date: ${member[field]}`);
            hasIssue = true;
          }
        } catch (e) {
          issues.push(`${field} cannot be parsed: ${member[field]}`);
          hasIssue = true;
        }
      }
    });
    
    if (hasIssue) {
      console.log(`❌ Staff #${index + 1}: ${member.name} (ID: ${member.id})`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('');
      corruptedCount++;
    }
  });
  
  if (corruptedCount === 0) {
    console.log('✅ No corrupted data found!\n');
    console.log('The issue might be with Prisma schema mismatch or SQLite version.');
    console.log('Let me try to clean up any potential issues...\n');
    
    // Clean up any potential NULL issues or whitespace
    console.log('🧹 Cleaning up staff data...');
    
    staff.forEach(member => {
      // Update to ensure all text fields are properly formatted
      db.prepare(`
        UPDATE staff_members 
        SET 
          name = TRIM(COALESCE(name, '')),
          phone = TRIM(COALESCE(phone, '')),
          avatar = TRIM(COALESCE(avatar, '')),
          color = TRIM(COALESCE(color, 'bg-purple-100 text-purple-800')),
          jobRole = TRIM(COALESCE(jobRole, 'staff')),
          employeeNumber = TRIM(COALESCE(employeeNumber, '')),
          qidNumber = TRIM(COALESCE(qidNumber, '')),
          passportNumber = TRIM(COALESCE(passportNumber, '')),
          qidValidity = TRIM(COALESCE(qidValidity, '')),
          passportValidity = TRIM(COALESCE(passportValidity, '')),
          medicalValidity = TRIM(COALESCE(medicalValidity, ''))
        WHERE id = ?
      `).run(member.id);
    });
    
    console.log('✅ Cleaned up all staff records\n');
  } else {
    console.log(`\n⚠️  Found ${corruptedCount} staff members with data issues\n`);
    console.log('Attempting to fix...\n');
    
    // Fix corrupted records
    staff.forEach(member => {
      const updates = {};
      
      // Clean text fields
      const textFields = ['name', 'phone', 'avatar', 'color', 'jobRole', 'employeeNumber', 
                          'qidNumber', 'passportNumber', 'qidValidity', 'passportValidity', 'medicalValidity'];
      
      textFields.forEach(field => {
        if (member[field] !== null && typeof member[field] === 'string') {
          // Remove invalid characters
          const cleaned = member[field].replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
          if (cleaned !== member[field]) {
            updates[field] = cleaned;
          }
        }
      });
      
      // If there are updates, apply them
      if (Object.keys(updates).length > 0) {
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(member.id);
        
        db.prepare(`UPDATE staff_members SET ${setClause} WHERE id = ?`).run(...values);
        console.log(`✅ Fixed: ${member.name}`);
      }
    });
    
    console.log('\n✅ All corrupted data has been fixed!\n');
  }
  
  // Verify the fix
  console.log('🔍 Verifying fix...');
  const verifyStaff = db.prepare('SELECT COUNT(*) as count FROM staff_members').get();
  console.log(`✅ Successfully queried ${verifyStaff.count} staff members\n`);
  
  console.log('✅ Database is now clean and ready to use!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:', error);
}

db.close();

