const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('📊 Current Staff Data in Database\n');
console.log('='.repeat(100));

// Get all users with their staff profiles and locations
const staff = db.prepare(`
  SELECT 
    u.email,
    u.role as userRole,
    s.name,
    s.employeeNumber,
    s.jobRole,
    s.phone,
    s.status,
    s.homeService,
    GROUP_CONCAT(l.name, ', ') as locations
  FROM users u
  LEFT JOIN staff_members s ON s.userId = u.id
  LEFT JOIN staff_locations sl ON sl.staffId = s.id
  LEFT JOIN locations l ON l.id = sl.locationId
  WHERE u.role IN ('ADMIN', 'STAFF')
  GROUP BY u.id, s.id
  ORDER BY s.employeeNumber, u.email
`).all();

console.log(`\n✅ Found ${staff.length} staff members in the database:\n`);

// Group by location
const byLocation = {};
const admins = [];

staff.forEach(s => {
  if (s.userRole === 'ADMIN') {
    admins.push(s);
  } else {
    const locs = s.locations || 'No Location';
    if (!byLocation[locs]) {
      byLocation[locs] = [];
    }
    byLocation[locs].push(s);
  }
});

// Display admins first
if (admins.length > 0) {
  console.log('👑 ADMIN ACCOUNTS');
  console.log('-'.repeat(100));
  admins.forEach(s => {
    console.log(`   Emp# ${s.employeeNumber || 'N/A'} | ${s.name || 'N/A'} | ${s.email}`);
    console.log(`   Role: ${s.jobRole || 'Admin'} | Locations: ${s.locations || 'All'}`);
    console.log('');
  });
}

// Display staff by location
Object.keys(byLocation).sort().forEach(location => {
  console.log(`\n📍 ${location.toUpperCase()}`);
  console.log('-'.repeat(100));
  
  byLocation[location].forEach(s => {
    const homeService = s.homeService ? '🏠 Home Service' : '';
    console.log(`   Emp# ${s.employeeNumber} | ${s.name} | ${s.jobRole}`);
    console.log(`   Email: ${s.email} | Phone: ${s.phone || 'N/A'} | Status: ${s.status} ${homeService}`);
    console.log('');
  });
});

// Summary by location
console.log('\n📊 SUMMARY BY LOCATION');
console.log('-'.repeat(100));
Object.keys(byLocation).sort().forEach(location => {
  console.log(`   ${location}: ${byLocation[location].length} staff members`);
});

console.log(`\n   Total Staff: ${staff.length - admins.length}`);
console.log(`   Total Admins: ${admins.length}`);
console.log(`   Grand Total: ${staff.length}`);

// Check for online store receptionist
console.log('\n🛒 ONLINE STORE RECEPTIONIST');
console.log('-'.repeat(100));
const onlineStoreReceptionist = db.prepare(`
  SELECT u.email, s.name, s.jobRole, s.employeeNumber
  FROM users u
  JOIN staff_members s ON s.userId = u.id
  WHERE s.jobRole = 'online_store_receptionist'
`).get();

if (onlineStoreReceptionist) {
  console.log(`   ✅ Found: ${onlineStoreReceptionist.name} (${onlineStoreReceptionist.email})`);
  console.log(`   Employee #: ${onlineStoreReceptionist.employeeNumber}`);
  console.log(`   Job Role: ${onlineStoreReceptionist.jobRole}`);
} else {
  console.log('   ⚠️  No online store receptionist found');
}

// Check for staff with missing data
console.log('\n⚠️  STAFF WITH MISSING DATA');
console.log('-'.repeat(100));
const missingData = db.prepare(`
  SELECT name, employeeNumber,
    CASE WHEN dateOfBirth IS NULL THEN 1 ELSE 0 END as noDOB,
    CASE WHEN phone IS NULL THEN 1 ELSE 0 END as noPhone,
    CASE WHEN qidNumber IS NULL THEN 1 ELSE 0 END as noQID,
    CASE WHEN passportNumber IS NULL THEN 1 ELSE 0 END as noPassport
  FROM staff_members
  WHERE dateOfBirth IS NULL OR phone IS NULL OR qidNumber IS NULL OR passportNumber IS NULL
`).all();

if (missingData.length > 0) {
  missingData.forEach(s => {
    const missing = [];
    if (s.noDOB) missing.push('DOB');
    if (s.noPhone) missing.push('Phone');
    if (s.noQID) missing.push('QID');
    if (s.noPassport) missing.push('Passport');
    console.log(`   ${s.name} (Emp# ${s.employeeNumber}): Missing ${missing.join(', ')}`);
  });
} else {
  console.log('   ✅ All staff have complete data');
}

console.log('\n' + '='.repeat(100));
console.log('✅ Verification complete!\n');

db.close();

