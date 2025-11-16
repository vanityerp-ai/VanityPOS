const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔄 Restoring receptionist accounts...\n');

// Receptionist data with original passwords
const receptionists = [
  {
    name: 'Medinat Khalifa Receptionist',
    email: 'medinat@habeshasalon.com',
    password: 'CLgpXjd6',
    location: 'loc3', // Medinat Khalifa
    locationName: 'Medinat Khalifa'
  },
  {
    name: 'D-Ring Road Receptionist',
    email: 'dring@habeshasalon.com',
    password: 'EVc3aecL',
    location: 'loc1', // D-Ring Road
    locationName: 'D-Ring Road'
  },
  {
    name: 'Muaither Receptionist',
    email: 'muaither@habeshasalon.com',
    password: 'BkrcQzLU',
    location: 'loc2', // Muaither
    locationName: 'Muaither'
  }
];

let created = 0;
let skipped = 0;

receptionists.forEach(receptionist => {
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(receptionist.email);
    
    if (existingUser) {
      console.log(`⏭️  Skipping ${receptionist.name} - User already exists`);
      skipped++;
      return;
    }
    
    // Hash the password
    const hashedPassword = bcrypt.hashSync(receptionist.password, 10);
    
    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT INTO users (id, email, password, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, 'STAFF', 1, datetime('now'), datetime('now'))
    `).run(userId, receptionist.email, hashedPassword);
    
    // Create staff member
    const staffId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate avatar (first letters)
    const nameParts = receptionist.name.split(' ');
    const avatar = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : receptionist.name.substring(0, 2).toUpperCase();
    
    db.prepare(`
      INSERT INTO staff_members (
        id, userId, name, jobRole, status, avatar, color,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, 'receptionist', 'ACTIVE', ?, 'bg-blue-100 text-blue-800', datetime('now'), datetime('now'))
    `).run(staffId, userId, receptionist.name, avatar);
    
    // Assign location
    const staffLocationId = `sl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    db.prepare(`
      INSERT INTO staff_locations (id, staffId, locationId, isActive, createdAt)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(staffLocationId, staffId, receptionist.location);
    
    console.log(`✅ Created: ${receptionist.name}`);
    console.log(`   Email: ${receptionist.email}`);
    console.log(`   Password: ${receptionist.password}`);
    console.log(`   Location: ${receptionist.locationName}`);
    console.log('');
    
    created++;
    
  } catch (error) {
    console.error(`❌ Error creating ${receptionist.name}:`, error.message);
  }
});

console.log(`\n✅ Receptionist restoration complete!`);
console.log(`   - Created: ${created} receptionists`);
console.log(`   - Skipped: ${skipped} (already exist)`);

console.log('\n📧 Receptionist Login Credentials:');
console.log('━'.repeat(80));
console.log('\n📍 Medinat Khalifa Location');
console.log('   Email:    medinat@habeshasalon.com');
console.log('   Password: CLgpXjd6');

console.log('\n📍 D-Ring Road Location');
console.log('   Email:    dring@habeshasalon.com');
console.log('   Password: EVc3aecL');

console.log('\n📍 Muaither Location');
console.log('   Email:    muaither@habeshasalon.com');
console.log('   Password: BkrcQzLU');

console.log('\n📍 Online Store');
console.log('   Email:    store@habeshasalon.com');
console.log('   Password: be5MLbcN');

console.log('\n' + '━'.repeat(80));
console.log('\n💡 Note: These receptionists can view and manage appointments for all staff');
console.log('   at their assigned location.\n');

db.close();

