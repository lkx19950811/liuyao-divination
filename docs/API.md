# 六爻预测App API接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | 六爻预测 |
| 版本 | 1.0.0 |
| 文档状态 | 初稿 |
| 创建日期 | 2026-02-27 |

---

## 1. 概述

本文档定义了六爻预测App中渲染进程与主进程之间的IPC通信接口。所有接口均基于Electron的IPC机制实现。

### 1.1 接口规范

- **通信方式**: `ipcRenderer.invoke()` / `ipcMain.handle()`
- **数据格式**: JSON
- **错误处理**: 统一返回 `{ success: false, error: string }` 格式

### 1.2 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

---

## 2. 起卦模块 API

### 2.1 时间起卦

**通道**: `divination:time`

**描述**: 根据指定时间进行起卦

**请求参数**:

```typescript
interface TimeDivinationRequest {
  date: {
    year: number
    month: number
    day: number
  }
  hour: number
  useLunar?: boolean
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date.year | number | 是 | 年份 |
| date.month | number | 是 | 月份 (1-12) |
| date.day | number | 是 | 日期 (1-31) |
| hour | number | 是 | 小时 (0-23) |
| useLunar | boolean | 否 | 是否使用农历，默认false |

**响应数据**:

```typescript
interface DivinationResult {
  id: string
  createdAt: string
  method: 'time'
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
  lunarDate: LunarDate
  ganZhi: GanZhi
}
```

**示例**:

```typescript
const result = await window.electronAPI.divination.time({
  date: { year: 2026, month: 2, day: 27 },
  hour: 14,
  useLunar: false
})
```

---

### 2.2 数字起卦

**通道**: `divination:number`

**描述**: 根据输入的两个数字进行起卦

**请求参数**:

```typescript
interface NumberDivinationRequest {
  number1: number
  number2: number
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| number1 | number | 是 | 第一个数字 (1-9999) |
| number2 | number | 是 | 第二个数字 (1-9999) |

**响应数据**:

```typescript
interface DivinationResult {
  id: string
  createdAt: string
  method: 'number'
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
  inputNumbers: [number, number]
}
```

**示例**:

```typescript
const result = await window.electronAPI.divination.number({
  number1: 168,
  number2: 888
})
```

---

### 2.3 铜钱起卦

**通道**: `divination:coin`

**描述**: 模拟铜钱起卦，返回完整的起卦结果

**请求参数**: 无

**响应数据**:

```typescript
interface CoinDivinationResult {
  id: string
  createdAt: string
  method: 'coin'
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
  coinResults: CoinResult[]
}

interface CoinResult {
  position: number
  coins: Array<'front' | 'back'>
  yaoType: 'yin' | 'yang' | 'oldYin' | 'oldYang'
}
```

**示例**:

```typescript
const result = await window.electronAPI.divination.coin()
```

---

### 2.4 手动起卦

**通道**: `divination:manual`

**描述**: 用户手动设置每个爻的阴阳属性

**请求参数**:

```typescript
interface ManualDivinationRequest {
  yaos: Array<'yin' | 'yang' | 'oldYin' | 'oldYang'>
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| yaos | array | 是 | 六个爻的类型，从初爻到上爻 |

**响应数据**:

```typescript
interface DivinationResult {
  id: string
  createdAt: string
  method: 'manual'
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
}
```

**示例**:

```typescript
const result = await window.electronAPI.divination.manual({
  yaos: ['yang', 'yin', 'yang', 'oldYang', 'yin', 'yang']
})
```

---

## 3. 卦象数据 API

### 3.1 获取单个卦象

**通道**: `hexagram:get`

**描述**: 根据卦象ID获取详细信息

**请求参数**:

```typescript
interface GetHexagramRequest {
  id: number
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 卦象ID (1-64) |

**响应数据**:

```typescript
interface Hexagram {
  id: number
  name: string
  upperTrigram: Trigram
  lowerTrigram: Trigram
  binary: string
  guaci: string
  tuanci: string
  xiangci: string
  yaoci: YaoCi[]
  najia: Najia[]
}

interface Trigram {
  name: string
  symbol: string
  wuxing: string
}

interface YaoCi {
  position: number
  content: string
  interpretation: string
}

interface Najia {
  position: number
  tiangan: string
  dizhi: string
  wuxing: string
  liuqin: string
}
```

**示例**:

```typescript
const hexagram = await window.electronAPI.hexagram.get({ id: 1 })
```

---

### 3.2 获取所有卦象

**通道**: `hexagram:getAll`

**描述**: 获取六十四卦列表（简要信息）

**请求参数**: 无

**响应数据**:

```typescript
interface HexagramBrief {
  id: number
  name: string
  upperTrigram: string
  lowerTrigram: string
  binary: string
}

type GetAllHexagramsResponse = HexagramBrief[]
```

**示例**:

```typescript
const hexagrams = await window.electronAPI.hexagram.getAll()
```

---

### 3.3 搜索卦象

**通道**: `hexagram:search`

**描述**: 根据关键词搜索卦象

**请求参数**:

```typescript
interface SearchHexagramRequest {
  keyword: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |

**响应数据**:

```typescript
type SearchHexagramResponse = HexagramBrief[]
```

**示例**:

```typescript
const results = await window.electronAPI.hexagram.search({ keyword: '乾' })
```

---

## 4. 历史记录 API

### 4.1 获取历史列表

**通道**: `history:list`

**描述**: 分页获取历史记录列表

**请求参数**:

```typescript
interface ListHistoryRequest {
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| sortBy | string | 否 | 'createdAt' | 排序字段 |
| sortOrder | string | 否 | 'desc' | 排序方向 |

**响应数据**:

```typescript
interface ListHistoryResponse {
  total: number
  page: number
  pageSize: number
  items: HistoryItem[]
}

interface HistoryItem {
  id: string
  createdAt: string
  method: string
  originalHexagramName: string
  changedHexagramName: string | null
  question: string
  remark: string
}
```

**示例**:

```typescript
const result = await window.electronAPI.history.list({
  page: 1,
  pageSize: 20
})
```

---

### 4.2 获取历史详情

**通道**: `history:get`

**描述**: 根据ID获取历史记录详情

**请求参数**:

```typescript
interface GetHistoryRequest {
  id: string
}
```

**响应数据**:

```typescript
interface HistoryDetail {
  id: string
  createdAt: string
  updatedAt: string
  method: string
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
  question: string
  remark: string
  analysis: AnalysisResult | null
}

interface AnalysisResult {
  yongshen: string
  yuanshen: string
  jishen: string
  choushen: string
  conclusion: string
}
```

**示例**:

```typescript
const detail = await window.electronAPI.history.get({ id: 'abc123' })
```

---

### 4.3 保存历史记录

**通道**: `history:save`

**描述**: 保存起卦结果到历史记录

**请求参数**:

```typescript
interface SaveHistoryRequest {
  divinationId: string
  question?: string
  remark?: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| divinationId | string | 是 | 起卦结果ID |
| question | string | 否 | 预测问题 |
| remark | string | 否 | 备注信息 |

**响应数据**:

```typescript
interface SaveHistoryResponse {
  id: string
  success: boolean
}
```

**示例**:

```typescript
const result = await window.electronAPI.history.save({
  divinationId: 'div_abc123',
  question: '今日运势如何？',
  remark: '测试记录'
})
```

---

### 4.4 更新历史记录

**通道**: `history:update`

**描述**: 更新历史记录的备注信息

**请求参数**:

```typescript
interface UpdateHistoryRequest {
  id: string
  question?: string
  remark?: string
}
```

**响应数据**:

```typescript
interface UpdateHistoryResponse {
  success: boolean
}
```

**示例**:

```typescript
const result = await window.electronAPI.history.update({
  id: 'abc123',
  remark: '更新后的备注'
})
```

---

### 4.5 删除历史记录

**通道**: `history:delete`

**描述**: 删除指定的历史记录

**请求参数**:

```typescript
interface DeleteHistoryRequest {
  ids: string[]
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | string[] | 是 | 要删除的记录ID数组 |

**响应数据**:

```typescript
interface DeleteHistoryResponse {
  success: boolean
  deletedCount: number
}
```

**示例**:

```typescript
const result = await window.electronAPI.history.delete({
  ids: ['abc123', 'def456']
})
```

---

### 4.6 搜索历史记录

**通道**: `history:search`

**描述**: 根据条件搜索历史记录

**请求参数**:

```typescript
interface SearchHistoryRequest {
  keyword?: string
  hexagramName?: string
  startDate?: string
  endDate?: string
  method?: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（问题/备注） |
| hexagramName | string | 否 | 卦名筛选 |
| startDate | string | 否 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 否 | 结束日期 (YYYY-MM-DD) |
| method | string | 否 | 起卦方式筛选 |

**响应数据**:

```typescript
type SearchHistoryResponse = HistoryItem[]
```

**示例**:

```typescript
const results = await window.electronAPI.history.search({
  keyword: '运势',
  startDate: '2026-01-01',
  endDate: '2026-02-27'
})
```

---

## 5. 设置 API

### 5.1 获取设置

**通道**: `settings:get`

**描述**: 获取指定设置项的值

**请求参数**:

```typescript
interface GetSettingRequest {
  key: string
}
```

**可用设置项**:

| Key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| theme | string | 'system' | 主题: 'light' / 'dark' / 'system' |
| fontSize | string | 'medium' | 字体大小: 'small' / 'medium' / 'large' |
| hexagramStyle | string | 'traditional' | 卦象样式: 'traditional' / 'modern' |
| autoSave | boolean | true | 是否自动保存历史记录 |
| defaultMethod | string | 'time' | 默认起卦方式 |

**响应数据**:

```typescript
interface GetSettingResponse<T> {
  key: string
  value: T
}
```

**示例**:

```typescript
const setting = await window.electronAPI.settings.get({ key: 'theme' })
```

---

### 5.2 设置值

**通道**: `settings:set`

**描述**: 设置指定配置项的值

**请求参数**:

```typescript
interface SetSettingRequest {
  key: string
  value: any
}
```

**响应数据**:

```typescript
interface SetSettingResponse {
  success: boolean
}
```

**示例**:

```typescript
const result = await window.electronAPI.settings.set({
  key: 'theme',
  value: 'dark'
})
```

---

### 5.3 重置设置

**通道**: `settings:reset`

**描述**: 重置所有设置为默认值

**请求参数**: 无

**响应数据**:

```typescript
interface ResetSettingsResponse {
  success: boolean
}
```

**示例**:

```typescript
const result = await window.electronAPI.settings.reset()
```

---

## 6. 导出 API

### 6.1 导出PDF

**通道**: `export:pdf`

**描述**: 将历史记录导出为PDF文件

**请求参数**:

```typescript
interface ExportPdfRequest {
  historyId: string
  outputPath?: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| historyId | string | 是 | 历史记录ID |
| outputPath | string | 否 | 导出路径，不指定则弹出保存对话框 |

**响应数据**:

```typescript
interface ExportPdfResponse {
  success: boolean
  filePath?: string
  error?: string
}
```

**示例**:

```typescript
const result = await window.electronAPI.export.pdf({
  historyId: 'abc123'
})
```

---

### 6.2 导出TXT

**通道**: `export:txt`

**描述**: 将历史记录导出为TXT文件

**请求参数**:

```typescript
interface ExportTxtRequest {
  historyId: string
  outputPath?: string
}
```

**响应数据**:

```typescript
interface ExportTxtResponse {
  success: boolean
  filePath?: string
  error?: string
}
```

**示例**:

```typescript
const result = await window.electronAPI.export.txt({
  historyId: 'abc123'
})
```

---

### 6.3 导出JSON

**通道**: `export:json`

**描述**: 导出所有历史记录为JSON文件（用于备份）

**请求参数**:

```typescript
interface ExportJsonRequest {
  outputPath?: string
  includeSettings?: boolean
}
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| outputPath | string | 否 | - | 导出路径 |
| includeSettings | boolean | 否 | true | 是否包含设置 |

**响应数据**:

```typescript
interface ExportJsonResponse {
  success: boolean
  filePath?: string
  recordCount?: number
  error?: string
}
```

**示例**:

```typescript
const result = await window.electronAPI.export.json({
  includeSettings: true
})
```

---

## 7. 数据库管理 API

### 7.1 备份数据库

**通道**: `database:backup`

**描述**: 备份整个数据库文件

**请求参数**:

```typescript
interface BackupDatabaseRequest {
  outputPath?: string
}
```

**响应数据**:

```typescript
interface BackupDatabaseResponse {
  success: boolean
  filePath?: string
  error?: string
}
```

**示例**:

```typescript
const result = await window.electronAPI.database.backup()
```

---

### 7.2 恢复数据库

**通道**: `database:restore`

**描述**: 从备份文件恢复数据库

**请求参数**:

```typescript
interface RestoreDatabaseRequest {
  backupPath: string
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| backupPath | string | 是 | 备份文件路径 |

**响应数据**:

```typescript
interface RestoreDatabaseResponse {
  success: boolean
  error?: string
}
```

**示例**:

```typescript
const result = await window.electronAPI.database.restore({
  backupPath: 'D:/backup/liuyao_backup.db'
})
```

---

## 8. 日历 API

### 8.1 公历转农历

**通道**: `calendar:solarToLunar`

**描述**: 将公历日期转换为农历日期

**请求参数**:

```typescript
interface SolarToLunarRequest {
  year: number
  month: number
  day: number
}
```

**响应数据**:

```typescript
interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  monthName: string
  dayName: string
}
```

**示例**:

```typescript
const lunar = await window.electronAPI.calendar.solarToLunar({
  year: 2026,
  month: 2,
  day: 27
})
```

---

### 8.2 农历转公历

**通道**: `calendar:lunarToSolar`

**描述**: 将农历日期转换为公历日期

**请求参数**:

```typescript
interface LunarToSolarRequest {
  year: number
  month: number
  day: number
  isLeapMonth?: boolean
}
```

**响应数据**:

```typescript
interface SolarDate {
  year: number
  month: number
  day: number
  weekday: number
}
```

**示例**:

```typescript
const solar = await window.electronAPI.calendar.lunarToSolar({
  year: 2026,
  month: 1,
  day: 10
})
```

---

### 8.3 获取干支

**通道**: `calendar:getGanZhi`

**描述**: 获取指定日期时间的干支纪年

**请求参数**:

```typescript
interface GetGanZhiRequest {
  year: number
  month: number
  day: number
  hour: number
}
```

**响应数据**:

```typescript
interface GanZhi {
  year: string
  month: string
  day: string
  hour: string
  fullString: string
}
```

**示例**:

```typescript
const ganzhi = await window.electronAPI.calendar.getGanZhi({
  year: 2026,
  month: 2,
  day: 27,
  hour: 14
})
```

---

## 9. 错误码定义

| 错误码 | 说明 |
|--------|------|
| E001 | 参数验证失败 |
| E002 | 数据不存在 |
| E003 | 数据库操作失败 |
| E004 | 文件操作失败 |
| E005 | 导出失败 |
| E006 | 导入失败 |
| E007 | 日期转换失败 |
| E008 | 卦象计算失败 |
| E099 | 未知错误 |

---

## 10. TypeScript 类型定义文件

```typescript
// types/electron-api.d.ts

interface ElectronAPI {
  divination: {
    time: (data: TimeDivinationRequest) => Promise<ApiResponse<DivinationResult>>
    number: (data: NumberDivinationRequest) => Promise<ApiResponse<DivinationResult>>
    coin: () => Promise<ApiResponse<CoinDivinationResult>>
    manual: (data: ManualDivinationRequest) => Promise<ApiResponse<DivinationResult>>
  }
  hexagram: {
    get: (data: GetHexagramRequest) => Promise<ApiResponse<Hexagram>>
    getAll: () => Promise<ApiResponse<HexagramBrief[]>>
    search: (data: SearchHexagramRequest) => Promise<ApiResponse<HexagramBrief[]>>
  }
  history: {
    list: (data: ListHistoryRequest) => Promise<ApiResponse<ListHistoryResponse>>
    get: (data: GetHistoryRequest) => Promise<ApiResponse<HistoryDetail>>
    save: (data: SaveHistoryRequest) => Promise<ApiResponse<SaveHistoryResponse>>
    update: (data: UpdateHistoryRequest) => Promise<ApiResponse<UpdateHistoryResponse>>
    delete: (data: DeleteHistoryRequest) => Promise<ApiResponse<DeleteHistoryResponse>>
    search: (data: SearchHistoryRequest) => Promise<ApiResponse<HistoryItem[]>>
  }
  settings: {
    get: (data: GetSettingRequest) => Promise<ApiResponse<GetSettingResponse<any>>>
    set: (data: SetSettingRequest) => Promise<ApiResponse<SetSettingResponse>>
    reset: () => Promise<ApiResponse<ResetSettingsResponse>>
  }
  export: {
    pdf: (data: ExportPdfRequest) => Promise<ApiResponse<ExportPdfResponse>>
    txt: (data: ExportTxtRequest) => Promise<ApiResponse<ExportTxtResponse>>
    json: (data: ExportJsonRequest) => Promise<ApiResponse<ExportJsonResponse>>
  }
  database: {
    backup: (data?: BackupDatabaseRequest) => Promise<ApiResponse<BackupDatabaseResponse>>
    restore: (data: RestoreDatabaseRequest) => Promise<ApiResponse<RestoreDatabaseResponse>>
  }
  calendar: {
    solarToLunar: (data: SolarToLunarRequest) => Promise<ApiResponse<LunarDate>>
    lunarToSolar: (data: LunarToSolarRequest) => Promise<ApiResponse<SolarDate>>
    getGanZhi: (data: GetGanZhiRequest) => Promise<ApiResponse<GanZhi>>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
```
