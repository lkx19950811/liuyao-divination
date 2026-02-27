import type {
  DivinationResult,
  YaoType,
  HistoryRecord,
  LunarDate,
  GanZhi,
  Hexagram
} from '@shared/types'

declare global {
  interface Window {
    electronAPI: {
      // 窗口控制
      window: {
        minimize: () => Promise<{ success: boolean }>
        maximize: () => Promise<{ success: boolean }>
        close: () => Promise<{ success: boolean }>
        isMaximized: () => Promise<boolean>
        onWindowMaximized: (callback: (_event: unknown, isMaximized: boolean) => void) => void
        removeWindowMaximizedListener: (callback: (_event: unknown, isMaximized: boolean) => void) => void
      }
      // 起卦相关
      divination: {
        time: (data: {
          year: number
          month: number
          day: number
          hour: number
          question?: string
        }) => Promise<DivinationResult>
        number: (data: {
          num1: number
          num2: number
          question?: string
        }) => Promise<DivinationResult>
        coin: (data?: { question?: string }) => Promise<DivinationResult>
        manual: (data: {
          yaoTypes: YaoType[]
          question?: string
        }) => Promise<DivinationResult>
      }
      // 历史记录相关
      history: {
        list: (params?: {
          limit?: number
          offset?: number
          method?: string
        }) => Promise<Array<HistoryRecord>>
        get: (id: string) => Promise<HistoryRecord | null>
        save: (data: DivinationResult) => Promise<{ success: boolean }>
        update: (data: {
          id: string
          question?: string
          remark?: string
        }) => Promise<{ success: boolean }>
        delete: (id: string) => Promise<{ success: boolean }>
        search: (keyword: string) => Promise<Array<HistoryRecord>>
      }
      // 卦象数据相关
      hexagram: {
        getAll: () => Promise<Array<Hexagram>>
        search: (keyword: string) => Promise<Array<Hexagram>>
        get: (id: number) => Promise<Hexagram>
      }
      // 设置相关
      settings: {
        get: (key: string) => Promise<string | null>
        getAll: () => Promise<Record<string, string>>
        set: (key: string, value: string) => Promise<{ success: boolean }>
        reset: () => Promise<{ success: boolean }>
      }
      // 日历相关
      calendar: {
        toLunar: (data: {
          year: number
          month: number
          day: number
        }) => Promise<LunarDate>
        getGanZhi: (data: {
          year: number
          month: number
          day: number
          hour: number
        }) => Promise<GanZhi>
      }
      // 导出相关
      export: {
        txt: (historyId: string) => Promise<{
          success: boolean
          filePath?: string
        }>
        pdf: (historyId: string) => Promise<{
          success: boolean
          filePath?: string
        }>
        json: (includeSettings?: boolean) => Promise<{
          success: boolean
          filePath?: string
          recordCount?: number
        }>
      }
      // 数据库相关
      database: {
        backup: () => Promise<{
          success: boolean
          filePath?: string
        }>
        restore: (backupPath: string) => Promise<{
          success: boolean
        }>
      }
    }
  }
}

export {}
