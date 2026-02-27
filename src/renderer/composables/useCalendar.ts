import { ref } from 'vue'
import type { LunarDate, GanZhi } from '@shared/types'

export function useCalendar() {
  const year = ref(new Date().getFullYear())
  const month = ref(new Date().getMonth() + 1)
  const day = ref(new Date().getDate())
  const hour = ref(new Date().getHours())

  const lunarDate = ref<LunarDate | null>(null)
  const ganZhi = ref<GanZhi | null>(null)

  async function convertToLunar() {
    try {
      lunarDate.value = await window.electronAPI.calendar.toLunar({
        year: year.value,
        month: month.value,
        day: day.value
      })
    } catch (e) {
      console.error('Failed to convert to lunar:', e)
    }
  }

  async function getGanZhiForTime() {
    try {
      ganZhi.value = await window.electronAPI.calendar.getGanZhi({
        year: year.value,
        month: month.value,
        day: day.value,
        hour: hour.value
      })
    } catch (e) {
      console.error('Failed to get GanZhi:', e)
    }
  }

  function setSolarDate(y: number, m: number, d: number) {
    year.value = y
    month.value = m
    day.value = d
  }

  function setSolarHour(h: number) {
    hour.value = h
  }

  function getCurrentTime() {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours()
    }
  }

  function setCurrentTime() {
    const time = getCurrentTime()
    setSolarDate(time.year, time.month, time.day)
    setSolarHour(time.hour)
  }

  function getFormattedLunarDate(): string {
    if (!lunarDate.value) return ''
    const { LUNAR_MONTHS, LUNAR_DAYS } = require('@shared/utils/calendar')
    return `${lunarDate.value.year}年${lunarDate.value.isLeapMonth ? '闰' : ''}${LUNAR_MONTHS[lunarDate.value.month - 1]}${LUNAR_DAYS[lunarDate.value.day - 1]}`
  }

  function getFormattedGanZhi(): string {
    if (!ganZhi.value) return ''
    return ganZhi.value.fullString || `${ganZhi.value.year}年 ${ganZhi.value.month}月 ${ganZhi.value.day}日 ${ganZhi.value.hour}时`
  }

  return {
    year,
    month,
    day,
    hour,
    lunarDate,
    ganZhi,
    convertToLunar,
    getGanZhiForTime,
    setSolarDate,
    setSolarHour,
    getCurrentTime,
    setCurrentTime,
    getFormattedLunarDate,
    getFormattedGanZhi
  }
}
