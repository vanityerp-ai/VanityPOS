const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('🔄 Starting staff data replacement...\n');

// First, get existing admin users to preserve them
const adminUsers = db.prepare(`
  SELECT u.*, s.id as staffId 
  FROM users u 
  LEFT JOIN staff_members s ON s.userId = u.id 
  WHERE u.role IN ('ADMIN', 'SUPER_ADMIN')
`).all();

console.log(`✅ Found ${adminUsers.length} admin users to preserve:`);
adminUsers.forEach(admin => {
  console.log(`   - ${admin.email} (${admin.role})`);
});

// Delete all non-admin staff and users
console.log('\n🗑️  Deleting existing non-admin staff...');

// Get all non-admin user IDs
const nonAdminUsers = db.prepare(`
  SELECT id FROM users WHERE role NOT IN ('ADMIN', 'SUPER_ADMIN')
`).all();

console.log(`   Found ${nonAdminUsers.length} non-admin users to delete`);

// Get all non-admin user IDs and staff IDs first
const nonAdminUserIds = db.prepare(`
  SELECT id FROM users WHERE role NOT IN ('ADMIN', 'SUPER_ADMIN')
`).all().map(u => u.id);

const nonAdminStaffIds = db.prepare(`
  SELECT id FROM staff_members
  WHERE userId IN (SELECT id FROM users WHERE role NOT IN ('ADMIN', 'SUPER_ADMIN'))
`).all().map(s => s.id);

// Delete related records first (foreign key constraints)
if (nonAdminUserIds.length > 0) {
  const userPlaceholders = nonAdminUserIds.map(() => '?').join(',');

  // 1. Delete transactions for non-admin users
  db.prepare(`DELETE FROM transactions WHERE userId IN (${userPlaceholders})`).run(...nonAdminUserIds);
  console.log('   - Deleted transactions');

  // 2. Delete clients (if any non-admin users are clients)
  db.prepare(`DELETE FROM clients WHERE userId IN (${userPlaceholders})`).run(...nonAdminUserIds);
  console.log('   - Deleted clients');

  // 3. Delete audit logs for non-admin users
  db.prepare(`DELETE FROM audit_logs WHERE userId IN (${userPlaceholders})`).run(...nonAdminUserIds);
  console.log('   - Deleted audit logs');
}

if (nonAdminStaffIds.length > 0) {
  const staffPlaceholders = nonAdminStaffIds.map(() => '?').join(',');

  // 4. Delete appointments assigned to non-admin staff
  db.prepare(`DELETE FROM appointments WHERE staffId IN (${staffPlaceholders})`).run(...nonAdminStaffIds);
  console.log('   - Deleted appointments');

  // 5. Delete staff_locations
  db.prepare(`DELETE FROM staff_locations WHERE staffId IN (${staffPlaceholders})`).run(...nonAdminStaffIds);
  console.log('   - Deleted staff locations');

  // 6. Delete staff schedules
  db.prepare(`DELETE FROM staff_schedules WHERE staffId IN (${staffPlaceholders})`).run(...nonAdminStaffIds);
  console.log('   - Deleted staff schedules');

  // 7. Delete staff services
  db.prepare(`DELETE FROM staff_services WHERE staffId IN (${staffPlaceholders})`).run(...nonAdminStaffIds);
  console.log('   - Deleted staff services');
}

// 8. Delete staff_members
db.prepare("DELETE FROM staff_members WHERE userId IN (SELECT id FROM users WHERE role NOT IN ('ADMIN', 'SUPER_ADMIN'))").run();
console.log('   - Deleted staff members');

// 9. Delete users
db.prepare("DELETE FROM users WHERE role NOT IN ('ADMIN', 'SUPER_ADMIN')").run();
console.log('   - Deleted users');

console.log('✅ Deleted all non-admin staff\n');

// Location mapping
const locationMap = {
  'D-Ring Road': 'loc1',
  'Medinat Khalifa': 'loc3',
  'Muaither': 'loc2',
  'Online store': 'online',
  'All': 'all'
};

