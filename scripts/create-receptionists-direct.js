#!/usr/bin/env node

/**
 * Create Receptionist Accounts - Direct SQLite Access
 * This script directly inserts receptionist accounts into the SQLite database
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');

console.log('🔐 Creating receptionist accounts...\n');
console.log(`📁 Database: ${dbPath}\n`);

// Generate random password
function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Hash password
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// Generate unique ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const receptionists = [
  {
    email: 'medinat@habeshasalon.com',
    name: 'Medinat Khalifa Receptionist',
    locationId: 'loc3',
    locationName: 'Medinat Khalifa',
    phone: '+974 345-6789'
  },
  {
    email: 'dring@habeshasalon.com',
    name: 'D-Ring Road Receptionist',
    locationId: 'loc1',
    locationName: 'D-ring road',
    phone: '+974 123-4567'
  },
  {
    email: 'muaither@habeshasalon.com',
    name: 'Muaither Receptionist',
    locationId: 'loc2',
    locationName: 'Muaither',
    phone: '+974 234-5678'
  },
  {
    email: 'store@habeshasalon.com',
    name: 'Online Store Receptionist',
    locationId: 'online',
    locationName: 'Online Store',
    phone: '+974 567-8901'
  }
];

try {
  // Open database
  const db = new Database(dbPath);
  
  const credentials = [];
  
  for (const receptionist of receptionists) {
    // Generate password
    const password = generateRandomPassword();
    const hashedPassword = hashPassword(password);
    
    // Check if location exists
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(receptionist.locationId);
    
    if (!location) {
      console.log(`  ⚠️  Location not found: ${receptionist.locationName} (${receptionist.locationId})`);
      console.log(`     Skipping ${receptionist.email}\n`);
      continue;
    }
    
    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(receptionist.email);
    
    if (user) {
      // Update existing user
      db.prepare(`
        UPDATE users 
        SET password = ?, role = 'STAFF', isActive = 1, updatedAt = datetime('now')
        WHERE email = ?
      `).run(hashedPassword, receptionist.email);
      console.log(`  ✅ Updated user: ${receptionist.email}`);
    } else {
      // Create new user
      const userId = generateId('user');
      db.prepare(`
        INSERT INTO users (id, email, password, role, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, 'STAFF', 1, datetime('now'), datetime('now'))
      `).run(userId, receptionist.email, hashedPassword);
      user = { id: userId, email: receptionist.email };
      console.log(`  ✅ Created user: ${receptionist.email}`);
    }
    
    // Get user ID
    const currentUser = db.prepare('SELECT * FROM users WHERE email = ?').get(receptionist.email);
    
    // Check if staff member exists
    let staffMember = db.prepare('SELECT * FROM staff_members WHERE userId = ?').get(currentUser.id);
    
    if (staffMember) {
      // Update existing staff member
      db.prepare(`
        UPDATE staff_members
        SET name = ?, phone = ?, jobRole = 'receptionist', status = 'ACTIVE',
            avatar = ?, color = 'bg-blue-100 text-blue-800', updatedAt = datetime('now')
        WHERE userId = ?
      `).run(
        receptionist.name,
        receptionist.phone,
        receptionist.name.split(' ').map(n => n[0]).join(''),
        currentUser.id
      );
      console.log(`  ✅ Updated staff member: ${receptionist.name}`);
    } else {
      // Create new staff member
      const staffId = generateId('staff');
      db.prepare(`
        INSERT INTO staff_members (id, userId, name, phone, avatar, color, jobRole, homeService, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'bg-blue-100 text-blue-800', 'receptionist', 0, 'ACTIVE', datetime('now'), datetime('now'))
      `).run(
        staffId,
        currentUser.id,
        receptionist.name,
        receptionist.phone,
        receptionist.name.split(' ').map(n => n[0]).join('')
      );
      staffMember = { id: staffId };
      console.log(`  ✅ Created staff member: ${receptionist.name}`);
    }
    
    // Get staff member ID
    const currentStaff = db.prepare('SELECT * FROM staff_members WHERE userId = ?').get(currentUser.id);

    // Check if staff location assignment exists
    const existingAssignment = db.prepare(`
      SELECT * FROM staff_locations
      WHERE staffId = ? AND locationId = ?
    `).get(currentStaff.id, receptionist.locationId);

    if (!existingAssignment) {
      const staffLocId = generateId('staffloc');
      db.prepare(`
        INSERT INTO staff_locations (id, staffId, locationId, isActive, createdAt)
        VALUES (?, ?, ?, 1, datetime('now'))
      `).run(staffLocId, currentStaff.id, receptionist.locationId);
      console.log(`  ✅ Assigned to location: ${receptionist.locationName}`);
    } else {
      console.log(`  ⏭️  Already assigned to location: ${receptionist.locationName}`);
    }

    // Store credentials
    credentials.push({
      email: receptionist.email,
      password: password,
      location: receptionist.locationName
    });

    console.log('');
  }

  // Close database
  db.close();

  // Display credentials
  console.log('\n' + '='.repeat(80));
  console.log('📋 RECEPTIONIST LOGIN CREDENTIALS');
  console.log('='.repeat(80) + '\n');

  credentials.forEach(cred => {
    console.log(`Location: ${cred.location}`);
    console.log(`Email:    ${cred.email}`);
    console.log(`Password: ${cred.password}`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('⚠️  IMPORTANT: Save these credentials securely!');
  console.log('='.repeat(80) + '\n');

  console.log('✅ All receptionist accounts created successfully!\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

