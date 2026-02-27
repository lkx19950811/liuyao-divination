import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DivinationResult, YaoType } from '@shared/types'

export const useDivinationStore = defineStore('divination', () => {
  const currentResult = ref<DivinationResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasResult = computed(() => currentResult.value !== null)

  async function timeDivination(year: number, month: number, day: number, hour: number, question?: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await window.electronAPI.divination.time({ year, month, day, hour, question })
      currentResult.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '起卦失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function numberDivination(num1: number, num2: number, question?: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await window.electronAPI.divination.number({ num1, num2, question })
      currentResult.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '起卦失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function coinDivination(question?: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await window.electronAPI.divination.coin({ question })
      currentResult.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '起卦失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function manualDivination(yaoTypes: YaoType[], question?: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await window.electronAPI.divination.manual({ yaoTypes, question })
      currentResult.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '起卦失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function saveResult(result: DivinationResult) {
    try {
      await window.electronAPI.history.save(result)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
      throw e
    }
  }

  function clearResult() {
    currentResult.value = null
    error.value = null
  }

  return {
    currentResult,
    isLoading,
    error,
    hasResult,
    timeDivination,
    numberDivination,
    coinDivination,
    manualDivination,
    saveResult,
    clearResult
  }
})
