# 六爻预测App 技术架构文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | 六爻预测 |
| 版本 | 1.0.0 |
| 文档状态 | 初稿 |
| 创建日期 | 2026-02-27 |
| 目标平台 | Windows 11 桌面应用 |

---

## 1. 技术选型

### 1.1 技术栈概览

| 层级 | 技术选型 | 版本要求 | 选型理由 |
|------|----------|----------|----------|
| 框架 | Electron | 28.x+ | 跨平台、成熟稳定、生态丰富 |
| 前端框架 | Vue 3 | 3.4.x+ | 组合式API、TypeScript支持好 |
| UI组件库 | Element Plus | 2.5.x+ | 组件丰富、中文支持好 |
| 状态管理 | Pinia | 2.1.x+ | Vue官方推荐、TypeScript友好 |
| 构建工具 | Vite | 5.x+ | 快速构建、热更新 |
| 数据库 | SQLite | 3.x | 轻量级、离线存储、无需服务 |
| ORM | better-sqlite3 | 9.x+ | 同步API、性能优秀 |
| 语言 | TypeScript | 5.x+ | 类型安全、开发体验好 |

### 1.2 技术架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面层 (Vue 3)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  起卦    │ │  解卦    │ │  历史    │ │  设置    │           │
│  │  模块    │ │  模块    │ │  记录    │ │  模块    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                           │                                     │
│                    ┌──────┴──────┐                             │
│                    │    Pinia    │                             │
│                    │  状态管理   │                             │
│                    └──────┬──────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    ┌──────┴──────┐                             │
│                    │   Service   │                             │
│                    │   服务层    │                             │
│                    └──────┬──────┘                             │
│                           │                                     │
│  ┌────────────────────────┼────────────────────────────────┐   │
│  │                        │                                │   │
│  │  ┌─────────┐  ┌────────┴───────┐  ┌─────────────┐      │   │
│  │  │ 卦象    │  │    日历服务    │  │   导出服务   │      │   │
│  │  │ 服务    │  │  (农历转换)    │  │  (PDF/TXT)  │      │   │
│  │  └─────────┘  └────────────────┘  └─────────────┘      │   │
│  │                        业务逻辑层                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                    ┌──────┴──────┐                             │
│                    │  Repository │                             │
│                    │   数据层    │                             │
│                    └──────┬──────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    ┌──────┴──────┐                             │
│                    │   SQLite    │                             │
│                    │   数据库    │                             │
│                    └─────────────┘                             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  卦象数据   │  │  历史记录   │  │  用户设置   │            │
│  │  (内置)     │  │  (用户)     │  │  (用户)     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                         数据存储层                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 项目结构

### 2.1 目录结构

