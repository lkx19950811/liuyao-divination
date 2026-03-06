/**
 * 仪表盘数据服务
 * 提供运势可视化所需的数据处理
 */

export interface TrendData {
  date: string
  fortune: '吉' | '凶' | '平'
  score: number
  count: number
}

export interface KeywordCloudItem {
  word: string
  count: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface HexagramDistribution {
  hexagramName: string
  count: number
  percentage: number
}

export interface CycleReport {
  totalDivinations: number
  averagePerWeek: number
  peakDays: string[]
  lunarCorrelation: string
  insights: string[]
}

export interface FortuneSummary {
  totalRecords: number
  luckyCount: number
  unluckyCount: number
  neutralCount: number
  mostFrequentHexagram: string
  recentTrend: 'up' | 'down' | 'stable'
}

// 吉凶判断词
const LUCKY_WORDS = ['吉', '利', '亨', '顺', '成', '喜', '福', '祥', '泰', '安', '昌', '兴', '荣', '通', '达']
const UNLUCKY_WORDS = ['凶', '险', '难', '阻', '困', '厄', '灾', '祸', '患', '忧', '悲', '苦', '滞', '败', '破']

/**
 * 从文本分析吉凶得分
 */
export function analyzeFortuneScore(text: string): number {
  if (!text) return 50

  let luckyCount = 0
  let unluckyCount = 0

  LUCKY_WORDS.forEach(word => {
    const regex = new RegExp(word, 'g')
    const matches = text.match(regex)
    if (matches) luckyCount += matches.length
  })

  UNLUCKY_WORDS.forEach(word => {
    const regex = new RegExp(word, 'g')
    const matches = text.match(regex)
    if (matches) unluckyCount += matches.length
  })

  // 计算得分 (0-100)
  const total = luckyCount + unluckyCount
  if (total === 0) return 50

  const score = Math.round((luckyCount / total) * 100)
  return Math.max(0, Math.min(100, score))
}

/**
 * 判断吉凶
 */
export function getFortuneLevel(score: number): '吉' | '凶' | '平' {
  if (score >= 65) return '吉'
  if (score <= 35) return '凶'
  return '平'
}

/**
 * 提取关键词
 */
export function extractKeywords(texts: string[], limit: number = 30): KeywordCloudItem[] {
  const stopWords = new Set([
    '的', '了', '是', '在', '和', '有', '不', '这', '我', '你', '他', '她', '它',
    '们', '就', '也', '都', '而', '及', '与', '着', '或', '一个', '这个', '那个',
    '之', '以', '为', '于', '上', '下', '中', '来', '去', '到', '说', '要', '会',
    '能', '可', '但', '如', '若', '则', '其', '所', '者', '也', '矣', '焉',
    '卦', '爻', '象', '辞', '本', '变', '动', '初', '二', '三', '四', '五', '上'
  ])

  const wordCount: Record<string, { count: number; sentiment: 'positive' | 'negative' | 'neutral' }> = {}

  texts.forEach(text => {
    if (!text) return

    // 分词（简单实现，按标点和空格分割）
    const words = text.split(/[\s，。！？、；：""''（）【】《》\n]+/)
      .filter(w => w.length >= 2 && !stopWords.has(w))

    words.forEach(word => {
      if (!wordCount[word]) {
        // 判断情感倾向
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
        if (LUCKY_WORDS.some(w => word.includes(w))) {
          sentiment = 'positive'
        } else if (UNLUCKY_WORDS.some(w => word.includes(w))) {
          sentiment = 'negative'
        }

        wordCount[word] = { count: 0, sentiment }
      }
      wordCount[word].count++
    })
  })

  // 排序并取前 limit 个
  return Object.entries(wordCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([word, data]) => ({
      word,
      count: data.count,
      sentiment: data.sentiment
    }))
}

/**
 * 分析趋势数据
 */
export function analyzeTrend(records: Array<{ createdAt: string; aiInterpretation: string | null }>): TrendData[] {
  const dailyData: Record<string, { scores: number[]; count: number }> = {}

  records.forEach(record => {
    const date = new Date(record.createdAt).toISOString().split('T')[0]
    const score = analyzeFortuneScore(record.aiInterpretation || '')

    if (!dailyData[date]) {
      dailyData[date] = { scores: [], count: 0 }
    }

    dailyData[date].scores.push(score)
    dailyData[date].count++
  })

  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      fortune: getFortuneLevel(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      count: data.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 分析卦象分布
 */
export function analyzeHexagramDistribution(
  records: Array<{ originalHexagramId: number }>,
  hexagrams: Array<{ id: number; name: string }>
): HexagramDistribution[] {
  const countMap: Record<number, number> = {}
  const total = records.length

  records.forEach(record => {
    countMap[record.originalHexagramId] = (countMap[record.originalHexagramId] || 0) + 1
  })

  return Object.entries(countMap)
    .map(([id, count]) => {
      const hexagram = hexagrams.find(h => h.id === parseInt(id))
      return {
        hexagramName: hexagram?.name || `卦${id}`,
        count,
        percentage: Math.round((count / total) * 100)
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

/**
 * 生成周期报告
 */
export function generateCycleReport(
  records: Array<{ createdAt: string }>,
  trendData: TrendData[]
): CycleReport {
  const totalDivinations = records.length

  // 计算平均每周起卦数
  const firstDate = records.length > 0 ? new Date(records[records.length - 1].createdAt) : new Date()
  const lastDate = records.length > 0 ? new Date(records[0].createdAt) : new Date()
  const weeks = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
  const averagePerWeek = Math.round(totalDivinations / weeks * 10) / 10

  // 找出起卦高峰日
  const dailyCounts: Record<string, number> = {}
  records.forEach(record => {
    const date = new Date(record.createdAt).toISOString().split('T')[0]
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  const peakDays = Object.entries(dailyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([date]) => date)

  // 生成洞察
  const insights: string[] = []

  if (trendData.length >= 7) {
    const recentScores = trendData.slice(-7).map(d => d.score)
    const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length

    if (avgRecent >= 65) {
      insights.push('近期运势较好，适合积极行动')
    } else if (avgRecent <= 35) {
      insights.push('近期运势偏弱，建议谨慎行事')
    } else {
      insights.push('近期运势平稳，可按部就班')
    }
  }

  if (totalDivinations >= 10) {
    insights.push(`已累计起卦 ${totalDivinations} 次，保持平常心最重要`)
  }

  if (averagePerWeek > 3) {
    insights.push('起卦频率较高，建议放慢节奏，深思熟虑')
  }

  return {
    totalDivinations,
    averagePerWeek,
    peakDays,
    lunarCorrelation: '暂无数据',
    insights
  }
}