import type { YaoType, Yao, Hexagram, DivinationResult, CoinResult, TimeInfo, LunarDate, GanZhi } from '../types'
import { HEXAGRAMS, TRIGRAMS, TRIGRAM_LIST, getHexagramByTrigrams, getHexagramByBinary } from '../data/hexagrams'
import { v4 as uuidv4 } from 'uuid'

export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
export const WUXING = ['金', '木', '水', '火', '土']

export function numberToTrigram(num: number): string {
  const remainder = num % 8
  const index = remainder === 0 ? 7 : remainder - 1
  return TRIGRAM_LIST[index]
}

export function calculateMovingYao(sum: number): number {
  const remainder = sum % 6
  return remainder === 0 ? 6 : remainder
}

export function yaoTypeToBinary(type: YaoType): string {
  return (type === 'yang' || type === 'oldYang') ? '1' : '0'
}

export function convertMovingYao(type: YaoType): 'yin' | 'yang' {
  if (type === 'oldYin') return 'yang'
  if (type === 'oldYang') return 'yin'
  return type
}

export function isMovingYao(type: YaoType): boolean {
  return type === 'oldYin' || type === 'oldYang'
}

export function createYao(type: YaoType, position: number): Yao {
  return {
    type,
    position,
    isMoving: isMovingYao(type)
  }
}

export function yaosToBinary(yaos: Yao[]): string {
  return yaos.map(y => yaoTypeToBinary(y.type)).join('')
}

export function yaosToTrigram(yaos: Yao[]): string {
  const binary = yaos.map(y => yaoTypeToBinary(y.type)).join('')
  for (const [name, trigram] of Object.entries(TRIGRAMS)) {
    if (trigram.binary === binary) {
      return name
    }
  }
  return '坤'
}

export function binaryToYaos(binary: string): Yao[] {
  const yaos: Yao[] = []
  for (let i = 0; i < binary.length; i++) {
    const bit = binary[i]
    yaos.push({
      type: bit === '1' ? 'yang' : 'yin',
      position: i + 1,
      isMoving: false
    })
  }
  return yaos
}

export function getHexagramFromYaos(yaos: Yao[]): Hexagram | undefined {
  const binary = yaosToBinary(yaos)
  return getHexagramByBinary(binary)
}

export function getChangedYaos(yaos: Yao[]): Yao[] {
  return yaos.map(yao => {
    if (yao.type === 'oldYin') {
      return { ...yao, type: 'yang' as const, isMoving: false }
    }
    if (yao.type === 'oldYang') {
      return { ...yao, type: 'yin' as const, isMoving: false }
    }
    return yao
  })
}

export function getMovingYaoPositions(yaos: Yao[]): number[] {
  return yaos.filter(y => y.isMoving).map(y => y.position)
}

export function throwCoins(): Array<'front' | 'back'> {
  return [0, 1, 2].map(() => (Math.random() > 0.5 ? 'front' : 'back'))
}

export function coinsToYaoType(coins: Array<'front' | 'back'>): YaoType {
  const frontCount = coins.filter(c => c === 'front').length
  switch (frontCount) {
    case 3: return 'oldYang'
    case 2: return 'yang'
    case 1: return 'yin'
    case 0: return 'oldYin'
    default: return 'yin'
  }
}

export function coinDivination(): { yaos: Yao[], coinResults: CoinResult[] } {
  const yaos: Yao[] = []
  const coinResults: CoinResult[] = []
  
  for (let i = 6; i >= 1; i--) {
    const coins = throwCoins()
    const yaoType = coinsToYaoType(coins)
    yaos.push(createYao(yaoType, i))
    coinResults.push({
      position: i,
      coins,
      yaoType
    })
  }
  
  return { yaos, coinResults }
}

export function timeDivination(year: number, month: number, day: number, hour: number): { 
  upperTrigram: string, 
  lowerTrigram: string, 
  movingYao: number 
} {
  const hourNum = Math.floor(hour / 2) + 1
  const upperSum = year + month + day
  const lowerSum = upperSum + hourNum
  
  const upperTrigram = numberToTrigram(upperSum)
  const lowerTrigram = numberToTrigram(lowerSum)
  const movingYao = calculateMovingYao(lowerSum)
  
  return { upperTrigram, lowerTrigram, movingYao }
}

export function numberDivination(num1: number, num2: number): { 
  upperTrigram: string, 
  lowerTrigram: string, 
  movingYao: number 
} {
  const upperTrigram = numberToTrigram(num1)
  const lowerTrigram = numberToTrigram(num2)
  const movingYao = calculateMovingYao(num1 + num2)
  
  return { upperTrigram, lowerTrigram, movingYao }
}

export function buildHexagramFromTrigrams(upperTrigram: string, lowerTrigram: string): Hexagram | undefined {
  return getHexagramByTrigrams(upperTrigram, lowerTrigram)
}

export function buildChangedHexagram(original: Hexagram, movingYaoPositions: number[]): Hexagram | undefined {
  if (movingYaoPositions.length === 0) return undefined
  
  const binary = original.binary.split('')
  for (const pos of movingYaoPositions) {
    const index = pos - 1
    binary[index] = binary[index] === '1' ? '0' : '1'
  }
  
  return getHexagramByBinary(binary.join(''))
}

