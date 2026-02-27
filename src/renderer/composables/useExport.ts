import { ref } from 'vue'

export function useExport() {
  const isExporting = ref(false)
  const exportError = ref<string | null>(null)

  async function exportToTxt(historyId: string) {
    isExporting.value = true
    exportError.value = null

    try {
      const result = await window.electronAPI.export.txt(historyId)
      if (result.success) {
        return { success: true, filePath: result.filePath }
      }
      return { success: false }
    } catch (e) {
      exportError.value = e instanceof Error ? e.message : '导出失败'
      return { success: false, error: exportError.value }
    } finally {
      isExporting.value = false
    }
  }

  async function exportToPdf(historyId: string) {
    isExporting.value = true
    exportError.value = null

    try {
      const result = await window.electronAPI.export.pdf(historyId)
      if (result.success) {
        return { success: true, filePath: result.filePath }
      }
      return { success: false }
    } catch (e) {
      exportError.value = e instanceof Error ? e.message : '导出失败'
      return { success: false, error: exportError.value }
    } finally {
      isExporting.value = false
    }
  }

  async function exportToJson(includeSettings = true) {
    isExporting.value = true
    exportError.value = null

    try {
      const result = await window.electronAPI.export.json(includeSettings)
      if (result.success) {
        return { success: true, filePath: result.filePath, recordCount: result.recordCount }
      }
      return { success: false }
    } catch (e) {
      exportError.value = e instanceof Error ? e.message : '导出失败'
      return { success: false, error: exportError.value }
    } finally {
      isExporting.value = false
    }
  }

  async function backupDatabase() {
    isExporting.value = true
    exportError.value = null

    try {
      const result = await window.electronAPI.database.backup()
      if (result.success) {
        return { success: true, filePath: result.filePath }
      }
      return { success: false }
    } catch (e) {
      exportError.value = e instanceof Error ? e.message : '备份失败'
      return { success: false, error: exportError.value }
    } finally {
      isExporting.value = false
    }
  }

  async function restoreDatabase(backupPath: string) {
    isExporting.value = true
    exportError.value = null

    try {
      const result = await window.electronAPI.database.restore(backupPath)
      return { success: result.success }
    } catch (e) {
      exportError.value = e instanceof Error ? e.message : '恢复失败'
      return { success: false, error: exportError.value }
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    exportError,
    exportToTxt,
    exportToPdf,
    exportToJson,
    backupDatabase,
    restoreDatabase
  }
}
