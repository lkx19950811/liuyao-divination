export type YaoType = 'yin' | 'yang' | 'oldYin' | 'oldYang'

export interface Yao {
  type: YaoType
  position: number
  isMoving: boolean
}

export interface Trigram {
  name: string
  symbol: string
  wuxing: string
  nature: string
  family: string
  direction: string
  season: string
  binary: string
}

export interface Hexagram {
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
  yaoci?: YaoCi[]
  najia?: Najia[]
}

export interface YaoCi {
  position: number
  content: string
  interpretation: string | null
  xiaoxiang: string | null
}

export interface Najia {
  position: number
  tiangan: string
  dizhi: string
  wuxing: string
  liuqin: string | null
}

export type DivinationMethod = 'time' | 'number' | 'coin' | 'manual'

export interface DivinationResult {
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

export interface CoinResult {
  position: number
  coins: Array<'front' | 'back'>
  yaoType: YaoType
}

export interface TimeInfo {
  year: number
  month: number
  day: number
  hour: number
  useLunar: boolean
}

export interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
}

export interface GanZhi {
  year: string
  month: string
  day: string
  hour: string
  fullString: string
}

export interface HistoryRecord {
  id: string
  createdAt: string
  updatedAt: string
  method: DivinationMethod
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
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  hexagramStyle: 'traditional' | 'modern'
  autoSave: boolean
  defaultMethod: DivinationMethod
}