```
liuyao/
├── docs/                          # 文档目录
│   ├── PRD.md                     # 产品需求文档
│   ├── TECHNICAL.md               # 技术架构文档
│   ├── API.md                     # API接口文档
│   └── DATABASE.md                # 数据库设计文档
│
├── src/                           # 源代码目录
│   ├── main/                      # Electron主进程
│   │   ├── index.ts               # 主进程入口
│   │   ├── database/              # 数据库相关
│   │   │   ├── index.ts           # 数据库初始化
│   │   │   ├── migrations/        # 数据库迁移
│   │   │   └── seeds/             # 初始数据
│   │   ├── ipc/                   # IPC通信
│   │   │   ├── index.ts           # IPC处理器注册
│   │   │   ├── divination.ts      # 起卦相关IPC
│   │   │   ├── history.ts         # 历史记录IPC
│   │   │   └── settings.ts        # 设置相关IPC
│   │   └── services/              # 主进程服务
│   │       ├── calendar.ts        # 日历服务(农历转换)
│   │       └── export.ts          # 导出服务
│   │
│   ├── renderer/                  # 渲染进程(前端)
│   │   ├── index.html             # HTML入口
│   │   ├── main.ts                # Vue入口
│   │   ├── App.vue                # 根组件
│   │   ├── assets/                # 静态资源
│   │   │   ├── styles/            # 样式文件
│   │   │   ├── images/            # 图片资源
│   │   │   └── fonts/             # 字体文件
│   │   ├── components/            # 公共组件
│   │   │   ├── HexagramView.vue   # 卦象展示组件
│   │   │   ├── YaoLine.vue        # 爻线组件
│   │   │   ├── CoinAnimation.vue  # 铜钱动画组件
│   │   │   └── DatePicker.vue     # 日期选择器
│   │   ├── views/                 # 页面视图
│   │   │   ├── Home.vue           # 首页/起卦
│   │   │   ├── Divination.vue     # 起卦页面
│   │   │   ├── Result.vue         # 解卦结果
│   │   │   ├── History.vue        # 历史记录
│   │   │   ├── Knowledge.vue      # 知识库
│   │   │   └── Settings.vue       # 设置页面
│   │   ├── stores/                # Pinia状态管理
│   │   │   ├── index.ts           # Store入口
│   │   │   ├── divination.ts      # 起卦状态
│   │   │   ├── history.ts         # 历史状态
│   │   │   └── settings.ts        # 设置状态
│   │   ├── composables/           # 组合式函数
│   │   │   ├── useDivination.ts   # 起卦逻辑
│   │   │   ├── useCalendar.ts     # 日历逻辑
│   │   │   └── useExport.ts       # 导出逻辑
│   │   ├── utils/                 # 工具函数
│   │   │   ├── hexagram.ts        # 卦象计算
│   │   │   ├── calendar.ts        # 日历转换
│   │   │   └── constants.ts       # 常量定义
│   │   ├── types/                 # TypeScript类型
│   │   │   ├── hexagram.ts        # 卦象类型
│   │   │   ├── history.ts         # 历史记录类型
│   │   │   └── settings.ts        # 设置类型
│   │   └── router/                # 路由配置
│   │       └── index.ts           # 路由定义
│   │
│   ├── shared/                    # 共享代码
│   │   ├── types/                 # 共享类型定义
│   │   └── constants/             # 共享常量
│   │
│   └── data/                      # 内置数据
│       ├── hexagrams.json         # 六十四卦数据
│       ├── liuyao.json            # 六爻纳甲数据
│       └── calendar/              # 日历数据
│           └── lunar-calendar.json
│
├── electron-builder.yml           # Electron构建配置
├── vite.config.ts                 # Vite配置
├── tsconfig.json                  # TypeScript配置
├── package.json                   # 项目配置
└── README.md                      # 项目说明
```

---

## 3. 核心模块设计

### 3.1 卦象计算模块

#### 3.1.1 数据结构

```typescript
// types/hexagram.ts

interface Yao {
  type: 'yin' | 'yang' | 'oldYin' | 'oldYang'
  position: number
  isMoving: boolean
}

interface Hexagram {
  id: number
  name: string
  upperTrigram: string
  lowerTrigram: string
  yaos: Yao[]
  guaci: string
  tuanci: string
  xiangci: string
  yaoci: string[]
}

interface DivinationResult {
  id: string
  createdAt: Date
  method: 'manual' | 'time' | 'number' | 'coin'
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
  question: string
  remark: string
}
```

#### 3.1.2 计算逻辑

```typescript
// utils/hexagram.ts

const TRIGRAMS = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']

function numberToTrigram(num: number): string {
  const index = num % 8
  return TRIGRAMS[index === 0 ? 7 : index - 1]
}

function calculateMovingYao(sum: number): number {
  return sum % 6 || 6
}

function getHexagramByTrigrams(upper: string, lower: string): Hexagram {
  // 根据上下卦查找六十四卦
}

function convertYao(yao: Yao): Yao {
  // 老阴变阳，老阳变阴
  if (yao.type === 'oldYin') {
    return { ...yao, type: 'yang', isMoving: false }
  }
  if (yao.type === 'oldYang') {
    return { ...yao, type: 'yin', isMoving: false }
  }
  return yao
}
```

### 3.2 日历转换模块

#### 3.2.1 功能说明

- 公历转农历
- 农历转公历
- 获取干支纪年
- 获取节气信息

#### 3.2.2 实现方案

使用内置农历数据表进行转换，数据覆盖范围：1900-2100年。

