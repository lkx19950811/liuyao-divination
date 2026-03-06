# AI智能解卦模块

本文档记录AI智能解卦功能的代码位置和结构。

## 功能概述

- 基于Ollama本地大语言模型实现AI智能解卦
- 用户可选择开启/关闭
- 支持模型下载镜像加速（国内用户）
- 一键下载Ollama安装程序

## 新增文件

### 1. AI工具函数
**路径**: `src/shared/utils/ai.ts`

```typescript
// 主要导出
export function getDefaultAISettings(): AISettings
export function getMovingYaoDescription(positions: number[]): string
```

- `getDefaultAISettings()` - 获取默认AI设置
- `getMovingYaoDescription()` - 获取动爻描述

> 注：`checkOllamaConnection`、`getAvailableModels`、`generateAIInterpretation` 已移至主进程IPC处理

## 修改文件

### 1. 类型定义
**路径**: `src/shared/types/index.ts`

新增类型：
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

interface AIInterpretationRequest {
  question: string | null
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
}
```

### 2. 主进程IPC处理
**路径**: `src/main/ipc/index.ts`

新增IPC处理器：
```typescript
// AI连接检测
ipcMain.handle('ai:checkOllama', async (_event, url: string) => {...})

// AI生成解读
ipcMain.handle('ai:generate', async (_event, data: {...}) => {...})

// 一键下载Ollama
ipcMain.handle('ai:downloadOllama', async (event, _useMirror: boolean) => {...})

// 打开下载页面
ipcMain.handle('ai:openDownloadPage', async (_event, useMirror: boolean) => {...})
```

新增导入：
```typescript
import { ipcMain, dialog, app, BrowserWindow, shell } from 'electron'
import https from 'https'
import http from 'http'
```

### 3. 预加载脚本
**路径**: `src/main/preload.ts`

新增API暴露：
```typescript
ai: {
  checkOllama: (url: string) => Promise<{connected, models}>
  generate: (data: {...}) => Promise<string>
  downloadOllama: (useMirror: boolean) => Promise<{success, filePath?, message}>
  onDownloadProgress: (callback) => void
  removeDownloadProgressListener: (callback) => void
  openDownloadPage: (useMirror: boolean) => Promise<{success}>
}
```

### 4. 渲染进程类型定义
**路径**: `src/renderer/types/electron.d.ts`

新增AI相关类型定义（与preload.ts对应）

### 5. 设置Store
**路径**: `src/renderer/stores/settings.ts`

新增状态和方法：
```typescript
// 状态
const aiSettings = ref<AISettings>(getDefaultAISettings())
const ollamaConnected = ref(false)
const availableModels = ref<OllamaModel[]>([])

// 方法
async function checkOllama() {...}
async function setAIEnabled(value: boolean) {...}
async function setAIOllamaUrl(value: string) {...}
async function setAIModel(value: string) {...}
async function setAITemperature(value: number) {...}
async function setAIMaxTokens(value: number) {...}
```

### 6. 设置页面
**路径**: `src/renderer/views/Settings.vue`

新增AI设置卡片：
- AI功能开关
- Ollama安装引导（一键下载、镜像配置）
- 模型选择
- 温度和字数控制

新增组件：
```vue
<el-icon><WarningFilled /></el-icon>
<el-icon><Download /></el-icon>
<el-progress :percentage="downloadProgress" />
```

### 7. 解卦结果页面
**路径**: `src/renderer/views/Result.vue`

新增AI解读区域：
```vue
<el-card class="ai-interpretation-card">
  <!-- AI智能解读按钮和内容 -->
</el-card>
```

新增方法：
```typescript
async function generateAIInterpretation() {...}
```

### 8. 主进程入口
**路径**: `src/main/index.ts`

修改：
```typescript
// 新增shell导入
import { app, BrowserWindow, Menu, nativeImage, shell } from 'electron'

// 移除自动打开DevTools
// mainWindow.webContents.openDevTools() // 已删除

// 新增：外部链接在浏览器打开
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url)
  return { action: 'deny' }
})
```

## 数据流

```
用户操作
    │
    ▼
Settings.vue / Result.vue
    │
    ▼
window.electronAPI.ai.*
    │
    ▼
preload.ts (IPC桥接)
    │
    ▼
main/ipc/index.ts (主进程处理)
    │
    ▼
Ollama API (http://localhost:11434)
```

## 配置存储

AI设置存储在SQLite数据库的settings表中：

| key | value |
|-----|-------|
| aiEnabled | 'true' / 'false' |
| aiOllamaUrl | 'http://localhost:11434' |
| aiModel | 'huihui_ai/gemma3-abliterated:latest' |
| aiTemperature | '0.7' |
| aiMaxTokens | '1500' |

## 相关文档

- PRD: `docs/PRD.md` - 2.2.2.5 AI智能解卦
- 技术文档: `docs/TECHNICAL.md` - 3.4 AI智能解卦模块
