import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  const records = ref<Array<{
    id: string
    createdAt: string
    method: string
    originalHexagramId: number
    changedHexagramId: number | null
    movingYaoPositions: number[]
    question: string | null
  }>>([])
  
  const total = ref(0)
  const isLoading = ref(false)

  async function loadRecords(options?: { limit?: number; offset?: number; method?: string }) {
    isLoading.value = true
    try {
      const result = await window.electronAPI.history.list(options)
      records.value = result
      total.value = result.length
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function getRecord(id: string) {
    return await window.electronAPI.history.get(id)
  }

  async function deleteRecord(id: string) {
    await window.electronAPI.history.delete(id)
    records.value = records.value.filter(r => r.id !== id)
  }

  async function updateRecord(id: string, updates: { question?: string; remark?: string }) {
    await window.electronAPI.history.update({ id, ...updates })
  }

  async function searchRecords(keyword: string) {
    isLoading.value = true
    try {
      const result = await window.electronAPI.history.search(keyword)
      records.value = result.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        method: r.method,
        originalHexagramId: r.originalHexagramId,
        changedHexagramId: null,
        movingYaoPositions: [],
        question: r.question
      }))
    } catch (e) {
      console.error('Failed to search history:', e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    records,
    total,
    isLoading,
    loadRecords,
    getRecord,
    deleteRecord,
    updateRecord,
    searchRecords
  }
})
