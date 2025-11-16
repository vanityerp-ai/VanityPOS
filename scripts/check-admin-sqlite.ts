import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db')
console.log('📂 Database path:', dbPath)

const db = new Database(dbPath)

try {
  console.log('\n🔍 Checking admin user...\n')

  // Find admin user
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@vanityhub.com')

  if (!admin) {
    console.log('❌ Admin user not found!')
    console.log('Creating admin user...\n')

    const hashedPassword = bcrypt.hashSync('Admin33#', 10)
    const id = `user_${Date.now()}`

    db.prepare(`
      INSERT INTO users (id, email, password, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, 'admin@vanityhub.com', hashedPassword, 'ADMIN', 1, new Date().toISOString(), new Date().toISOString())

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@vanityhub.com')
    console.log('🔑 Password: Admin33#')
  } else {
    console.log('✅ Admin user found!')
    console.log('📧 Email:', admin.email)
    console.log('👤 User ID:', admin.id)
    console.log('🔓 Active:', admin.isActive === 1 ? 'Yes' : 'No')
    console.log('👑 Role:', admin.role)

    // Test password
    const passwordMatch = bcrypt.compareSync('Admin33#', admin.password)
    console.log('🔑 Password "Admin33#" matches:', passwordMatch ? '✅ YES' : '❌ NO')

    if (!passwordMatch) {
      console.log('\n⚠️  Password mismatch detected! Resetting password...')
      const hashedPassword = bcrypt.hashSync('Admin33#', 10)
      db.prepare('UPDATE users SET password = ?, isActive = 1 WHERE email = ?')
        .run(hashedPassword, 'admin@vanityhub.com')
      console.log('✅ Password reset to: Admin33#')
    }
  }

  // List all users
  console.log('\n📋 All users in database:')
  const allUsers = db.prepare('SELECT email, role, isActive FROM users').all()
  console.table(allUsers)

} catch (error) {
  console.error('❌ Error:', error)
} finally {
  db.close()
}

