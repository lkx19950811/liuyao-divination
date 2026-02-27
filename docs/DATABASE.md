# 六爻预测App 数据库设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | 六爻预测 |
| 版本 | 1.0.0 |
| 文档状态 | 初稿 |
| 创建日期 | 2026-02-27 |
| 数据库类型 | SQLite 3.x |

---

## 1. 数据库概述

### 1.1 设计原则

- **轻量化**: 使用SQLite，无需独立数据库服务
- **离线优先**: 所有数据本地存储，支持完全离线运行
- **数据完整性**: 使用外键约束和事务保证数据一致性
- **可扩展性**: 预留字段，便于后续功能扩展

### 1.2 数据库文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 主数据库 | `{userData}/liuyao.db` | 用户数据和历史记录 |
| 内置数据 | `{appPath}/data/builtin.db` | 卦象、爻辞等内置数据 |

### 1.3 ER图

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  hexagrams   │       │    yaoci     │       │    najia     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ hexagram_id  │       │ hexagram_id  │
│ name         │       │ position     │       │ position     │
│ upper_trigram│       │ content      │       │ tiangan      │
│ lower_trigram│       │ interpretation│      │ dizhi        │
│ ...          │       └──────────────┘       │ wuxing       │
└──────────────┘                              │ liuqin       │
       │                                      └──────────────┘
       │
       │    ┌──────────────┐
       └────►│   history    │
            ├──────────────┤
            │ id (PK)      │
            │ original_hexagram_id
            │ changed_hexagram_id
            │ ...          │
            └──────────────┘
                   │
                   │
            ┌──────┴───────┐
            │              │
     ┌──────┴──────┐ ┌─────┴──────┐
     │  analysis   │ │  settings  │
     ├─────────────┤ ├────────────┤
     │ history_id  │ │ key (PK)   │
     │ ...         │ │ value      │
     └─────────────┘ └────────────┘
```

---

## 2. 数据表详细设计

### 2.1 卦象表 (hexagrams)

存储六十四卦的基本信息。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY | - | 卦象ID (1-64) |
| name | TEXT | NOT NULL | - | 卦名 |
| alias | TEXT | - | NULL | 卦名别名 |
| upper_trigram | TEXT | NOT NULL | - | 上卦（八卦名称） |
| lower_trigram | TEXT | NOT NULL | - | 下卦（八卦名称） |
| binary_repr | TEXT | NOT NULL | - | 二进制表示 (如: 111111) |
| guaci | TEXT | - | NULL | 卦辞 |
| tuanci | TEXT | - | NULL | 彖辞 |
| xiangci | TEXT | - | NULL | 象辞 |
| wuxing | TEXT | - | NULL | 卦宫五行 |
| palace | TEXT | - | NULL | 卦宫归属 |
| description | TEXT | - | NULL | 现代解读 |

**索引**:

```sql
CREATE INDEX idx_hexagrams_name ON hexagrams(name);
CREATE INDEX idx_hexagrams_upper ON hexagrams(upper_trigram);
CREATE INDEX idx_hexagrams_lower ON hexagrams(lower_trigram);
CREATE INDEX idx_hexagrams_binary ON hexagrams(binary_repr);
```

**建表语句**:

```sql
CREATE TABLE hexagrams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  upper_trigram TEXT NOT NULL,
  lower_trigram TEXT NOT NULL,
  binary_repr TEXT NOT NULL,
  guaci TEXT,
  tuanci TEXT,
  xiangci TEXT,
  wuxing TEXT,
  palace TEXT,
  description TEXT
);