```typescript
// services/calendar.ts

interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
}

interface SolarDate {
  year: number
  month: number
  day: number
}

interface GanZhi {
  year: string
  month: string
  day: string
  hour: string
}

function solarToLunar(solar: SolarDate): LunarDate {
  // 公历转农历
}

function lunarToSolar(lunar: LunarDate): SolarDate {
  // 农历转公历
}

function getGanZhi(date: SolarDate, hour: number): GanZhi {
  // 获取干支
}
```

### 3.3 起卦方式实现

#### 3.3.1 时间起卦

```typescript
function timeDivination(date: SolarDate, hour: number): DivinationResult {
  const lunar = solarToLunar(date)
  const ganzhi = getGanZhi(date, hour)
  
  const yearNum = lunar.year
  const monthNum = lunar.month
  const dayNum = lunar.day
  const hourNum = Math.floor(hour / 2) + 1
  
  const upperSum = yearNum + monthNum + dayNum
  const lowerSum = upperSum + hourNum
  
  const upperTrigram = numberToTrigram(upperSum)
  const lowerTrigram = numberToTrigram(lowerSum)
  const movingYao = calculateMovingYao(lowerSum)
  
  return buildDivinationResult(upperTrigram, lowerTrigram, movingYao, 'time')
}
```

#### 3.3.2 数字起卦

```typescript
function numberDivination(num1: number, num2: number): DivinationResult {
  const upperTrigram = numberToTrigram(num1)
  const lowerTrigram = numberToTrigram(num2)
  const movingYao = calculateMovingYao(num1 + num2)
  
  return buildDivinationResult(upperTrigram, lowerTrigram, movingYao, 'number')
}
```

#### 3.3.3 铜钱起卦

```typescript
function coinDivination(): DivinationResult {
  const yaos: Yao[] = []
  
  for (let i = 0; i < 6; i++) {
    const coins = throwCoins()
    const yao = coinsToYao(coins)
    yaos.push({ ...yao, position: i + 1 })
  }
  
  return buildDivinationResultFromYaos(yaos, 'coin')
}

function throwCoins(): CoinResult[] {
  return [0, 1, 2].map(() => ({
    side: Math.random() > 0.5 ? 'front' : 'back'
  }))
}

function coinsToYao(coins: CoinResult[]): Omit<Yao, 'position'> {
  const frontCount = coins.filter(c => c.side === 'front').length
  
  switch (frontCount) {
    case 3: return { type: 'oldYang', isMoving: true }
    case 2: return { type: 'yang', isMoving: false }
    case 1: return { type: 'yin', isMoving: false }
    case 0: return { type: 'oldYin', isMoving: true }
  }
}
```

### 3.4 AI智能解卦模块

#### 3.4.1 技术方案

基于Ollama本地大语言模型实现AI智能解卦功能：

| 项目 | 说明 |
|------|------|
| 模型服务 | Ollama (本地部署) |
| API协议 | HTTP REST API |
| 默认地址 | http://localhost:11434 |
| 推荐模型 | huihui_ai/gemma3-abliterated:latest |

#### 3.4.2 数据结构

```typescript
interface AISettings {
  enabled: boolean
  ollamaUrl: string
  model: string
  temperature: number
  maxTokens: number
}

interface OllamaModel {
  name: string
  size: string
  modified_at: string
}
```

#### 3.4.3 核心实现

```typescript
// 检测Ollama服务
async function checkOllamaConnection(url: string): Promise<boolean> {
  const response = await fetch(`${url}/api/tags`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000)
  })
  return response.ok
}

// 获取可用模型
async function getAvailableModels(url: string): Promise<OllamaModel[]> {
  const response = await fetch(`${url}/api/tags`)
  const data = await response.json()
  return data.models || []
}

// 生成AI解读（流式输出）
async function generateAIInterpretation(
  settings: AISettings,
  question: string | null,
  hexagram: Hexagram,
  onProgress?: (text: string) => void
): Promise<string> {
  const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
    method: 'POST',
    body: JSON.stringify({
      model: settings.model,
      prompt: buildPrompt(question, hexagram),
      stream: true,
      options: {
        temperature: settings.temperature,
        num_predict: settings.maxTokens
      }
    })
  })
  
  // 流式读取响应
  const reader = response.body.getReader()
  let fullText = ''
  // ... 读取流并调用onProgress
  return fullText
}
```

