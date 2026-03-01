import type {
  DivinationResult,
  YaoType,
  HistoryRecord,
  LunarDate,
  GanZhi,
  Hexagram,
  AISettings
} from '@shared/types'

declare global {
  interface Window {
    electronAPI: {
      // 应用信息
      app: {
        getVersion: () => Promise<string>
      }
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
          aiInterpretation?: string
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
      // AI相关
      ai: {
        checkOllama: (url: string) => Promise<{
          connected: boolean
          models: Array<{ name: string }>
        }>
        checkOllamaInstalled: () => Promise<{
          installed: boolean
          version?: string
          path?: string
          running: boolean
        }>
        startOllama: () => Promise<{
          success: boolean
          message: string
        }>
        stopOllama: () => Promise<{
          success: boolean
          message: string
        }>
        generate: (data: {
          settings: AISettings
          question: string | null
          originalHexagram: Hexagram
          changedHexagram: Hexagram | null
          movingYaoPositions: number[]
        }) => Promise<string>
        generateStream: (
          data: {
            settings: AISettings
            question: string | null
            originalHexagram: Hexagram
            changedHexagram: Hexagram | null
            movingYaoPositions: number[]
          },
          onChunk: (text: string) => void,
          onEnd: () => void,
          onError: (error: string) => void
        ) => () => void
        downloadOllama: (useMirror: boolean) => Promise<{
          success: boolean
          filePath?: string
          message: string
        }>
        installOllama: (installerPath: string) => Promise<{
          success: boolean
          message: string
          path?: string
        }>
        onDownloadProgress: (callback: (_event: unknown, data: { progress: number; downloadedSize: number; totalSize: number; message?: string }) => void) => void
        removeDownloadProgressListener: (callback: (_event: unknown, data: { progress: number; downloadedSize: number; totalSize: number; message?: string }) => void) => void
        openDownloadPage: (useMirror: boolean) => Promise<{ success: boolean }>
        pullModel: (modelName: string) => Promise<{ success: boolean; message: string }>
        onModelPullProgress: (callback: (_event: unknown, data: { output: string; progress?: number; type: string }) => void) => void
        removeModelPullProgressListener: (callback: (_event: unknown, data: { output: string; progress?: number; type: string }) => void) => void
      }
    }
  }
}

export {}