CREATE INDEX idx_hexagrams_name ON hexagrams(name);
CREATE INDEX idx_hexagrams_upper ON hexagrams(upper_trigram);
CREATE INDEX idx_hexagrams_lower ON hexagrams(lower_trigram);
CREATE INDEX idx_hexagrams_binary ON hexagrams(binary_repr);
```

---

### 2.2 爻辞表 (yaoci)

存储每一卦六个爻的爻辞信息。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | - | 自增ID |
| hexagram_id | INTEGER | NOT NULL | - | 所属卦象ID |
| position | INTEGER | NOT NULL | - | 爻位 (1-6，1为初爻) |
| content | TEXT | NOT NULL | - | 爻辞原文 |
| interpretation | TEXT | - | NULL | 爻辞解释 |
| xiaoxiang | TEXT | - | NULL | 小象辞 |

**索引**:

```sql
CREATE INDEX idx_yaoci_hexagram ON yaoci(hexagram_id);
CREATE UNIQUE INDEX idx_yaoci_unique ON yaoci(hexagram_id, position);
```

**建表语句**:

```sql
CREATE TABLE yaoci (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hexagram_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  content TEXT NOT NULL,
  interpretation TEXT,
  xiaoxiang TEXT,
  FOREIGN KEY (hexagram_id) REFERENCES hexagrams(id) ON DELETE CASCADE
);

CREATE INDEX idx_yaoci_hexagram ON yaoci(hexagram_id);
CREATE UNIQUE INDEX idx_yaoci_unique ON yaoci(hexagram_id, position);
```

---

### 2.3 纳甲表 (najia)

存储每一卦六爻的天干地支配置。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | - | 自增ID |
| hexagram_id | INTEGER | NOT NULL | - | 所属卦象ID |
| position | INTEGER | NOT NULL | - | 爻位 (1-6) |
| tiangan | TEXT | NOT NULL | - | 天干 |
| dizhi | TEXT | NOT NULL | - | 地支 |
| wuxing | TEXT | NOT NULL | - | 五行属性 |
| liuqin | TEXT | - | NULL | 六亲 |

**索引**:

```sql
CREATE INDEX idx_najia_hexagram ON najia(hexagram_id);
CREATE UNIQUE INDEX idx_najia_unique ON najia(hexagram_id, position);
```

**建表语句**:

```sql
CREATE TABLE najia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hexagram_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  tiangan TEXT NOT NULL,
  dizhi TEXT NOT NULL,
  wuxing TEXT NOT NULL,
  liuqin TEXT,
  FOREIGN KEY (hexagram_id) REFERENCES hexagrams(id) ON DELETE CASCADE
);

CREATE INDEX idx_najia_hexagram ON najia(hexagram_id);
CREATE UNIQUE INDEX idx_najia_unique ON najia(hexagram_id, position);
```

---

### 2.4 历史记录表 (history)

存储用户的起卦历史记录。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | TEXT | PRIMARY KEY | - | 记录ID (UUID) |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | CURRENT_TIMESTAMP | 更新时间 |
| method | TEXT | NOT NULL | - | 起卦方式 |
| original_hexagram_id | INTEGER | NOT NULL | - | 本卦ID |
| changed_hexagram_id | INTEGER | - | NULL | 变卦ID |
| moving_yao_positions | TEXT | - | NULL | 动爻位置 (JSON数组) |
| question | TEXT | - | NULL | 预测问题 |
| remark | TEXT | - | NULL | 用户备注 |
| coin_results | TEXT | - | NULL | 铜钱结果 (JSON) |
| input_numbers | TEXT | - | NULL | 输入数字 (JSON) |
| time_info | TEXT | - | NULL | 时间信息 (JSON) |
| lunar_date | TEXT | - | NULL | 农历日期 (JSON) |
| gan_zhi | TEXT | - | NULL | 干支信息 (JSON) |

**索引**:

```sql
CREATE INDEX idx_history_created ON history(created_at);
CREATE INDEX idx_history_method ON history(method);
CREATE INDEX idx_history_original ON history(original_hexagram_id);
CREATE INDEX idx_history_changed ON history(changed_hexagram_id);
```

**建表语句**:

```sql
CREATE TABLE history (
  id TEXT PRIMARY KEY,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  method TEXT NOT NULL,
  original_hexagram_id INTEGER NOT NULL,
  changed_hexagram_id INTEGER,
  moving_yao_positions TEXT,
  question TEXT,
  remark TEXT,
  coin_results TEXT,
  input_numbers TEXT,
  time_info TEXT,
  lunar_date TEXT,
  gan_zhi TEXT,
  FOREIGN KEY (original_hexagram_id) REFERENCES hexagrams(id),
  FOREIGN KEY (changed_hexagram_id) REFERENCES hexagrams(id)
);

