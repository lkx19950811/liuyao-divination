import { contextBridge, ipcRenderer } from 'electron'

// 类型定义（从types/index.ts导入）
type YaoType = 'yin' | 'yang' | 'oldYin' | 'oldYang'
type DivinationMethod = 'time' | 'number' | 'coin' | 'manual'

interface Hexagram {
  id: number
  name: string
  alias: string | null
  upperTrigram: string
  lowerTrigram: string
  binary: string
  guaci: string
  tuanci: string
  xiangci: string
  wuxing: string | null
  palace: string | null
  description: string | null
}

interface CoinResult {
  position: number
  coins: Array<'front' | 'back'>
  yaoType: YaoType
}

interface TimeInfo {
  year: number
  month: number
  day: number
  hour: number
  useLunar: boolean
}

interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
}

interface GanZhi {
  year: string
  month: string
  day: string
  hour: string
  fullString: string
}

interface DivinationResult {
  id: string
  createdAt: Date
  method: DivinationMethod
  originalHexagram: Hexagram
  changedHexagram: Hexagram | null
  movingYaoPositions: number[]
  question: string | null
  remark: string | null
  coinResults?: CoinResult[]
  inputNumbers?: [number, number]
  timeInfo?: TimeInfo
  lunarDate?: LunarDate
  ganZhi?: GanZhi
}

const electronAPI = {
  window: {
    minimize: () =>
      ipcRenderer.invoke('window:minimize'),
    maximize: () =>
      ipcRenderer.invoke('window:maximize'),
    close: () =>
      ipcRenderer.invoke('window:close'),
    isMaximized: () =>
      ipcRenderer.invoke('window:isMaximized'),
    onWindowMaximized: (callback: (_event: unknown, isMaximized: boolean) => void) => {
      ipcRenderer.on('window-maximized', callback)
    },
    removeWindowMaximizedListener: (callback: (_event: unknown, isMaximized: boolean) => void) => {
      ipcRenderer.removeListener('window-maximized', callback)
    }
  },

  divination: {
    time: (data: { year: number; month: number; day: number; hour: number; question?: string }) =>
      ipcRenderer.invoke('divination:time', data),
    number: (data: { num1: number; num2: number; question?: string }) =>
      ipcRenderer.invoke('divination:number', data),
    coin: (data?: { question?: string }) =>
      ipcRenderer.invoke('divination:coin', data || {}),
    manual: (data: { yaoTypes: YaoType[]; question?: string }) =>
      ipcRenderer.invoke('divination:manual', data)
  },

  history: {
    list: (params?: { limit?: number; offset?: number; method?: string }) =>
      ipcRenderer.invoke('history:list', params),
    get: (id: string) =>
      ipcRenderer.invoke('history:get', id),
    save: (data: DivinationResult) =>
      ipcRenderer.invoke('history:save', data),
    update: (data: { id: string; question?: string; remark?: string }) =>
      ipcRenderer.invoke('history:update', data),
    delete: (id: string) =>
      ipcRenderer.invoke('history:delete', id),
    search: (keyword: string) =>
      ipcRenderer.invoke('history:search', keyword)
  },

  hexagram: {
    getAll: () =>
      ipcRenderer.invoke('hexagram:getAll'),
    search: (keyword: string) =>
      ipcRenderer.invoke('hexagram:search', keyword),
    get: (id: number) =>
      ipcRenderer.invoke('hexagram:get', id)
  },

  settings: {
    get: (key: string) =>
      ipcRenderer.invoke('settings:get', key),
    getAll: () =>
      ipcRenderer.invoke('settings:getAll'),
    set: (key: string, value: string) =>
      ipcRenderer.invoke('settings:set', { key, value }),
    reset: () =>
      ipcRenderer.invoke('settings:reset')
  },

  calendar: {
    toLunar: (data: { year: number; month: number; day: number }) =>
      ipcRenderer.invoke('calendar:toLunar', data),
    getGanZhi: (data: { year: number; month: number; day: number; hour: number }) =>
      ipcRenderer.invoke('calendar:getGanZhi', data)
  },

  export: {
    pdf: (historyId: string) =>
      ipcRenderer.invoke('export:pdf', { historyId }),
    txt: (historyId: string) =>
      ipcRenderer.invoke('export:txt', { historyId }),
    json: (includeSettings = true) =>
      ipcRenderer.invoke('export:json', { includeSettings })
  },

  database: {
    backup: () =>
      ipcRenderer.invoke('database:backup'),
    restore: (backupPath: string) =>
      ipcRenderer.invoke('database:restore', { backupPath })
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
