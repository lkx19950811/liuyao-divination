import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AISettings, OllamaModel } from '@shared/types'
import { getDefaultAISettings } from '@shared/utils/ai'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const fontSize = ref<'small' | 'medium' | 'large'>('medium')
  const hexagramStyle = ref<'traditional' | 'modern'>('traditional')
  const autoSave = ref(true)
  const defaultMethod = ref<'time' | 'number' | 'coin' | 'manual'>('time')
  const isLoaded = ref(false)
  
  const aiSettings = ref<AISettings>(getDefaultAISettings())
  const ollamaConnected = ref(false)
  const availableModels = ref<OllamaModel[]>([])
  
  // 模型下载状态
  const modelPulling = ref(false)
  const modelPullProgress = ref(0)
  const modelPullOutput = ref('')
  let progressCallback: ((event: unknown, data: { progress?: number; output?: string }) => void) | null = null
  
  // Ollama 下载状态
  const ollamaDownloading = ref(false)
  const ollamaDownloadProgress = ref(0)
  const ollamaDownloadedFilePath = ref('')
  let downloadCallback: ((event: unknown, data: { progress: number; message?: string }) => void) | null = null

  const actualTheme = computed(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  })

  async function loadSettings() {
    if (isLoaded.value) return
    
    try {
      const settings = await window.electronAPI.settings.getAll()
      
      if (settings.theme) {
        theme.value = settings.theme as 'light' | 'dark' | 'system'
      }
      if (settings.fontSize) {
        fontSize.value = settings.fontSize as 'small' | 'medium' | 'large'
      }
      if (settings.hexagramStyle) {
        hexagramStyle.value = settings.hexagramStyle as 'traditional' | 'modern'
      }
      if (settings.autoSave !== undefined) {
        autoSave.value = settings.autoSave === 'true'
      }
      if (settings.defaultMethod) {
        defaultMethod.value = settings.defaultMethod as 'time' | 'number' | 'coin' | 'manual'
      }
      
      if (settings.aiEnabled !== undefined) {
        aiSettings.value.enabled = settings.aiEnabled === 'true'
      }
      if (settings.aiOllamaUrl) {
        aiSettings.value.ollamaUrl = settings.aiOllamaUrl
      }
      if (settings.aiModel) {
        aiSettings.value.model = settings.aiModel
      }
      if (settings.aiTemperature) {
        aiSettings.value.temperature = parseFloat(settings.aiTemperature)
      }
      if (settings.aiMaxTokens) {
        aiSettings.value.maxTokens = parseInt(settings.aiMaxTokens)
      }
      
      if (aiSettings.value.enabled) {
        await checkOllama()
      }
      
      isLoaded.value = true
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  async function saveSetting(key: string, value: string) {
    try {
      await window.electronAPI.settings.set(key, value)
    } catch (e) {
      console.error('Failed to save setting:', e)
      throw e
    }
  }

  async function setTheme(value: 'light' | 'dark' | 'system') {
    theme.value = value
    await saveSetting('theme', value)
    applyTheme()
  }

  async function setFontSize(value: 'small' | 'medium' | 'large') {
    fontSize.value = value
    await saveSetting('fontSize', value)
  }

  async function setHexagramStyle(value: 'traditional' | 'modern') {
    hexagramStyle.value = value
    await saveSetting('hexagramStyle', value)
  }

  async function setAutoSave(value: boolean) {
    autoSave.value = value
    await saveSetting('autoSave', String(value))
  }

  async function setDefaultMethod(value: 'time' | 'number' | 'coin' | 'manual') {
    defaultMethod.value = value
    await saveSetting('defaultMethod', value)
  }

  function applyTheme() {
    const isDark = actualTheme.value === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
  }

  async function checkOllama() {
    try {
      const result = await window.electronAPI.ai.checkOllama(aiSettings.value.ollamaUrl)
      ollamaConnected.value = result.connected
      availableModels.value = result.models || []
    } catch {
      ollamaConnected.value = false
      availableModels.value = []
    }
    return ollamaConnected.value
  }

  async function setAIEnabled(value: boolean) {
    aiSettings.value.enabled = value
    await saveSetting('aiEnabled', String(value))
    if (value) {
      await checkOllama()
    }
  }

  async function setAIOllamaUrl(value: string) {
    aiSettings.value.ollamaUrl = value
    await saveSetting('aiOllamaUrl', value)
    await checkOllama()
  }

  async function setAIModel(value: string) {
    aiSettings.value.model = value
    await saveSetting('aiModel', value)
  }

  async function setAITemperature(value: number) {
    aiSettings.value.temperature = value
    await saveSetting('aiTemperature', String(value))
  }

  async function setAIMaxTokens(value: number) {
    aiSettings.value.maxTokens = value
    await saveSetting('aiMaxTokens', String(value))
  }

  function setupProgressListener() {
    if (progressCallback) return
    
    progressCallback = (_event: unknown, data: { progress?: number; output?: string }) => {
      if (data.progress !== undefined) {
        modelPullProgress.value = data.progress
      }
      if (data.output) {
        modelPullOutput.value = data.output
      }
    }
    window.electronAPI.ai.onModelPullProgress(progressCallback)
  }

  function removeProgressListener() {
    if (progressCallback) {
      window.electronAPI.ai.removeModelPullProgressListener(progressCallback)
      progressCallback = null
    }
  }

  async function pullModel(modelName: string): Promise<{ success: boolean; message: string }> {
    const existingModel = availableModels.value.find(m => m.name === modelName)
    if (existingModel) {
      return { success: true, message: '该模型已安装' }
    }
    
    modelPulling.value = true
    modelPullProgress.value = 0
    modelPullOutput.value = '正在下载模型...'
    
    setupProgressListener()
    
    try {
      const result = await window.electronAPI.ai.pullModel(modelName)
      if (result.success) {
        modelPullProgress.value = 100
        await checkOllama()
      }
      return result
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '模型下载失败'
      return { success: false, message: errMsg }
    } finally {
      modelPulling.value = false
    }
  }

  function setupDownloadListener() {
    if (downloadCallback) return
    
    downloadCallback = (_event: unknown, data: { progress: number; message?: string }) => {
      ollamaDownloadProgress.value = data.progress
    }
    window.electronAPI.ai.onDownloadProgress(downloadCallback)
  }

  function removeDownloadListener() {
    if (downloadCallback) {
      window.electronAPI.ai.removeDownloadProgressListener(downloadCallback)
      downloadCallback = null
    }
  }

  async function downloadOllama(): Promise<{ success: boolean; message?: string; filePath?: string }> {
    ollamaDownloading.value = true
    ollamaDownloadProgress.value = 0
    ollamaDownloadedFilePath.value = ''
    
    setupDownloadListener()
    
    try {
      const result = await window.electronAPI.ai.downloadOllama(true)
      
      if (result.success && result.filePath) {
        ollamaDownloadedFilePath.value = result.filePath
      }
      return result
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '下载失败'
      return { success: false, message: errMsg }
    } finally {
      ollamaDownloading.value = false
    }
  }

  return {
    theme,
    fontSize,
    hexagramStyle,
    autoSave,
    defaultMethod,
    isLoaded,
    actualTheme,
    aiSettings,
    ollamaConnected,
    availableModels,
    modelPulling,
    modelPullProgress,
    modelPullOutput,
    ollamaDownloading,
    ollamaDownloadProgress,
    ollamaDownloadedFilePath,
    loadSettings,
    saveSetting,
    setTheme,
    setFontSize,
    setHexagramStyle,
    setAutoSave,
    setDefaultMethod,
    applyTheme,
    checkOllama,
    setAIEnabled,
    setAIOllamaUrl,
    setAIModel,
    setAITemperature,
    setAIMaxTokens,
    setupProgressListener,
    pullModel,
    setupDownloadListener,
    downloadOllama
  }
})
