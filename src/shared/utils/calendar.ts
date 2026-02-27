/**
 * 农历日历转换工具
 * 参考：1900-2100年农历数据
 */

// 农历数据表，每个元素代表一年的农历信息（十六进制格式）
// 数据格式说明：
// bit 0-3: 闰月月份 (0表示无闰月)
// bit 4-15: 12个月的大小 (1=大月30天, 0=小月29天)
// bit 16: 闰月是大月还是小月 (1=30天, 0=29天)
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b3, 0x0a6d0, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6,
  0x0d2e0, 0x0d950, 0x0d550, 0x0b540, 0x0b6a6, 0x196d0, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0,
  0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x174a6,
  0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0fda5, 0x05d50, 0x056d0,
  0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370,
  0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3,
  0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8,
  0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930,
  0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950,
  0x0d550, 0x0b540, 0x0b6a6, 0x196d0, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50,
  0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x174a6, 0x0a4e0, 0x0ad50,
  0x0aad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0fda5, 0x05d50, 0x056d0, 0x055b2, 0x049b0,
  0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970,
  0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557,
  0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0,
  0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0,
  0x0ad50, 0x14b55, 0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950, 0x0d550, 0x0b540,
  0x0b6a6, 0x196d0, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
  0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x174a6, 0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0,
  0x1d0b6, 0x0d250, 0x0d520, 0x0fda5, 0x05d50, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0,
  0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6,
  0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50,
  0x05d55, 0x056a0, 0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50,
  0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55,
  0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950, 0x0d550, 0x0b540, 0x0b6a6, 0x196d0,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x174a6, 0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0, 0x1d0b6, 0x0d250,
  0x0d520, 0x0fda5, 0x05d50, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255,
  0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20,
  0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0,
  0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4,
  0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a5e0,
  0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950, 0x0d550, 0x0b540, 0x0b6a6, 0x196d0, 0x095b0, 0x049b0,
  0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970,
  0x064b0, 0x174a6, 0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0fda5,
  0x05d50, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6,
  0x0d2e0, 0x0d950, 0x0d550, 0x0b540, 0x0b6a6, 0x196d0, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0,
  0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x174a6,
  0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0fda5, 0x05d50, 0x056d0,
  0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370,
  0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3,
  0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8,
  0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930,
  0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950,
  0x0d550, 0x0b540, 0x0b6a6, 0x196d0, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50,
  0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x174a6, 0x0a4e0, 0x0ad50,
  0x0aad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0fda5, 0x05d50, 0x056d0, 0x055b2, 0x049b0,
  0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970,
  0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557,
  0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0,
  0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0,
  0x0ad50, 0x14b55, 0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950, 0x0d550, 0x0b540,
  0x0b6a6, 0x196d0, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
  0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x174a6, 0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0,
  0x1d0b6, 0x0d250, 0x0d520, 0x0fda5, 0x05d50, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0,
  0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6,
  0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50,
  0x05d55, 0x056a0, 0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50,
  0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55,
  0x04b60, 0x0a5e0, 0x0a5b0, 0x151a6, 0x0d2e0, 0x0d950, 0x0d550, 0x0b540, 0x0b6a6, 0x196d0,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x174a6, 0x0a4e0, 0x0ad50, 0x0aad0, 0x0a4d0, 0x1d0b6
]

export const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
export const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
export const ZHI_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
export const SHICHEN_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']

// 天干地支别名
export const TIANGAN = GAN
export const DIZHI = ZHI

// 农历1900年1月31日是星期一
const START_DATE = new Date(1900, 0, 31)
const START_YEAR = 1900

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

// 获取农历年的总天数
function getLunarYearDays(year: number): number {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - START_YEAR] & i) ? 1 : 0
  }
  return sum + getLeapMonthDays(year)
}

// 获取闰月的天数
function getLeapMonthDays(year: number): number {
  if (getLeapMonth(year)) {
    return (LUNAR_INFO[year - START_YEAR] & 0x10000) ? 30 : 29
  }
  return 0
}

// 获取闰月月份（0表示无闰月）
function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - START_YEAR] & 0xf
}

// 获取农历某月的天数
function getLunarMonthDays(year: number, month: number): number {
  return (LUNAR_INFO[year - START_YEAR] & (0x10000 >> month)) ? 30 : 29
}

