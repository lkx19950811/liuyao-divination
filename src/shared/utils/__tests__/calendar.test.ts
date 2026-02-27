import { describe, it, expect } from 'vitest'
import { 
  getYearGanZhi,
  getMonthGanZhi,
  getDayGanZhi,
  getHourGanZhi,
  getGanZhi,
  solarToLunar,
  getShichen,
  getShichenIndex,
  TIANGAN,
  DIZHI
} from '../calendar'

describe('calendar utils', () => {
  describe('getYearGanZhi', () => {
    it('should return correct year gan-zhi', () => {
      expect(getYearGanZhi(2024)).toBe('甲辰')
      expect(getYearGanZhi(2025)).toBe('乙巳')
      expect(getYearGanZhi(2026)).toBe('丙午')
    })
  })

  describe('getMonthGanZhi', () => {
    it('should return correct month gan-zhi', () => {
      const result = getMonthGanZhi(2024, 1)
      expect(result.length).toBe(2)
      expect(DIZHI.includes(result[1])).toBe(true)
    })
  })

  describe('getDayGanZhi', () => {
    it('should return correct day gan-zhi', () => {
      const result = getDayGanZhi(2024, 1, 1)
      expect(result.length).toBe(2)
      expect(TIANGAN.includes(result[0])).toBe(true)
      expect(DIZHI.includes(result[1])).toBe(true)
    })
  })

  describe('getHourGanZhi', () => {
    it('should return correct hour gan-zhi', () => {
      const dayGan = '甲'
      const result = getHourGanZhi(dayGan, 0)
      expect(result.length).toBe(2)
    })
  })

  describe('getGanZhi', () => {
    it('should return complete gan-zhi for a date', () => {
      const result = getGanZhi(2024, 1, 1, 12)
      expect(result.year).toBeDefined()
      expect(result.month).toBeDefined()
      expect(result.day).toBeDefined()
      expect(result.hour).toBeDefined()
    })
  })

  describe('solarToLunar', () => {
    it('should convert solar date to lunar date', () => {
      const result = solarToLunar(2024, 1, 1)
      expect(result.year).toBeDefined()
      expect(result.month).toBeDefined()
      expect(result.day).toBeDefined()
      expect(result.yearGanZhi).toBeDefined()
    })

    it('should handle leap month correctly', () => {
      const result = solarToLunar(2024, 3, 10)
      expect(result).toBeDefined()
    })
  })

  describe('getShichen', () => {
    it('should return correct shichen for hour', () => {
      expect(getShichen(0)).toContain('子时')
      expect(getShichen(6)).toContain('卯时')
      expect(getShichen(12)).toContain('午时')
      expect(getShichen(23)).toContain('子时')
    })
  })

  describe('getShichenIndex', () => {
    it('should return correct shichen index', () => {
      expect(getShichenIndex(0)).toBe(0)
      expect(getShichenIndex(2)).toBe(1)
      expect(getShichenIndex(4)).toBe(2)
      expect(getShichenIndex(12)).toBe(6)
      expect(getShichenIndex(23)).toBe(0)
    })
  })
})