CREATE INDEX idx_history_created ON history(created_at);
CREATE INDEX idx_history_method ON history(method);
CREATE INDEX idx_history_original ON history(original_hexagram_id);
CREATE INDEX idx_history_changed ON history(changed_hexagram_id);
```

---

### 2.5 解卦分析表 (analysis)

存储对历史记录的解卦分析结果。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | - | 自增ID |
| history_id | TEXT | NOT NULL | - | 关联历史记录ID |
| yongshen | TEXT | - | NULL | 用神 |
| yuanshen | TEXT | - | NULL | 原神 |
| jishen | TEXT | - | NULL | 忌神 |
| choushen | TEXT | - | NULL | 仇神 |
| wuxing_analysis | TEXT | - | NULL | 五行分析 (JSON) |
| conclusion | TEXT | - | NULL | 综合结论 |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**索引**:

```sql
CREATE UNIQUE INDEX idx_analysis_history ON analysis(history_id);
```

**建表语句**:

```sql
CREATE TABLE analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  history_id TEXT NOT NULL,
  yongshen TEXT,
  yuanshen TEXT,
  jishen TEXT,
  choushen TEXT,
  wuxing_analysis TEXT,
  conclusion TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (history_id) REFERENCES history(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_analysis_history ON analysis(history_id);
```

---

### 2.6 用户设置表 (settings)

存储用户偏好设置。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| key | TEXT | PRIMARY KEY | - | 设置项键名 |
| value | TEXT | NOT NULL | - | 设置项值 (JSON) |
| updated_at | DATETIME | - | CURRENT_TIMESTAMP | 更新时间 |

**建表语句**:

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.8 八卦表 (trigrams)

存储八卦的基本信息。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY | - | 八卦ID (1-8) |
| name | TEXT | NOT NULL | - | 卦名 |
| symbol | TEXT | NOT NULL | - | 卦符 (如: ☰) |
| binary | TEXT | NOT NULL | - | 二进制表示 |
| wuxing | TEXT | NOT NULL | - | 五行属性 |
| nature | TEXT | - | NULL | 自然象征 |
| family | TEXT | - | NULL | 家庭象征 |
| direction | TEXT | - | NULL | 方位 |
| season | TEXT | - | NULL | 季节 |

**建表语句**:

```sql
CREATE TABLE trigrams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  binary TEXT NOT NULL,
  wuxing TEXT NOT NULL,
  nature TEXT,
  family TEXT,
  direction TEXT,
  season TEXT
);
```

---

### 2.9 天干表 (tiangan)

存储十天干信息。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY | - | 序号 (1-10) |
| name | TEXT | NOT NULL | - | 天干名称 |
| wuxing | TEXT | NOT NULL | - | 五行属性 |
| yinyang | TEXT | NOT NULL | - | 阴阳属性 |

**建表语句**:

```sql
CREATE TABLE tiangan (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  wuxing TEXT NOT NULL,
  yinyang TEXT NOT NULL
);
```

---

### 2.10 地支表 (dizhi)

存储十二地支信息。

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|----------|------|--------|------|
| id | INTEGER | PRIMARY KEY | - | 序号 (1-12) |
| name | TEXT | NOT NULL | - | 地支名称 |
| wuxing | TEXT | NOT NULL | - | 五行属性 |
| yinyang | TEXT | NOT NULL | - | 阴阳属性 |
| season | TEXT | - | NULL | 对应季节 |
| time | TEXT | - | NULL | 对应时辰 |

**建表语句**:

```sql
CREATE TABLE dizhi (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  wuxing TEXT NOT NULL,
  yinyang TEXT NOT NULL,
  season TEXT,
  time TEXT
);
```

---

## 3. 初始数据

### 3.1 八卦初始数据

```sql
INSERT INTO trigrams (id, name, symbol, binary, wuxing, nature, family, direction, season) VALUES
(1, '乾', '☰', '111', '金', '天', '父', '西北', '秋冬'),
(2, '兑', '☱', '011', '金', '泽', '少女', '西', '秋'),
(3, '离', '☲', '101', '火', '火', '中女', '南', '夏'),
(4, '震', '☳', '001', '木', '雷', '长男', '东', '春'),
(5, '巽', '☴', '110', '木', '风', '长女', '东南', '春夏'),
(6, '坎', '☵', '010', '水', '水', '中男', '北', '冬'),
(7, '艮', '☶', '100', '土', '山', '少男', '东北', '冬春'),
(8, '坤', '☷', '000', '土', '地', '母', '西南', '夏秋');
```

### 3.2 天干初始数据

```sql
INSERT INTO tiangan (id, name, wuxing, yinyang) VALUES
(1, '甲', '木', '阳'),
(2, '乙', '木', '阴'),
(3, '丙', '火', '阳'),
(4, '丁', '火', '阴'),
(5, '戊', '土', '阳'),
(6, '己', '土', '阴'),
(7, '庚', '金', '阳'),
(8, '辛', '金', '阴'),
(9, '壬', '水', '阳'),
(10, '癸', '水', '阴');
```

### 3.3 地支初始数据

```sql
INSERT INTO dizhi (id, name, wuxing, yinyang, season, time) VALUES
(1, '子', '水', '阳', '冬', '23:00-01:00'),
(2, '丑', '土', '阴', '冬', '01:00-03:00'),
(3, '寅', '木', '阳', '春', '03:00-05:00'),
(4, '卯', '木', '阴', '春', '05:00-07:00'),
(5, '辰', '土', '阳', '春', '07:00-09:00'),
(6, '巳', '火', '阴', '夏', '09:00-11:00'),
(7, '午', '火', '阳', '夏', '11:00-13:00'),
(8, '未', '土', '阴', '夏', '13:00-15:00'),
(9, '申', '金', '阳', '秋', '15:00-17:00'),
(10, '酉', '金', '阴', '秋', '17:00-19:00'),
(11, '戌', '土', '阳', '秋', '19:00-21:00'),
(12, '亥', '水', '阴', '冬', '21:00-23:00');
```

### 3.4 默认设置数据

```sql
INSERT INTO settings (key, value) VALUES
('theme', '"system"'),
('fontSize', '"medium"'),
('hexagramStyle', '"traditional"'),
('autoSave', 'true'),
('defaultMethod', '"time"'),
('language', '"zh-CN"');
```

---

## 4. 数据库迁移

### 4.1 迁移文件命名规范

```
migrations/
├── 001_initial.sql          # 初始化迁移
├── 002_add_analysis.sql     # 添加分析表
└── 003_add_indexes.sql      # 添加索引
```

### 4.2 版本控制表

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 迁移执行逻辑

```typescript
// database/migrator.ts