/**
 * 公历转农历
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  if (year < 1900 || year > 2100) {
    throw new Error('年份超出范围，仅支持1900-2100年')
  }

  // 计算与1900年1月31日的天数差
  const solarDate = new Date(year, month - 1, day)
  let offset = Math.floor((solarDate.getTime() - START_DATE.getTime()) / 86400000)

  let lunarYear = START_YEAR
  let lunarMonth = 1
  let lunarDay = 1
  let isLeapMonth = false

  // 计算农历年
  let yearDays = 0
  while (lunarYear < 2101 && offset > 0) {
    yearDays = getLunarYearDays(lunarYear)
    if (offset < yearDays) {
      break
    }
    offset -= yearDays
    lunarYear++
  }

  // 计算农历月
  const leapMonth = getLeapMonth(lunarYear)
  let isLeap = false
  let monthDays = 0

  for (let i = 1; i <= 12; i++) {
    // 处理闰月
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
      isLeap = true
      monthDays = getLeapMonthDays(lunarYear)
      i--
    } else {
      monthDays = getLunarMonthDays(lunarYear, i)
    }

    if (offset < monthDays) {
      lunarMonth = i
      isLeapMonth = isLeap && i === leapMonth
      break
    }

    offset -= monthDays
    if (isLeap && i === leapMonth) {
      isLeap = false
    }
  }

  lunarDay = offset + 1

  // 计算干支
  const yearGanZhi = getYearGanZhi(lunarYear)
  const monthGanZhi = getMonthGanZhi(lunarYear, lunarMonth)
  const dayGanZhi = getDayGanZhi(year, month, day)

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
    yearGanZhi,
    monthGanZhi,
    dayGanZhi
  }
}

/**
 * 农历转公历（简化版本，仅返回最接近的公历日期）
 */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth = false): { year: number, month: number, day: number } {
  if (year < 1900 || year > 2100) {
    throw new Error('年份超出范围，仅支持1900-2100年')
  }

  let offset = 0

  // 计算到该年份的天数
  for (let y = START_YEAR; y < year; y++) {
    offset += getLunarYearDays(y)
  }

  // 计算该年的月份
  const leapMonth = getLeapMonth(year)
  let isLeap = false

  for (let i = 1; i < month; i++) {
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
      isLeap = true
      offset += getLeapMonthDays(year)
      i--
    } else {
      offset += getLunarMonthDays(year, i)
    }
    if (isLeap && i === leapMonth) {
      isLeap = false
    }
  }

  // 如果是闰月
  if (isLeapMonth && month === leapMonth) {
    offset += getLunarMonthDays(year, month)
  }

  offset += day - 1

  const resultDate = new Date(START_DATE.getTime() + offset * 86400000)
  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate()
  }
}

/**
 * 获取年干支
 */
export function getYearGanZhi(lunarYear: number): string {
  const ganIndex = (lunarYear - 4) % 10
  const zhiIndex = (lunarYear - 4) % 12
  return GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10] + ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
}

/**
 * 获取月干支
 */
export function getMonthGanZhi(lunarYear: number, lunarMonth: number): string {
  const yearGanIndex = (lunarYear - 4) % 10

  // 月干计算（五虎遁年起月法）
  const monthGanIndexMap: Record<number, number[]> = {
    0: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3],
    1: [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    2: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7],
    3: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1],
    5: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3],
    6: [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    7: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7],
    8: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1]
  }

  const monthGanIndex = monthGanIndexMap[yearGanIndex >= 0 ? yearGanIndex : yearGanIndex + 10][lunarMonth - 1]

  // 月支固定：寅月起
  const monthZhiIndex = (lunarMonth + 1) % 12

  return GAN[monthGanIndex] + ZHI[monthZhiIndex]
}

/**
 * 获取日干支
 */
export function getDayGanZhi(solarYear: number, solarMonth: number, solarDay: number): string {
  // 基准日期：1900年1月1日是甲辰日
  const baseDate = new Date(1900, 0, 1)
  const targetDate = new Date(solarYear, solarMonth - 1, solarDay)
  const offsetDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000)

  const baseGanIndex = 0
  const baseZhiIndex = 4

  const ganIndex = (baseGanIndex + offsetDays) % 10
  const zhiIndex = (baseZhiIndex + offsetDays) % 12

  return GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10] + ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
}

/**
 * 获取时干支
 */
export function getHourGanZhi(dayGanZhi: string, hour: number): string {
  const dayGanIndex = GAN.indexOf(dayGanZhi[0])

  const hourGanIndexMap: Record<number, number[]> = {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1],
    1: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3],
    2: [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    3: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7],
    4: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1],
    6: [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3],
    7: [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    8: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7],
    9: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  }

  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12
  const hourGanIndex = hourGanIndexMap[dayGanIndex >= 0 ? dayGanIndex : dayGanIndex + 10][hourZhiIndex]

  return GAN[hourGanIndex] + ZHI[hourZhiIndex]
}

/**
 * 获取完整的干支信息
 */
export function getGanZhi(year: number, month: number, day: number, hour: number): GanZhi {
  const lunar = solarToLunar(year, month, day)
  const hourGanZhi = getHourGanZhi(lunar.dayGanZhi, hour)

  const fullString = `${lunar.yearGanZhi}年 ${lunar.monthGanZhi}月 ${lunar.dayGanZhi}日 ${hourGanZhi}时`

  return {
    year: lunar.yearGanZhi,
    month: lunar.monthGanZhi,
    day: lunar.dayGanZhi,
    hour: hourGanZhi,
    fullString
  }
}

/**
 * 获取时辰名称
 */
export function getShichen(hour: number): string {
  const index = getShichenIndex(hour)
  return SHICHEN_NAMES[index]
}

/**
 * 获取时辰索引
 */
export function getShichenIndex(hour: number): number {
  return Math.floor((hour + 1) / 2) % 12
}

/**
 * 获取带干支的农历日期（用于时间起卦）
 */
export function getLunarDateWithGanZhi(solarYear: number, solarMonth: number, solarDay: number, solarHour: number): {
  lunar: LunarDate
  ganZhi: GanZhi
} {
  const lunar = solarToLunar(solarYear, solarMonth, solarDay)
  const ganZhi = getGanZhi(solarYear, solarMonth, solarDay, solarHour)

  return { lunar, ganZhi }
}

/**
 * 格式化农历日期显示
 */
export function formatLunarDate(lunar: LunarDate): string {
  const leapText = lunar.isLeapMonth ? '闰' : ''
  const monthName = LUNAR_MONTHS[lunar.month - 1] || '正月'
  const dayName = LUNAR_DAYS[lunar.day - 1] || '初一'
  return `${lunar.year}年${leapText}${monthName}${dayName}`
}

/**
 * 格式化干支显示
 */
export function formatGanZhi(ganZhi: GanZhi): string {
  return ganZhi.fullString
}
