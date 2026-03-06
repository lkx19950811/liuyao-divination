import type {
  DivinationResult,
  YaoType,
  HistoryRecord,
  LunarDate,
  GanZhi,
  Hexagram,
  AISettings,
  CoinResult
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
        restart: () => Promise<{ success: boolean }>
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
        coinWithData: (data: {
          coinResults: CoinResult[]
          question?: string
        }) => Promise<DivinationResult>
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
        pullModel: (modelName: string, mirrorUrl?: string) => Promise<{ success: boolean; message: string }>
        onModelPullProgress: (callback: (_event: unknown, data: { output: string; progress?: number; type: string }) => void) => void
        removeModelPullProgressListener: (callback: (_event: unknown, data: { output: string; progress?: number; type: string }) => void) => void
      }
      // 天气相关
      weather: {
        getCurrent: () => Promise<{
          condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'
          temperature: number
          humidity: number
          description: string
          icon: string
          cityName?: string
        }>
        getByCity: (city: string) => Promise<{
          condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'
          temperature: number
          humidity: number
          description: string
          icon: string
          cityName?: string
        }>
        getCached: () => Promise<{
          condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'
          temperature: number
          humidity: number
          description: string
          icon: string
          cityName?: string
        } | null>
        getHexagramHint: (condition: string) => Promise<{
          trigram: string
          hint: string
        } | null>
      }
      // AI 角色扮演相关
      aiRoleplay: {
        getPersonas: () => Promise<Array<{
          id: string
          name: string
          description: string
          avatar: string
        }>>
        setPersona: (persona: string) => Promise<{ success: boolean }>
        getCurrentPersona: () => Promise<string>
        createSession: (divinationId: string) => Promise<{
          id: string
          divinationId: string
          persona: string
          messages: Array<{ role: string; content: string; timestamp: number }>
          createdAt: number
          updatedAt: number
        }>
        getSession: (sessionId: string) => Promise<{
          id: string
          divinationId: string
          persona: string
          messages: Array<{ role: string; content: string; timestamp: number }>
          createdAt: number
          updatedAt: number
        } | undefined>
        getSessionHistory: (sessionId?: string) => Promise<Array<{ role: string; content: string; timestamp: number }>>
        deleteSession: (sessionId: string) => Promise<boolean>
        chatStream: (
          data: {
            sessionId?: string
            hexagramContext: string
            message: string
            settings: {
              enabled: boolean
              ollamaUrl: string
              model: string
              temperature: number
              maxTokens: number
            }
          },
          onChunk: (text: string) => void,
          onEnd: (data: { fullResponse: string }) => void,
          onError: (error: string) => void
        ) => () => void
      },
      // 仪表盘相关
      dashboard: {
        getTrend: (startDate?: string, endDate?: string) => Promise<Array<{
          date: string
          fortune: '吉' | '凶' | '平'
          score: number
          count: number
        }>>
        getKeywordCloud: (limit?: number) => Promise<Array<{
          word: string
          count: number
          sentiment: 'positive' | 'negative' | 'neutral'
        }>>
        getHexagramDistribution: () => Promise<Array<{
          hexagramName: string
          count: number
          percentage: number
        }>>
        getCycleReport: () => Promise<{
          totalDivinations: number
          averagePerWeek: number
          peakDays: string[]
          lunarCorrelation: string
          insights: string[]
        }>
        getSummary: () => Promise<{
          totalRecords: number
          luckyCount: number
          unluckyCount: number
          neutralCount: number
          mostFrequentHexagram: string
          recentTrend: 'up' | 'down' | 'stable'
        }>
      }
    }
  }
}

export {}
