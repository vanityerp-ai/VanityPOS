import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db')
console.log('📂 Database path:', dbPath)

const db = new Database(dbPath)

try {
  console.log('\n📋 Tables in database:')
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all()
  
  console.table(tables)
  
  // Check for User table variations
  const userTables = tables.filter((t: any) => t.name.toLowerCase().includes('user'))
  if (userTables.length > 0) {
    console.log('\n👤 User-related tables found:')
    userTables.forEach((table: any) => {
      console.log(`\n📊 Table: ${table.name}`)
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all()
      console.table(columns)
      
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get()
      console.log(`Total rows: ${(count as any).count}`)
    })
  }

} catch (error) {
  console.error('❌ Error:', error)
} finally {
  db.close()
}