// Role mapping
const roleMap = {
  'Admin': 'ADMIN',
  'Stylist': 'stylist',
  'Nail Artist': 'nail_technician',
  'Pedecurist': 'pedicurist',
  'Beautician': 'esthetician',
  'Sylist and Nail technician': 'stylist', // Note: typo in source data
  'Sales': 'online_store_receptionist'
};

// Staff data from the spreadsheet
const staffData = [
  { empNo: '9100', name: 'Tsedey Asefa', dob: '1986-05-10', email: 'Tsedey@habeshasalon.com', phone: '77798124', role: 'Admin', locations: 'All', status: 'Active', homeService: 'Yes', qid: '28623000532', passport: 'ep6252678', qidValidity: '2025-12-01', passportValidity: '2025-11-22', medicalValidity: '2026-01-01' },
  { empNo: '9101', name: 'Mekdes Bekele', dob: '1986-02-23', email: 'mekdes@habeshasalon.com', phone: '33481527', role: 'Stylist', locations: 'D-Ring Road', status: 'Active', homeService: 'Yes', qid: '28623003433', passport: 'EP7832122', qidValidity: '2025-12-01', passportValidity: '2028-05-24', medicalValidity: '2026-01-01' },
  { empNo: '9102', name: 'Aster Tarekegn', dob: '1990-09-04', email: 'aster@habeshasalon.com', phone: '66868083', role: 'Stylist', locations: 'D-Ring Road', status: 'Active', homeService: 'Yes', qid: '29023002985', passport: 'EP6586158', qidValidity: '2026-08-26', passportValidity: '2026-07-13', medicalValidity: '2026-01-01' },
  { empNo: '9103', name: 'Gelila Asrat', dob: '2000-01-28', email: 'gelila@habeshasalon.com', phone: '51101385', role: 'Nail Artist', locations: 'D-Ring Road', status: 'Active', homeService: 'Yes', qid: '30023001427', passport: 'EQ2036945', qidValidity: '2026-05-07', passportValidity: '2030-02-17', medicalValidity: '2026-01-01' },
  { empNo: '9104', name: 'Samri Tufa', dob: '1994-08-07', email: 'samri@habeshasalon.com', phone: '50579597', role: 'Nail Artist', locations: 'D-Ring Road', status: 'Active', homeService: 'Yes', qid: '29423002678', passport: 'EP6949093', qidValidity: '2026-01-21', passportValidity: '2027-03-08', medicalValidity: '2026-01-01' },
  { empNo: '9105', name: 'Vida Agbali', dob: '1992-10-25', email: 'Vida@habeshasalon.com', phone: '31407033', role: 'Stylist', locations: 'D-Ring Road', status: 'Active', homeService: 'Yes', qid: '29228801597', passport: 'G2323959', qidValidity: '2026-04-21', passportValidity: '2031-01-21', medicalValidity: '2026-01-01' },
  { empNo: '9106', name: 'Genet Yifru', dob: '1980-07-19', email: 'genet@habeshasalon.com', phone: '50085617', role: 'Pedecurist', locations: 'D-Ring Road', status: 'Active', homeService: 'Yes', qid: '28023003513', passport: 'EP7405867', qidValidity: '2026-02-25', passportValidity: '2027-12-13', medicalValidity: '2026-01-01' },
  { empNo: '9107', name: 'Woyni Tilahun', dob: '1987-07-12', email: 'Woyni@habeshasalon.com', phone: '33378522', role: 'Stylist', locations: 'Medinat Khalifa', status: 'Active', homeService: 'Yes', qid: '28723005500', passport: 'EP', qidValidity: '2025-09-17', passportValidity: '2027-10-20', medicalValidity: '2026-01-01' },
  { empNo: '9108', name: 'Habtam Wana', dob: '1989-09-20', email: 'habtam@habeshasalon.com', phone: '59996537', role: 'Stylist', locations: 'Medinat Khalifa', status: 'Active', homeService: 'Yes', qid: '28923005645', passport: 'EP6217793', qidValidity: '2026-02-25', passportValidity: '2025-10-18', medicalValidity: '2026-01-01' },
  { empNo: '9109', name: 'Jeri Hameso', dob: '1990-10-20', email: 'Jeri@habeshasalon.com', phone: '70365925', role: 'Stylist', locations: 'Medinat Khalifa', status: 'Active', homeService: 'Yes', qid: '29023004807', passport: 'EP8743913', qidValidity: '2025-07-09', passportValidity: '2029-03-17', medicalValidity: '2026-01-01' },
  { empNo: '9110', name: 'Beti-MK', dob: null, email: 'beti-mk@habeshasalon.com', phone: '66830977', role: 'Stylist', locations: 'Medinat Khalifa', status: 'Active', homeService: 'Yes', qid: null, passport: null, qidValidity: null, passportValidity: null, medicalValidity: '2026-01-01' },
  { empNo: '9111', name: 'Ruth Tadesse', dob: '1989-07-18', email: 'Ruth@habeshasalon.com', phone: '50227010', role: 'Beautician', locations: 'Muaither', status: 'Active', homeService: 'No', qid: '28923005561', passport: 'EP6757286', qidValidity: '2026-02-28', passportValidity: '2026-10-22', medicalValidity: '2026-01-01' },
  { empNo: '9112', name: 'Elsa Melaku', dob: '1979-11-10', email: 'Elsa@habeshasalon.com', phone: '50104456', role: 'Sylist and Nail technician', locations: 'Muaither', status: 'Active', homeService: 'No', qid: '27923002347', passport: 'EP7085203', qidValidity: '2027-07-11', passportValidity: '2027-06-19', medicalValidity: '2026-01-01' },
  { empNo: '9113', name: 'Titi Leakemaryam', dob: '1987-10-09', email: 'Titi@habeshasalon.com', phone: '59991432', role: 'Stylist', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '28723007773', passport: 'EP6197364', qidValidity: '2026-03-13', passportValidity: '2025-08-19', medicalValidity: '2026-01-01' },
  { empNo: '9114', name: 'Yenu Aschalew', dob: '1980-02-22', email: 'Yenu@habeshasalon.com', phone: '30614686', role: 'Beautician', locations: 'Muaither', status: 'Active', homeService: 'No', qid: '28023003515', passport: 'EP7979493', qidValidity: '2026-05-14', passportValidity: '2028-04-01', medicalValidity: '2026-01-01' },
  { empNo: '9115', name: 'Frie Bahru', dob: '1991-01-29', email: 'frie@habeshasalon.com', phone: '51179966', role: 'Beautician', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '29123003741', passport: 'EP7212333', qidValidity: '2026-01-15', passportValidity: '2027-07-17', medicalValidity: '2026-01-01' },
  { empNo: '9116', name: 'Zed Teklay', dob: '1995-05-16', email: 'zed@habeshasalon.com', phone: '50764570', role: 'Stylist', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '29523002064', passport: 'EP8133993', qidValidity: '2025-10-12', passportValidity: '2028-10-07', medicalValidity: '2026-01-01' },
  { empNo: '9117', name: 'Beti Thomas', dob: '1991-09-12', email: 'beti-thomas@habeshasalon.com', phone: '30732501', role: 'Stylist', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '29123002832', passport: 'EP6689476', qidValidity: '2026-05-02', passportValidity: '2026-09-13', medicalValidity: '2026-01-01' },
  { empNo: '9118', name: 'Maya Gebrezgi', dob: null, email: 'maya@habeshasalon.com', phone: '51337449', role: 'Stylist', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '222025002506', passport: null, qidValidity: null, passportValidity: null, medicalValidity: '2026-01-01' },
  { empNo: '9119', name: 'Tirhas Tajebe', dob: null, email: 'tirhas@habeshasalon.com', phone: null, role: 'Nail Artist', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '382025419997', passport: null, qidValidity: null, passportValidity: null, medicalValidity: '2026-01-01' },
  { empNo: '9120', name: 'Tsigereda Esayas', dob: null, email: 'tsigereda@habeshasalon.com', phone: '55849079', role: 'Stylist', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '382024482060', passport: null, qidValidity: null, passportValidity: null, medicalValidity: '2026-01-01' },
  { empNo: '9121', name: 'Shalom Kuna', dob: null, email: 'shalom@habeshasalon.com', phone: '551011295', role: 'Beautician', locations: 'Muaither', status: 'Active', homeService: 'Yes', qid: '29135634320', passport: null, qidValidity: null, passportValidity: null, medicalValidity: '2026-01-01' },
  { empNo: '9122', name: 'Samrawit Legese', dob: null, email: 'samrawit@habeshasalon.com', phone: '33462505', role: 'Sales', locations: 'Online store', status: 'Active', homeService: 'Yes', qid: null, passport: null, qidValidity: null, passportValidity: null, medicalValidity: null }
];

