#!/usr/bin/env node

/**
 * Check Staff Assigned to Muaither Location
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');

console.log('🔍 Checking staff assigned to Muaither location...\n');
console.log(`📁 Database: ${dbPath}\n`);

try {
  const db = new Database(dbPath);
  
  // Get Muaither location
  const muaitherLocation = db.prepare('SELECT * FROM locations WHERE id = ?').get('loc2');
  
  if (!muaitherLocation) {
    console.log('❌ Muaither location (loc2) not found!');
    process.exit(1);
  }
  
  console.log('📍 Location Details:');
  console.log(`   ID: ${muaitherLocation.id}`);
  console.log(`   Name: ${muaitherLocation.name}`);
  console.log('');
  
  // Get all staff assigned to Muaither
  const staffLocations = db.prepare(`
    SELECT sl.*, sm.name, sm.jobRole, sm.status, u.email
    FROM staff_locations sl
    JOIN staff_members sm ON sl.staffId = sm.id
    JOIN users u ON sm.userId = u.id
    WHERE sl.locationId = ? AND sl.isActive = 1
    ORDER BY sm.name
  `).all('loc2');
  
  console.log(`👥 Staff Assigned to Muaither (${staffLocations.length} total):\n`);
  console.log('='.repeat(80));
  
  if (staffLocations.length === 0) {
    console.log('⚠️  No staff members assigned to Muaither location!');
  } else {
    staffLocations.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.name}`);
      console.log(`   Email: ${staff.email}`);
      console.log(`   Job Role: ${staff.jobRole || 'Not specified'}`);
      console.log(`   Status: ${staff.status}`);
      console.log(`   Staff ID: ${staff.staffId}`);
      console.log('');
    });
  }
  
  console.log('='.repeat(80));
  
  // Get all locations and their staff counts
  console.log('\n📊 Staff Distribution Across All Locations:\n');
  
  const allLocations = db.prepare('SELECT * FROM locations ORDER BY name').all();
  
  allLocations.forEach(location => {
    const count = db.prepare(`
      SELECT COUNT(*) as count
      FROM staff_locations
      WHERE locationId = ? AND isActive = 1
    `).get(location.id);
    
    console.log(`${location.name} (${location.id}): ${count.count} staff members`);
  });
  
  console.log('');
  
  // Get all staff members and their locations
  console.log('\n👥 All Staff Members and Their Locations:\n');
  console.log('='.repeat(80));
  
  const allStaff = db.prepare(`
    SELECT sm.id, sm.name, sm.jobRole, sm.status, u.email
    FROM staff_members sm
    JOIN users u ON sm.userId = u.id
    WHERE sm.status = 'ACTIVE'
    ORDER BY sm.name
  `).all();
  
  allStaff.forEach((staff, index) => {
    const locations = db.prepare(`
      SELECT l.name, l.id
      FROM staff_locations sl
      JOIN locations l ON sl.locationId = l.id
      WHERE sl.staffId = ? AND sl.isActive = 1
    `).all(staff.id);
    
    console.log(`${index + 1}. ${staff.name} (${staff.jobRole || 'No role'})`);
    console.log(`   Email: ${staff.email}`);
    console.log(`   Locations: ${locations.map(l => l.name).join(', ') || 'None assigned'}`);
    console.log('');
  });
  
  console.log('='.repeat(80));
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