export function buildDivinationResult(
  method: 'time' | 'number' | 'coin' | 'manual',
  originalHexagram: Hexagram,
  movingYaoPositions: number[],
  options?: {
    question?: string
    remark?: string
    coinResults?: CoinResult[]
    inputNumbers?: [number, number]
    timeInfo?: TimeInfo
    lunarDate?: LunarDate
    ganZhi?: GanZhi
  }
): DivinationResult {
  const changedHexagram = buildChangedHexagram(originalHexagram, movingYaoPositions)
  
  return {
    id: uuidv4(),
    createdAt: new Date(),
    method,
    originalHexagram,
    changedHexagram: changedHexagram ?? null,
    movingYaoPositions,
    question: options?.question ?? null,
    remark: options?.remark ?? null,
    coinResults: options?.coinResults,
    inputNumbers: options?.inputNumbers,
    timeInfo: options?.timeInfo,
    lunarDate: options?.lunarDate,
    ganZhi: options?.ganZhi
  }
}

export function manualDivination(yaoTypes: YaoType[]): Yao[] {
  return yaoTypes.map((type, index) => createYao(type, 6 - index))
}

export function getNajia(hexagram: Hexagram): Array<{ position: number, tiangan: string, dizhi: string, wuxing: string, liuqin: string | null }> {
  const najiaMap: Record<string, Array<{ dizhi: string, wuxing: string }>> = {
    '乾': [
      { dizhi: '戌', wuxing: '土' },
      { dizhi: '申', wuxing: '金' },
      { dizhi: '午', wuxing: '火' }
    ],
    '坤': [
      { dizhi: '未', wuxing: '土' },
      { dizhi: '巳', wuxing: '火' },
      { dizhi: '卯', wuxing: '木' }
    ],
    '震': [
      { dizhi: '戌', wuxing: '土' },
      { dizhi: '申', wuxing: '金' },
      { dizhi: '午', wuxing: '火' }
    ],
    '巽': [
      { dizhi: '未', wuxing: '土' },
      { dizhi: '巳', wuxing: '火' },
      { dizhi: '卯', wuxing: '木' }
    ],
    '坎': [
      { dizhi: '子', wuxing: '水' },
      { dizhi: '戌', wuxing: '土' },
      { dizhi: '申', wuxing: '金' }
    ],
    '离': [
      { dizhi: '巳', wuxing: '火' },
      { dizhi: '未', wuxing: '土' },
      { dizhi: '酉', wuxing: '金' }
    ],
    '艮': [
      { dizhi: '寅', wuxing: '木' },
      { dizhi: '子', wuxing: '水' },
      { dizhi: '戌', wuxing: '土' }
    ],
    '兑': [
      { dizhi: '巳', wuxing: '火' },
      { dizhi: '卯', wuxing: '木' },
      { dizhi: '丑', wuxing: '土' }
    ]
  }
  
  const lowerNajia = najiaMap[hexagram.lowerTrigram] || []
  const upperNajia = najiaMap[hexagram.upperTrigram] || []
  
  if (!lowerNajia || !upperNajia) {
    return []
  }
  
  const tianganLower = hexagram.lowerTrigram === '乾' || hexagram.lowerTrigram === '震' ? '甲' : '乙'
  const tianganUpper = hexagram.upperTrigram === '乾' || hexagram.upperTrigram === '震' ? '壬' : '癸'
  
  const result: Array<{ position: number, tiangan: string, dizhi: string, wuxing: string, liuqin: string | null }> = []
  
  for (let i = 0; i < 3; i++) {
    result.push({
      position: i + 1,
      tiangan: tianganLower,
      dizhi: lowerNajia[i]?.dizhi || '子',
      wuxing: lowerNajia[i]?.wuxing || '水',
      liuqin: null
    })
  }
  
  for (let i = 0; i < 3; i++) {
    result.push({
      position: i + 4,
      tiangan: tianganUpper,
      dizhi: upperNajia[i]?.dizhi || '子',
      wuxing: upperNajia[i]?.wuxing || '水',
      liuqin: null
    })
  }
  
  return result
}

export function getLiuqin(dayZhi: string, targetWuxing: string): string {
  const wuxingMap: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
  }
  
  const dayWuxing = wuxingMap[dayZhi] || '土'
  
  const wuxingCycle = ['金', '水', '木', '火', '土']
  const dayIndex = wuxingCycle.indexOf(dayWuxing)
  const targetIndex = wuxingCycle.indexOf(targetWuxing)
  
  const diff = (targetIndex - dayIndex + 5) % 5
  
  const liuqinNames = ['兄弟', '子孙', '妻财', '官鬼', '父母']
  return liuqinNames[diff]
}

export function getYaoci(hexagram: Hexagram, position: number): string {
  const yaociData: Record<string, string[]> = {
    '乾': ['初九：潜龙勿用。', '九二：见龙在田，利见大人。', '九三：君子终日乾乾，夕惕若，厉无咎。', '九四：或跃在渊，无咎。', '九五：飞龙在天，利见大人。', '上九：亢龙有悔。'],
    '坤': ['初六：履霜，坚冰至。', '六二：直方大，不习无不利。', '六三：含章可贞。或从王事，无成有终。', '六四：括囊，无咎无誉。', '六五：黄裳元吉。', '上六：龙战于野，其血玄黄。']
  }
  
  const key = hexagram.name
  if (yaociData[key] && yaociData[key][position - 1]) {
    return yaociData[key][position - 1]
  }
  
  return `${hexagram.name}第${position}爻`
}

export function getAllHexagrams(): Hexagram[] {
  return HEXAGRAMS
}

export function searchHexagrams(keyword: string): Hexagram[] {
  const lowerKeyword = keyword.toLowerCase()
  return HEXAGRAMS.filter(h => 
    h.name.includes(keyword) || 
    (h.alias && h.alias.includes(keyword)) ||
    h.description?.toLowerCase().includes(lowerKeyword)
  )
}