console.log(`📋 Processing ${staffData.length} staff members...\n`);

// Default password for all staff
const defaultPassword = 'Staff123#';
const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

let created = 0;
let skipped = 0;

staffData.forEach((staff, index) => {
  try {
    // Check if this is an admin user (Tsedey Asefa)
    const isAdmin = staff.role === 'Admin';
    
    // Check if user already exists (for admin)
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(staff.email.toLowerCase());
    
    if (existingUser && isAdmin) {
      console.log(`⏭️  Skipping ${staff.name} - Admin user already exists`);
      skipped++;
      return;
    }
    
    // Determine user role
    const userRole = isAdmin ? 'ADMIN' : 'STAFF';
    const jobRole = roleMap[staff.role] || 'stylist';
    
    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT INTO users (id, email, password, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(userId, staff.email.toLowerCase(), hashedPassword, userRole, staff.status === 'Active' ? 1 : 0);
    
    // Create staff member
    const staffId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate avatar (first letter of first and last name)
    const nameParts = staff.name.split(' ');
    const avatar = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : staff.name.substring(0, 2).toUpperCase();
    
    db.prepare(`
      INSERT INTO staff_members (
        id, userId, name, jobRole, phone, status, avatar, color,
        employeeNumber, dateOfBirth, qidNumber, passportNumber,
        qidValidity, passportValidity, medicalValidity, homeService,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      staffId,
      userId,
      staff.name,
      jobRole,
      staff.phone || null,
      staff.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
      avatar,
      'bg-blue-100 text-blue-800',
      staff.empNo,
      staff.dob || null,
      staff.qid || null,
      staff.passport || null,
      staff.qidValidity || null,
      staff.passportValidity || null,
      staff.medicalValidity || null,
      staff.homeService === 'Yes' ? 1 : 0
    );
    
    // Assign locations
    const locations = staff.locations === 'All' 
      ? ['loc1', 'loc2', 'loc3', 'online', 'home']
      : [locationMap[staff.locations] || 'loc1'];
    
    locations.forEach(locationId => {
      const staffLocationId = `sl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      db.prepare(`
        INSERT INTO staff_locations (id, staffId, locationId, isActive, createdAt)
        VALUES (?, ?, ?, 1, datetime('now'))
      `).run(staffLocationId, staffId, locationId);
    });
    
    console.log(`✅ Created: ${staff.name} (${staff.email}) - ${staff.role} at ${staff.locations}`);
    created++;
    
  } catch (error) {
    console.error(`❌ Error creating ${staff.name}:`, error.message);
  }
});

console.log(`\n✅ Staff data replacement complete!`);
console.log(`   - Created: ${created} staff members`);
console.log(`   - Skipped: ${skipped} (existing admins)`);
console.log(`   - Default password for all staff: ${defaultPassword}`);
console.log(`\n📧 Staff Login Credentials:`);
console.log(`   All staff can log in with their email and password: ${defaultPassword}\n`);

db.close();

