#!/usr/bin/env node

/**
 * Update Online Store Receptionist Role
 * 
 * This script updates the online store receptionist to have a special role
 * with limited permissions (POS and Inventory only)
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db');

console.log('🔧 Updating online store receptionist role...\n');
console.log(`📁 Database: ${dbPath}\n`);

try {
  const db = new Database(dbPath);
  
  // Get the online store receptionist
  const receptionist = db.prepare(`
    SELECT sm.*, u.email, u.role as userRole
    FROM staff_members sm
    JOIN users u ON sm.userId = u.id
    WHERE u.email = ?
  `).get('store@habeshasalon.com');
  
  if (!receptionist) {
    console.log('❌ Online store receptionist not found!');
    process.exit(1);
  }
  
  console.log('📋 Current Details:');
  console.log(`   Name: ${receptionist.name}`);
  console.log(`   Email: ${receptionist.email}`);
  console.log(`   Job Role: ${receptionist.jobRole}`);
  console.log(`   User Role: ${receptionist.userRole}`);
  console.log('');
  
  // Update the job role to indicate this is an online store receptionist
  db.prepare(`
    UPDATE staff_members
    SET jobRole = ?
    WHERE id = ?
  `).run('online_store_receptionist', receptionist.id);
  
  console.log('✅ Updated job role to: online_store_receptionist');
  console.log('');
  console.log('📝 Permissions for Online Store Receptionist:');
  console.log('   ✅ View Inventory');
  console.log('   ✅ Add Inventory (Create new products)');
  console.log('   ✅ Transfer Inventory (Between locations)');
  console.log('   ✅ View POS');
  console.log('   ✅ Create Sales');
  console.log('   ✅ Chat Access');
  console.log('   ❌ NO Appointment Access');
  console.log('   ❌ NO Client Management');
  console.log('   ❌ NO Inventory Editing');
  console.log('   ❌ NO Dashboard Access');
  console.log('');
  console.log('🎯 The online store receptionist can now:');
  console.log('   • Add new products to inventory');
  console.log('   • Transfer products between locations');
  console.log('   • Process sales through POS');
  console.log('   • Receive product sale notifications');
  console.log('   • Cannot edit existing inventory details');
  console.log('');
  
  db.close();
  
  console.log('✅ Update complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