#### 3.4.4 Prompt模板

```typescript
function buildPrompt(question: string, hexagram: Hexagram): string {
  return `你是一位精通六爻预测的易学大师，请用通俗易懂的语言解读以下卦象。

【用户问题】${question || '用户未提供具体问题，请给出一般性解读'}
【本卦】${hexagram.name}：${hexagram.description}
【卦辞】${hexagram.guaci}

请从以下角度解读：
1. 这个卦象整体意味着什么？
2. 针对用户的问题，有什么具体启示？
3. 有什么建议和注意事项？

请用白话文回答，避免使用专业术语。`
}
```

---

## 4. 数据库设计

### 4.1 数据库选型

使用 SQLite 作为本地数据库，理由：
- 轻量级，无需独立服务
- 支持事务，数据安全
- 查询性能优秀
- Electron生态支持良好

### 4.2 数据表设计

#### 4.2.1 历史记录表 (history)

```sql
CREATE TABLE history (
  id TEXT PRIMARY KEY,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  method TEXT NOT NULL,
  original_hexagram_id INTEGER NOT NULL,
  changed_hexagram_id INTEGER,
  moving_yao_positions TEXT,
  question TEXT,
  remark TEXT,
  FOREIGN KEY (original_hexagram_id) REFERENCES hexagrams(id),
  FOREIGN KEY (changed_hexagram_id) REFERENCES hexagrams(id)
);
```

#### 4.2.2 卦象表 (hexagrams)

```sql
CREATE TABLE hexagrams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  upper_trigram TEXT NOT NULL,
  lower_trigram TEXT NOT NULL,
  binary_repr TEXT NOT NULL,
  guaci TEXT,
  tuanci TEXT,
  xiangci TEXT
);
```

#### 4.2.3 爻辞表 (yaoci)

```sql
CREATE TABLE yaoci (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hexagram_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  content TEXT NOT NULL,
  interpretation TEXT,
  FOREIGN KEY (hexagram_id) REFERENCES hexagrams(id)
);
```

#### 4.2.4 纳甲表 (najia)

```sql
CREATE TABLE najia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hexagram_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  tiangan TEXT NOT NULL,
  dizhi TEXT NOT NULL,
  wuxing TEXT NOT NULL,
  liuqin TEXT,
  FOREIGN KEY (hexagram_id) REFERENCES hexagrams(id)
);
```

#### 4.2.5 用户设置表 (settings)

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. IPC通信设计

### 5.1 通信架构

```
┌─────────────────┐                    ┌─────────────────┐
│  渲染进程(Vue)  │                    │  主进程(Electron)│
│                 │                    │                 │
│  ┌───────────┐  │    IPC通信        │  ┌───────────┐  │
│  │ ipcRender │  │◄─────────────────►│  │ ipcMain   │  │
│  └───────────┘  │                    │  └───────────┘  │
│                 │                    │        │        │
│  ┌───────────┐  │                    │  ┌──────┴────┐  │
│  │   Store   │  │                    │  │ Services  │  │
│  └───────────┘  │                    │  └───────────┘  │
└─────────────────┘                    └─────────────────┘
```

### 5.2 IPC通道定义

```typescript
// shared/constants/ipc.ts

export const IPC_CHANNELS = {
  DIVINATION: {
    TIME: 'divination:time',
    NUMBER: 'divination:number',
    COIN: 'divination:coin',
    MANUAL: 'divination:manual',
    GET_RESULT: 'divination:getResult'
  },
  HISTORY: {
    LIST: 'history:list',
    GET: 'history:get',
    SAVE: 'history:save',
    DELETE: 'history:delete',
    UPDATE: 'history:update',
    SEARCH: 'history:search'
  },
  HEXAGRAM: {
    GET: 'hexagram:get',
    GET_ALL: 'hexagram:getAll',
    SEARCH: 'hexagram:search'
  },
  SETTINGS: {
    GET: 'settings:get',
    SET: 'settings:set',
    RESET: 'settings:reset'
  },
  EXPORT: {
    PDF: 'export:pdf',
    TXT: 'export:txt',
    JSON: 'export:json'
  },
  DATABASE: {
    BACKUP: 'database:backup',
    RESTORE: 'database:restore'
  }
}
```

