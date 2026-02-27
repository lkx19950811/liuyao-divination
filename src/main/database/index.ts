import Database from 'better-sqlite3'
import type { Database as DatabaseType } from 'better-sqlite3'

let db: DatabaseType | null = null

export function initDatabase(dbPath: string): void {
  db = new Database(dbPath)
  
  db.pragma('journal_mode = WAL')
  
  createTables()
  seedData()
}

export function getDatabase(): DatabaseType {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

function createTables(): void {
  if (!db) return
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      method TEXT NOT NULL,
      original_hexagram_id INTEGER NOT NULL,
      changed_hexagram_id INTEGER,
      moving_yao_positions TEXT NOT NULL DEFAULT '[]',
      question TEXT,
      remark TEXT,
      coin_results TEXT,
      input_numbers TEXT,
      time_info TEXT,
      lunar_date TEXT,
      gan_zhi TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);
    CREATE INDEX IF NOT EXISTS idx_history_method ON history(method);
  `)
}

function seedData(): void {
  if (!db) return
  
  const defaultSettings = [
    { key: 'theme', value: 'system' },
    { key: 'fontSize', value: 'medium' },
    { key: 'hexagramStyle', value: 'traditional' },
    { key: 'autoSave', value: 'true' },
    { key: 'defaultMethod', value: 'time' }
  ]
  
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `)
  
  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value)
  }
}

export function saveHistory(record: {
  id: string
  createdAt: string
  method: string
  originalHexagramId: number
  changedHexagramId: number | null
  movingYaoPositions: number[]
  question: string | null
  remark: string | null
  coinResults: string | null
  inputNumbers: string | null
  timeInfo: string | null
  lunarDate: string | null
  ganZhi: string | null
}): void {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT INTO history (
      id, created_at, method, original_hexagram_id, changed_hexagram_id,
      moving_yao_positions, question, remark, coin_results, input_numbers,
      time_info, lunar_date, gan_zhi
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(
    record.id,
    record.createdAt,
    record.method,
    record.originalHexagramId,
    record.changedHexagramId,
    JSON.stringify(record.movingYaoPositions),
    record.question,
    record.remark,
    record.coinResults,
    record.inputNumbers,
    record.timeInfo,
    record.lunarDate,
    record.ganZhi
  )
}

export function getHistoryList(options?: {
  limit?: number
  offset?: number
  method?: string
}): Array<{
  id: string
  createdAt: string
  method: string
  originalHexagramId: number
  changedHexagramId: number | null
  movingYaoPositions: number[]
  question: string | null
}> {
  const db = getDatabase()
  
  let sql = 'SELECT * FROM history'
  const params: unknown[] = []
  
  if (options?.method) {
    sql += ' WHERE method = ?'
    params.push(options.method)
  }
  
  sql += ' ORDER BY created_at DESC'
  
  if (options?.limit) {
    sql += ' LIMIT ?'
    params.push(options.limit)
    
    if (options?.offset) {
      sql += ' OFFSET ?'
      params.push(options.offset)
    }
  }
  
  const stmt = db.prepare(sql)
  const rows = stmt.all(...params) as Array<{
    id: string
    created_at: string
    method: string
    original_hexagram_id: number
    changed_hexagram_id: number | null
    moving_yao_positions: string
    question: string | null
  }>
  
  return rows.map(row => ({
    id: row.id,
    createdAt: row.created_at,
    method: row.method,
    originalHexagramId: row.original_hexagram_id,
    changedHexagramId: row.changed_hexagram_id,
    movingYaoPositions: JSON.parse(row.moving_yao_positions),
    question: row.question
  }))
}

export function getHistoryById(id: string): {
  id: string
  createdAt: string
  updatedAt: string
  method: string
  originalHexagramId: number
  changedHexagramId: number | null
  movingYaoPositions: number[]
  question: string | null
  remark: string | null
  coinResults: string | null
  inputNumbers: string | null
  timeInfo: string | null
  lunarDate: string | null
  ganZhi: string | null
} | null {
  const db = getDatabase()
  
  const stmt = db.prepare('SELECT * FROM history WHERE id = ?')
  const row = stmt.get(id) as {
    id: string
    created_at: string
    updated_at: string
    method: string
    original_hexagram_id: number
    changed_hexagram_id: number | null
    moving_yao_positions: string
    question: string | null
    remark: string | null
    coin_results: string | null
    input_numbers: string | null
    time_info: string | null
    lunar_date: string | null
    gan_zhi: string | null
  } | undefined
  
  if (!row) return null
  
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    method: row.method,
    originalHexagramId: row.original_hexagram_id,
    changedHexagramId: row.changed_hexagram_id,
    movingYaoPositions: JSON.parse(row.moving_yao_positions),
    question: row.question,
    remark: row.remark,
    coinResults: row.coin_results,
    inputNumbers: row.input_numbers,
    timeInfo: row.time_info,
    lunarDate: row.lunar_date,
    ganZhi: row.gan_zhi
  }
}

export function updateHistory(id: string, updates: {
  question?: string
  remark?: string
}): void {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    UPDATE history 
    SET question = COALESCE(?, question),
        remark = COALESCE(?, remark),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  
  stmt.run(updates.question ?? null, updates.remark ?? null, id)
}

export function deleteHistory(id: string): void {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM history WHERE id = ?')
  stmt.run(id)
}

export function searchHistory(keyword: string): Array<{
  id: string
  createdAt: string
  method: string
  originalHexagramId: number
  question: string | null
}> {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    SELECT id, created_at, method, original_hexagram_id, question 
    FROM history 
    WHERE question LIKE ? OR remark LIKE ?
    ORDER BY created_at DESC
  `)
  
  const searchTerm = `%${keyword}%`
  const rows = stmt.all(searchTerm, searchTerm) as Array<{
    id: string
    created_at: string
    method: string
    original_hexagram_id: number
    question: string | null
  }>
  
  return rows.map(row => ({
    id: row.id,
    createdAt: row.created_at,
    method: row.method,
    originalHexagramId: row.original_hexagram_id,
    question: row.question
  }))
}

export function getSetting(key: string): string | null {
  const db = getDatabase()
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
  const row = stmt.get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `)
  stmt.run(key, value, value)
}

export function getAllSettings(): Record<string, string> {
  const db = getDatabase()
  const stmt = db.prepare('SELECT key, value FROM settings')
  const rows = stmt.all() as Array<{ key: string; value: string }>
  
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, string>)
}