interface Migration {
  id: number
  name: string
  sql: string
}

async function runMigrations(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const applied = db.prepare('SELECT name FROM migrations').all() as { name: string }[]
  const appliedNames = new Set(applied.map(m => m.name))

  const migrations: Migration[] = [
    { id: 1, name: '001_initial', sql: initialSql },
  ]

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      db.transaction(() => {
        db.exec(migration.sql)
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name)
      })()
    }
  }
}
```

---

## 5. 数据访问层

### 5.1 Repository 接口

```typescript
// repositories/base.ts

interface Repository<T> {
  findById(id: string | number): T | null
  findAll(): T[]
  create(data: Partial<T>): T
  update(id: string | number, data: Partial<T>): boolean
  delete(id: string | number): boolean
}
```

### 5.2 History Repository

```typescript
// repositories/history.ts

class HistoryRepository implements Repository<HistoryRecord> {
  private db: Database

  constructor(db: Database) {
    this.db = db
  }

  findById(id: string): HistoryRecord | null {
    const stmt = this.db.prepare(`
      SELECT h.*, 
             ho.name as original_hexagram_name,
             hc.name as changed_hexagram_name
      FROM history h
      LEFT JOIN hexagrams ho ON h.original_hexagram_id = ho.id
      LEFT JOIN hexagrams hc ON h.changed_hexagram_id = hc.id
      WHERE h.id = ?
    `)
    return stmt.get(id) as HistoryRecord | null
  }

