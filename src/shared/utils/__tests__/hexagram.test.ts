import { describe, it, expect } from 'vitest'
import { 
  numberToTrigram, 
  calculateMovingYao, 
  yaoTypeToBinary,
  convertMovingYao,
  isMovingYao,
  createYao,
  yaosToBinary,
  coinsToYaoType,
  buildHexagramFromTrigrams,
  buildChangedHexagram,
  getMovingYaoPositions
} from '../hexagram'
import { HEXAGRAMS } from '../../data/hexagrams'

describe('hexagram utils', () => {
  describe('numberToTrigram', () => {
    it('should convert number to correct trigram based on TRIGRAM_LIST order', () => {
      expect(numberToTrigram(1)).toBe('坤')
      expect(numberToTrigram(2)).toBe('震')
      expect(numberToTrigram(3)).toBe('坎')
      expect(numberToTrigram(4)).toBe('兑')
      expect(numberToTrigram(5)).toBe('艮')
      expect(numberToTrigram(6)).toBe('离')
      expect(numberToTrigram(7)).toBe('巽')
      expect(numberToTrigram(8)).toBe('乾')
      expect(numberToTrigram(9)).toBe('坤')
    })
  })

  describe('calculateMovingYao', () => {
    it('should return correct moving yao position', () => {
      expect(calculateMovingYao(6)).toBe(6)
      expect(calculateMovingYao(7)).toBe(1)
      expect(calculateMovingYao(12)).toBe(6)
      expect(calculateMovingYao(13)).toBe(1)
    })
  })

  describe('yaoTypeToBinary', () => {
    it('should convert yang types to 1', () => {
      expect(yaoTypeToBinary('yang')).toBe('1')
      expect(yaoTypeToBinary('oldYang')).toBe('1')
    })

    it('should convert yin types to 0', () => {
      expect(yaoTypeToBinary('yin')).toBe('0')
      expect(yaoTypeToBinary('oldYin')).toBe('0')
    })
  })

  describe('convertMovingYao', () => {
    it('should convert oldYin to yang', () => {
      expect(convertMovingYao('oldYin')).toBe('yang')
    })

    it('should convert oldYang to yin', () => {
      expect(convertMovingYao('oldYang')).toBe('yin')
    })

    it('should keep yin and yang unchanged', () => {
      expect(convertMovingYao('yin')).toBe('yin')
      expect(convertMovingYao('yang')).toBe('yang')
    })
  })

  describe('isMovingYao', () => {
    it('should return true for old yin/yang', () => {
      expect(isMovingYao('oldYin')).toBe(true)
      expect(isMovingYao('oldYang')).toBe(true)
    })

    it('should return false for regular yin/yang', () => {
      expect(isMovingYao('yin')).toBe(false)
      expect(isMovingYao('yang')).toBe(false)
    })
  })

  describe('createYao', () => {
    it('should create yao with correct properties', () => {
      const yao = createYao('oldYang', 1)
      expect(yao.type).toBe('oldYang')
      expect(yao.position).toBe(1)
      expect(yao.isMoving).toBe(true)
    })
  })

  describe('yaosToBinary', () => {
    it('should convert yaos to binary string', () => {
      const yaos = [
        createYao('yang', 1),
        createYao('yin', 2),
        createYao('yang', 3),
        createYao('yin', 4),
        createYao('yang', 5),
        createYao('yin', 6)
      ]
      expect(yaosToBinary(yaos)).toBe('101010')
    })
  })

  describe('coinsToYaoType', () => {
    it('should return oldYang for 3 fronts', () => {
      expect(coinsToYaoType(['front', 'front', 'front'])).toBe('oldYang')
    })

    it('should return yang for 2 fronts', () => {
      expect(coinsToYaoType(['front', 'front', 'back'])).toBe('yang')
    })

    it('should return yin for 1 front', () => {
      expect(coinsToYaoType(['front', 'back', 'back'])).toBe('yin')
    })

    it('should return oldYin for 0 fronts', () => {
      expect(coinsToYaoType(['back', 'back', 'back'])).toBe('oldYin')
    })
  })

  describe('buildHexagramFromTrigrams', () => {
    it('should find hexagram by trigrams', () => {
      const hexagram = buildHexagramFromTrigrams('乾', '乾')
      expect(hexagram?.name).toBe('乾')
    })

    it('should find hexagram by different trigrams', () => {
      const hexagram = buildHexagramFromTrigrams('坤', '乾')
      expect(hexagram?.name).toBe('泰')
    })
  })

  describe('buildChangedHexagram', () => {
    it('should build changed hexagram with moving yaos', () => {
      const qian = HEXAGRAMS.find(h => h.name === '乾')!
      const changed = buildChangedHexagram(qian, [1])
      expect(changed?.name).toBe('夬')
    })

    it('should build changed hexagram with 6th yao moving', () => {
      const qian = HEXAGRAMS.find(h => h.name === '乾')!
      const changed = buildChangedHexagram(qian, [6])
      expect(changed?.name).toBe('姤')
    })

    it('should return undefined if no moving yaos', () => {
      const qian = HEXAGRAMS.find(h => h.name === '乾')!
      const changed = buildChangedHexagram(qian, [])
      expect(changed).toBeUndefined()
    })
  })

  describe('getMovingYaoPositions', () => {
    it('should return positions of moving yaos', () => {
      const yaos = [
        createYao('yang', 1),
        createYao('oldYin', 2),
        createYao('yang', 3),
        createYao('oldYang', 4),
        createYao('yang', 5),
        createYao('yin', 6)
      ]
      expect(getMovingYaoPositions(yaos)).toEqual([2, 4])
    })
  })
})