### 5.3 IPC调用示例

```typescript
// 渲染进程调用
const result = await ipcRenderer.invoke(IPC_CHANNELS.DIVINATION.TIME, {
  date: { year: 2026, month: 2, day: 27 },
  hour: 14
})

// 主进程处理
ipcMain.handle(IPC_CHANNELS.DIVINATION.TIME, async (event, data) => {
  const result = await divinationService.timeDivination(data.date, data.hour)
  return result
})
```

---

## 6. 性能优化

### 6.1 启动优化

| 优化项 | 方案 |
|--------|------|
| 延迟加载 | 非核心模块按需加载 |
| 数据预加载 | 启动时预加载卦象数据到内存 |
| 窗口优化 | 使用 `will-finish-launching` 事件预初始化 |

### 6.2 运行时优化

| 优化项 | 方案 |
|--------|------|
| 虚拟列表 | 历史记录列表使用虚拟滚动 |
| 防抖节流 | 搜索输入使用防抖 |
| 缓存策略 | 卦象数据内存缓存 |
| 懒加载 | 知识库内容懒加载 |

### 6.3 打包优化

| 优化项 | 方案 |
|--------|------|
| 代码分割 | Vite自动代码分割 |
| Tree Shaking | 移除未使用代码 |
| 资源压缩 | 图片、CSS压缩 |
| ASAR打包 | 使用ASAR格式打包资源 |

---

## 7. 安全设计

### 7.1 安全策略

| 安全项 | 措施 |
|--------|------|
| 上下文隔离 | 启用 `contextIsolation` |
| Node集成 | 渲染进程禁用 `nodeIntegration` |
| preload脚本 | 通过preload暴露有限API |
| 远程模块 | 禁用 `enableRemoteModule` |

### 7.2 preload脚本设计

```typescript
// preload/index.ts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  divination: {
    time: (data) => ipcRenderer.invoke('divination:time', data),
    number: (data) => ipcRenderer.invoke('divination:number', data),
    coin: () => ipcRenderer.invoke('divination:coin'),
    manual: (data) => ipcRenderer.invoke('divination:manual', data)
  },
  history: {
    list: (params) => ipcRenderer.invoke('history:list', params),
    save: (data) => ipcRenderer.invoke('history:save', data),
    delete: (id) => ipcRenderer.invoke('history:delete', id)
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', { key, value })
  }
})
```

---

## 8. 构建与部署

### 8.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

### 8.2 构建配置

```yaml
# electron-builder.yml

appId: com.liuyao.app
productName: 六爻预测
directories:
  output: release/${version}
files:
  - dist/**/*
  - dist-electron/**/*
  - package.json
win:
  target:
    - target: nsis
      arch:
        - x64
        - arm64
  icon: build/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
```

### 8.3 构建命令

```bash
# 构建Windows版本
npm run build:win

# 构建所有平台
npm run build:all
```

---

## 9. 测试策略

### 9.1 测试类型

| 测试类型 | 工具 | 覆盖范围 |
|----------|------|----------|
| 单元测试 | Vitest | 工具函数、计算逻辑 |
| 组件测试 | Vitest + Vue Test Utils | Vue组件 |
| E2E测试 | Playwright | 关键业务流程 |

### 9.2 测试覆盖目标

| 模块 | 覆盖率目标 |
|------|------------|
| 卦象计算 | 90%+ |
| 日历转换 | 90%+ |
| 数据库操作 | 80%+ |
| UI组件 | 70%+ |

---

## 10. 开发规范

### 10.1 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- 使用 TypeScript 严格模式
- 遵循 Vue 3 组合式API风格指南

### 10.2 Git规范

```
# 提交信息格式
<type>(<scope>): <subject>

# type类型
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 10.3 分支策略

```
main (主分支)
  ├── develop (开发分支)
  │     ├── feature/xxx (功能分支)
  │     ├── fix/xxx (修复分支)
  │     └── refactor/xxx (重构分支)
  └── release/x.x.x (发布分支)
```