  findAll(options?: ListOptions): HistoryRecord[] {
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'DESC' } = options || {}
    const offset = (page - 1) * pageSize
    
    const stmt = this.db.prepare(`
      SELECT h.*, 
             ho.name as original_hexagram_name,
             hc.name as changed_hexagram_name
      FROM history h
      LEFT JOIN hexagrams ho ON h.original_hexagram_id = ho.id
      LEFT JOIN hexagrams hc ON h.changed_hexagram_id = hc.id
      ORDER BY h.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `)
    return stmt.all(pageSize, offset) as HistoryRecord[]
  }

  create(data: CreateHistoryData): HistoryRecord {
    const id = generateUUID()
    const stmt = this.db.prepare(`
      INSERT INTO history (id, method, original_hexagram_id, changed_hexagram_id, 
                           moving_yao_positions, question, remark, coin_results, 
                           input_numbers, time_info, lunar_date, gan_zhi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      id,
      data.method,
      data.originalHexagramId,
      data.changedHexagramId,
      JSON.stringify(data.movingYaoPositions),
      data.question,
      data.remark,
      data.coinResults ? JSON.stringify(data.coinResults) : null,
      data.inputNumbers ? JSON.stringify(data.inputNumbers) : null,
      data.timeInfo ? JSON.stringify(data.timeInfo) : null,
      data.lunarDate ? JSON.stringify(data.lunarDate) : null,
      data.ganZhi ? JSON.stringify(data.ganZhi) : null
    )
    return this.findById(id)!
  }

  update(id: string, data: UpdateHistoryData): boolean {
    const fields: string[] = []
    const values: any[] = []

    if (data.question !== undefined) {
      fields.push('question = ?')
      values.push(data.question)
    }
    if (data.remark !== undefined) {
      fields.push('remark = ?')
      values.push(data.remark)
    }

    if (fields.length === 0) return false

    fields.push("updated_at = datetime('now')")
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE history SET ${fields.join(', ')} WHERE id = ?
    `)
    const result = stmt.run(...values)
    return result.changes > 0
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM history WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM history')
    const result = stmt.get() as { count: number }
    return result.count
  }

  search(options: SearchOptions): HistoryRecord[] {
    const conditions: string[] = []
    const values: any[] = []

    if (options.keyword) {
      conditions.push('(question LIKE ? OR remark LIKE ?)')
      values.push(`%${options.keyword}%`, `%${options.keyword}%`)
    }
    if (options.hexagramName) {
      conditions.push('(ho.name = ? OR hc.name = ?)')
      values.push(options.hexagramName, options.hexagramName)
    }
    if (options.startDate) {
      conditions.push('h.created_at >= ?')
      values.push(options.startDate)
    }
    if (options.endDate) {
      conditions.push('h.created_at <= ?')
      values.push(options.endDate)
    }
    if (options.method) {
      conditions.push('h.method = ?')
      values.push(options.method)
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : ''

    const stmt = this.db.prepare(`
      SELECT h.*, 
             ho.name as original_hexagram_name,
             hc.name as changed_hexagram_name
      FROM history h
      LEFT JOIN hexagrams ho ON h.original_hexagram_id = ho.id
      LEFT JOIN hexagrams hc ON h.changed_hexagram_id = hc.id
      ${whereClause}
      ORDER BY h.created_at DESC
    `)
    return stmt.all(...values) as HistoryRecord[]
  }
}
```

### 5.3 Hexagram Repository

```typescript
// repositories/hexagram.ts

class HexagramRepository implements Repository<Hexagram> {
  private db: Database
  private cache: Map<number, Hexagram> = new Map()

  constructor(db: Database) {
    this.db = db
    this.loadCache()
  }

  private loadCache() {
    const stmt = this.db.prepare('SELECT * FROM hexagrams')
    const hexagrams = stmt.all() as Hexagram[]
    hexagrams.forEach(h => this.cache.set(h.id, h))
  }

  findById(id: number): Hexagram | null {
    return this.cache.get(id) || null
  }

  findAll(): Hexagram[] {
    return Array.from(this.cache.values())
  }

