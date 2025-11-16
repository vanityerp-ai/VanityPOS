const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔄 Updating receptionist accounts...\n');

// Delete old receptionist accounts (the ones we created earlier)
const oldReceptionistEmails = [
  'medinat@habeshasalon.com',
  'dring@habeshasalon.com',
  'muaither@habeshasalon.com'
];

console.log('🗑️  Deleting old receptionist accounts...');
oldReceptionistEmails.forEach(email => {
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (user) {
    const staff = db.prepare('SELECT id FROM staff_members WHERE userId = ?').get(user.id);
    if (staff) {
      // Delete staff locations
      db.prepare('DELETE FROM staff_locations WHERE staffId = ?').run(staff.id);
      // Delete staff member
      db.prepare('DELETE FROM staff_members WHERE id = ?').run(staff.id);
    }
    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    console.log(`   ✅ Deleted ${email}`);
  }
});

// Keep the online store receptionist (store@habeshasalon.com) - it's already set up correctly

console.log('\n✅ Receptionist accounts updated!');
console.log('\n📋 Current Receptionist Accounts:');
console.log('   - store@habeshasalon.com (Online Store) - Password: be5MLbcN');
console.log('\n💡 Note: Location-specific receptionists have been removed.');
console.log('   The online store receptionist handles all online sales and inventory.');

db.close();