  findByName(name: string): Hexagram | null {
    for (const hexagram of this.cache.values()) {
      if (hexagram.name === name || hexagram.alias === name) {
        return hexagram
      }
    }
    return null
  }

  findByTrigrams(upper: string, lower: string): Hexagram | null {
    for (const hexagram of this.cache.values()) {
      if (hexagram.upper_trigram === upper && hexagram.lower_trigram === lower) {
        return hexagram
      }
    }
    return null
  }

  getYaoci(hexagramId: number): YaoCi[] {
    const stmt = this.db.prepare(`
      SELECT * FROM yaoci 
      WHERE hexagram_id = ? 
      ORDER BY position
    `)
    return stmt.all(hexagramId) as YaoCi[]
  }

  getNajia(hexagramId: number): Najia[] {
    const stmt = this.db.prepare(`
      SELECT * FROM najia 
      WHERE hexagram_id = ? 
      ORDER BY position
    `)
    return stmt.all(hexagramId) as Najia[]
  }

  search(keyword: string): Hexagram[] {
    const results: Hexagram[] = []
    for (const hexagram of this.cache.values()) {
      if (hexagram.name.includes(keyword) || 
          (hexagram.alias && hexagram.alias.includes(keyword))) {
        results.push(hexagram)
      }
    }
    return results
  }
}
```

---

## 6. 数据备份与恢复

### 6.1 备份策略

```typescript
// services/backup.ts

import { app } from 'electron'
import fs from 'fs'
import path from 'path'

async function backupDatabase(outputPath?: string): Promise<string> {
  const dbPath = path.join(app.getPath('userData'), 'liuyao.db')
  const backupPath = outputPath || path.join(
    app.getPath('documents'),
    `liuyao_backup_${Date.now()}.db`
  )
  
  fs.copyFileSync(dbPath, backupPath)
  return backupPath
}

async function restoreDatabase(backupPath: string): Promise<boolean> {
  const dbPath = path.join(app.getPath('userData'), 'liuyao.db')
  
  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file not found')
  }
  
  fs.copyFileSync(backupPath, dbPath)
  return true
}
```

### 6.2 JSON导出格式

```typescript
interface ExportData {
  version: string
  exportedAt: string
  settings: Record<string, any>
  history: HistoryRecord[]
  analysis: AnalysisRecord[]
}

async function exportToJson(): Promise<ExportData> {
  const settings = await settingsRepository.getAll()
  const history = await historyRepository.findAll({ pageSize: 10000 })
  const analysis = await analysisRepository.getAll()

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings: Object.fromEntries(settings.map(s => [s.key, JSON.parse(s.value)])),
    history,
    analysis
  }
}
```

---

## 7. 性能优化

### 7.1 索引策略

| 表 | 索引 | 用途 |
|------|------|------|
| history | created_at | 时间排序 |
| history | method | 方式筛选 |
| history | original_hexagram_id | 卦象关联 |
| yaoci | hexagram_id + position | 爻辞查询 |
| najia | hexagram_id + position | 纳甲查询 |

### 7.2 查询优化

- 使用预编译语句 (Prepared Statements)
- 大数据量查询使用分页
- 卦象数据使用内存缓存
- 批量操作使用事务

### 7.3 连接配置

```typescript
import Database from 'better-sqlite3'

const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
})

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('synchronous = NORMAL')
```

---

## 8. 数据完整性

### 8.1 外键约束

```sql
PRAGMA foreign_keys = ON;
```

### 8.2 事务处理

```typescript
function saveWithAnalysis(historyData: CreateHistoryData, analysisData: CreateAnalysisData) {
  const transaction = db.transaction(() => {
    const history = historyRepository.create(historyData)
    analysisRepository.create({ ...analysisData, historyId: history.id })
    return history
  })
  
  return transaction()
}
```

### 8.3 数据验证

```typescript
function validateHistoryData(data: CreateHistoryData): boolean {
  if (!data.method || !['time', 'number', 'coin', 'manual'].includes(data.method)) {
    return false
  }
  if (!data.originalHexagramId || data.originalHexagramId < 1 || data.originalHexagramId > 64) {
    return false
  }
  return true
}
```
