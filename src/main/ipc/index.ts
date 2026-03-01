import { ipcMain, dialog, app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { exec, spawn, execSync } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
import type { YaoType, DivinationResult, Hexagram, AISettings } from '../../shared/types'
import {
  timeDivination,
  numberDivination,
  coinDivination,
  manualDivination,
  buildDivinationResult,
  buildHexagramFromTrigrams,
  getAllHexagrams,
  searchHexagrams,
  getNajia
} from '../../shared/utils/hexagram'
import {
  solarToLunar,
  getGanZhi,
  getLunarDateWithGanZhi
} from '../../shared/utils/calendar'
import {
  saveHistory,
  getHistoryList,
  getHistoryById,
  updateHistory,
  deleteHistory,
  searchHistory,
  getSetting,
  setSetting,
  getAllSettings
} from '../database'
import { getHexagramById } from '../../shared/data/hexagrams'

async function checkOllamaConnection(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch {
    return false
  }
}

// 检查 Ollama 是否已安装（Windows）
async function checkOllamaInstalled(): Promise<{ installed: boolean; version?: string; path?: string }> {
  try {
    const { stdout } = await execAsync('where ollama', { timeout: 5000 })
    const ollamaPath = stdout.trim().split('\n')[0]

    // 尝试获取版本
    try {
      const { stdout: versionOut } = await execAsync('ollama --version', { timeout: 5000 })
      const versionMatch = versionOut.match(/version[:\s]+([\d.]+)/i)
      return {
        installed: true,
        version: versionMatch ? versionMatch[1] : 'unknown',
        path: ollamaPath
      }
    } catch {
      return { installed: true, path: ollamaPath }
    }
  } catch {
    return { installed: false }
  }
}

// 检查 Ollama 服务是否在运行
async function checkOllamaRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq ollama.exe"', { timeout: 5000 })
    return stdout.toLowerCase().includes('ollama.exe')
  } catch {
    return false
  }
}

async function getAvailableModels(url: string): Promise<{name: string}[]> {
  try {
    const response = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.models || []
  } catch {
    return []
  }
}

function buildAIPrompt(
  question: string | null,
  originalHexagram: Hexagram,
  changedHexagram: Hexagram | null,
  movingYaoPositions: number[]
): string {
  const movingYaoText = movingYaoPositions.length > 0
    ? movingYaoPositions.map(p => `第${p + 1}爻`).join('、')
    : '无'

  const changedHexagramText = changedHexagram
    ? `${changedHexagram.name}（${changedHexagram.description || ''}）`
    : '无变卦'

  // 构建爻辞信息
  let yaociText = ''
  if (originalHexagram.yaoci && originalHexagram.yaoci.length > 0) {
    yaociText = '\n【爻辞】\n' + originalHexagram.yaoci.map(y => {
      const isMoving = movingYaoPositions.includes(y.position)
      return `${isMoving ? '【动爻】' : ''}第${y.position + 1}爻：${y.content}${y.interpretation ? `（${y.interpretation}）` : ''}`
    }).join('\n')
  }

  // 构建动爻爻辞
  let movingYaociText = ''
  if (movingYaoPositions.length > 0 && originalHexagram.yaoci) {
    const movingYaoCi = movingYaoPositions.map(pos => {
      const yao = originalHexagram.yaoci?.find(y => y.position === pos)
      return yao ? `第${pos + 1}爻：${yao.content}` : ''
    }).filter(Boolean).join('\n')
    if (movingYaoCi) {
      movingYaociText = `\n【动爻爻辞】\n${movingYaoCi}`
    }
  }

  // 构建纳甲六亲信息
  let najiaText = ''
  if (originalHexagram.najia && originalHexagram.najia.length > 0) {
    najiaText = '\n【纳甲六亲】\n' + originalHexagram.najia.map(n => {
      const isMoving = movingYaoPositions.includes(n.position)
      return `${isMoving ? '【动爻】' : ''}第${n.position + 1}爻：${n.tiangan}${n.dizhi}（${n.wuxing}）${n.liuqin ? ` - ${n.liuqin}` : ''}`
    }).join('\n')
  }

  // 五行属性
  const wuxingText = originalHexagram.wuxing ? `\n【五行属性】${originalHexagram.wuxing}` : ''
  
  // 宫位
  const palaceText = originalHexagram.palace ? `\n【所属宫】${originalHexagram.palace}` : ''

  return `你是一位精通六爻预测的易学大师，请根据以下卦象信息，为用户提供详细、具体的解读。

【用户问题】${question || '用户未提供具体问题，请给出一般性解读'}

【本卦】${originalHexagram.name}
【卦辞】${originalHexagram.guaci}
【彖辞】${originalHexagram.tuanci}
【象辞】${originalHexagram.xiangci}${wuxingText}${palaceText}${yaociText}${najiaText}${movingYaociText}

【变卦】${changedHexagramText}
【动爻位置】${movingYaoText}

请按以下结构进行详细解读：

一、卦象总览
- 解释本卦的基本含义和象征
- 如有变卦，说明本卦变变卦的含义变化
- 动爻对整体卦象的影响

二、针对问题分析
- 结合用户所问事项，分析卦象的吉凶趋势
- 动爻爻辞的具体启示
- 纳甲六亲与所问事项的关联（如财爻、官爻、父母爻等）

三、时间与方位提示
- 根据卦象五行，推断有利的时间（如季节、月份）
- 有利的方位提示

四、建议与注意事项
- 具体的行动建议
- 需要避免的事项
- 人际关系方面的提示

五、总结
- 核心结论（吉/凶/平）
- 关键要点提示

请用通俗易懂的白话文回答，避免过多专业术语，让普通人也能理解。回答要具体、有针对性，不要泛泛而谈。`
}

export function registerIpcHandlers(): void {
  // App info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  // Window controls
  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.minimize()
    return { success: true }
  })

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
    return { success: true }
  })

  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.close()
    return { success: true }
  })

  ipcMain.handle('window:isMaximized', () => {
    const win = BrowserWindow.getFocusedWindow()
    return win?.isMaximized() ?? false
  })

  ipcMain.handle('divination:time', async (_event, data: { 
    year: number
    month: number
    day: number
    hour: number
    question?: string
  }) => {
    const { year, month, day, hour, question } = data
    
    const { upperTrigram, lowerTrigram, movingYao } = timeDivination(year, month, day, hour)
    const originalHexagram = buildHexagramFromTrigrams(upperTrigram, lowerTrigram)
    
    if (!originalHexagram) {
      throw new Error('无法生成卦象')
    }
    
    const movingYaoPositions = [movingYao]
    const { lunar, ganZhi } = getLunarDateWithGanZhi(year, month, day, hour)
    
    const result = buildDivinationResult('time', originalHexagram, movingYaoPositions, {
      question: question ?? undefined,
      timeInfo: { year, month, day, hour, useLunar: false },
      lunarDate: lunar,
      ganZhi
    })
    
    return result
  })

  ipcMain.handle('divination:number', async (_event, data: {
    num1: number
    num2: number
    question?: string
  }) => {
    const { num1, num2, question } = data
    
    const { upperTrigram, lowerTrigram, movingYao } = numberDivination(num1, num2)
    const originalHexagram = buildHexagramFromTrigrams(upperTrigram, lowerTrigram)
    
    if (!originalHexagram) {
      throw new Error('无法生成卦象')
    }
    
    const movingYaoPositions = [movingYao]
    
    const result = buildDivinationResult('number', originalHexagram, movingYaoPositions, {
      question: question ?? undefined,
      inputNumbers: [num1, num2]
    })
    
    return result
  })

  ipcMain.handle('divination:coin', async (_event, data: { question?: string }) => {
    const { question } = data
    
    const { yaos, coinResults } = coinDivination()
    const originalHexagram = buildHexagramFromTrigrams(
      yaosToTrigramName(yaos.slice(3, 6)),
      yaosToTrigramName(yaos.slice(0, 3))
    )
    
    if (!originalHexagram) {
      throw new Error('无法生成卦象')
    }
    
    const movingYaoPositions = yaos.filter(y => y.isMoving).map(y => y.position)
    
    const result = buildDivinationResult('coin', originalHexagram, movingYaoPositions, {
      question: question ?? undefined,
      coinResults
    })
    
    return result
  })

  ipcMain.handle('divination:manual', async (_event, data: {
    yaoTypes: YaoType[]
    question?: string
  }) => {
    const { yaoTypes, question } = data
    
    const yaos = manualDivination(yaoTypes)
    const originalHexagram = buildHexagramFromTrigrams(
      yaosToTrigramName(yaos.slice(3, 6)),
      yaosToTrigramName(yaos.slice(0, 3))
    )
    
    if (!originalHexagram) {
      throw new Error('无法生成卦象')
    }
    
    const movingYaoPositions = yaos.filter(y => y.isMoving).map(y => y.position)
    
    const result = buildDivinationResult('manual', originalHexagram, movingYaoPositions, {
      question: question ?? undefined
    })
    
    return result
  })

  ipcMain.handle('history:list', async (_event, data?: {
    limit?: number
    offset?: number
    method?: string
  }) => {
    return getHistoryList(data)
  })

  ipcMain.handle('history:get', async (_event, id: string) => {
    return getHistoryById(id)
  })

  ipcMain.handle('history:save', async (_event, data: DivinationResult) => {
    saveHistory({
      id: data.id,
      createdAt: data.createdAt.toISOString(),
      method: data.method,
      originalHexagramId: data.originalHexagram.id,
      changedHexagramId: data.changedHexagram?.id ?? null,
      movingYaoPositions: data.movingYaoPositions,
      question: data.question,
      remark: data.remark,
      coinResults: data.coinResults ? JSON.stringify(data.coinResults) : null,
      inputNumbers: data.inputNumbers ? JSON.stringify(data.inputNumbers) : null,
      timeInfo: data.timeInfo ? JSON.stringify(data.timeInfo) : null,
      lunarDate: data.lunarDate ? JSON.stringify(data.lunarDate) : null,
      ganZhi: data.ganZhi ? JSON.stringify(data.ganZhi) : null
    })
    return { success: true }
  })

  ipcMain.handle('history:update', async (_event, data: { id: string; question?: string; remark?: string; aiInterpretation?: string }) => {
    updateHistory(data.id, data)
    return { success: true }
  })

  ipcMain.handle('history:delete', async (_event, id: string) => {
    deleteHistory(id)
    return { success: true }
  })

  ipcMain.handle('history:search', async (_event, keyword: string) => {
    return searchHistory(keyword)
  })

  ipcMain.handle('hexagram:getAll', async () => {
    return getAllHexagrams()
  })

  ipcMain.handle('hexagram:search', async (_event, keyword: string) => {
    return searchHexagrams(keyword)
  })

  ipcMain.handle('settings:get', async (_event, key: string) => {
    return getSetting(key)
  })

  ipcMain.handle('settings:getAll', async () => {
    return getAllSettings()
  })

  ipcMain.handle('settings:set', async (_event, data: { key: string; value: string }) => {
    setSetting(data.key, data.value)
    return { success: true }
  })

  ipcMain.handle('calendar:toLunar', async (_event, data: { year: number; month: number; day: number }) => {
    return solarToLunar(data.year, data.month, data.day)
  })

  ipcMain.handle('calendar:getGanZhi', async (_event, data: { year: number; month: number; day: number; hour: number }) => {
    return getGanZhi(data.year, data.month, data.day, data.hour)
  })

  ipcMain.handle('hexagram:get', async (_event, id: number) => {
    const hexagram = getHexagramById(id)
    if (!hexagram) {
      throw new Error('卦象不存在')
    }

    // 获取纳甲信息
    const najia = getNajia(hexagram)

    // 获取爻辞信息
    const yaoci = []
    for (let i = 1; i <= 6; i++) {
      yaoci.push({
        position: i,
        content: getYaoContent(hexagram, i),
        interpretation: null,
        xiaoxiang: null
      })
    }

    return {
      ...hexagram,
      najia,
      yaoci
    }
  })

  ipcMain.handle('settings:reset', async () => {
    const defaultSettings = [
      { key: 'theme', value: 'system' },
      { key: 'fontSize', value: 'medium' },
      { key: 'hexagramStyle', value: 'traditional' },
      { key: 'autoSave', value: 'true' },
      { key: 'defaultMethod', value: 'time' }
    ]

    for (const setting of defaultSettings) {
      setSetting(setting.key, setting.value)
    }

    return { success: true }
  })

  ipcMain.handle('export:txt', async (_event, data: { historyId: string }) => {
    const historyRecord = getHistoryById(data.historyId)
    if (!historyRecord) {
      throw new Error('历史记录不存在')
    }

    const originalHexagram = getHexagramById(historyRecord.originalHexagramId)
    const changedHexagram = historyRecord.changedHexagramId
      ? getHexagramById(historyRecord.changedHexagramId)
      : null

    let content = `六爻预测记录\n`
    content += `${'='.repeat(40)}\n\n`

    content += `起卦时间: ${historyRecord.createdAt}\n`
    content += `起卦方式: ${historyRecord.method}\n\n`

    if (originalHexagram) {
      content += `本卦: ${originalHexagram.name}\n`
      content += `卦辞: ${originalHexagram.guaci}\n`
      content += `彖辞: ${originalHexagram.tuanci}\n`
      content += `象辞: ${originalHexagram.xiangci}\n\n`

      if (historyRecord.lunarDate) {
        const lunar = JSON.parse(historyRecord.lunarDate)
        content += `农历: ${lunar.year}年${lunar.month}月${lunar.day}日\n`
      }

      if (historyRecord.ganZhi) {
        const ganZhi = JSON.parse(historyRecord.ganZhi)
        content += `干支: ${ganZhi.fullString}\n`
      }

      if (historyRecord.movingYaoPositions && historyRecord.movingYaoPositions.length > 0) {
        content += `动爻: ${historyRecord.movingYaoPositions.join(', ')}\n`
      }

      content += '\n'

      if (changedHexagram) {
        content += `变卦: ${changedHexagram.name}\n`
        content += `卦辞: ${changedHexagram.guaci}\n\n`
      }

      if (historyRecord.question) {
        content += `预测问题: ${historyRecord.question}\n\n`
      }

      if (historyRecord.remark) {
        content += `备注: ${historyRecord.remark}\n`
      }
    }

    const { filePath } = await dialog.showSaveDialog({
      title: '导出为TXT',
      defaultPath: `六爻预测_${historyRecord.id}.txt`,
      filters: [
        { name: 'Text Files', extensions: ['txt'] }
      ]
    })

    if (filePath) {
      fs.writeFileSync(filePath, content, 'utf-8')
      return { success: true, filePath }
    }

    return { success: false }
  })

  ipcMain.handle('export:json', async (_event, data: { includeSettings?: boolean }) => {
    const history = getHistoryList({ limit: 10000 })
    const settings = data.includeSettings ? getAllSettings() : {}

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      history
    }

    const { filePath } = await dialog.showSaveDialog({
      title: '导出为JSON',
      defaultPath: `六爻预测备份_${Date.now()}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    })

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8')
      return { success: true, filePath, recordCount: history.length }
    }

    return { success: false }
  })

  ipcMain.handle('export:pdf', async (_event, data: { historyId: string }) => {
    // PDF导出功能需要额外的库，这里先实现基本的文本保存
    // 实际项目中可以使用pdfkit或html-pdf等库
    const historyRecord = getHistoryById(data.historyId)
    if (!historyRecord) {
      throw new Error('历史记录不存在')
    }

    // 暂时导出为TXT，后续可添加PDF支持
    const { filePath } = await dialog.showSaveDialog({
      title: '导出为PDF（暂时为TXT）',
      defaultPath: `六爻预测_${historyRecord.id}.txt`,
      filters: [
        { name: 'Text Files', extensions: ['txt'] }
      ]
    })

    if (filePath) {
      const content = `六爻预测记录\n${'='.repeat(40)}\n\n起卦时间: ${historyRecord.createdAt}\n起卦方式: ${historyRecord.method}\n`
      fs.writeFileSync(filePath, content, 'utf-8')
      return { success: true, filePath }
    }

    return { success: false }
  })

  ipcMain.handle('database:backup', async () => {
    const dbPath = join(app.getPath('userData'), 'liuyao.db')

    const { filePath } = await dialog.showSaveDialog({
      title: '备份数据库',
      defaultPath: `liuyao_backup_${Date.now()}.db`,
      filters: [
        { name: 'Database Files', extensions: ['db'] }
      ]
    })

    if (filePath) {
      fs.copyFileSync(dbPath, filePath)
      return { success: true, filePath }
    }

    return { success: false }
  })

  ipcMain.handle('database:restore', async (_event, data: { backupPath: string }) => {
    const dbPath = join(app.getPath('userData'), 'liuyao.db')

    if (!fs.existsSync(data.backupPath)) {
      throw new Error('备份文件不存在')
    }

    const { response } = await dialog.showMessageBox({
      type: 'warning',
      title: '确认恢复',
      message: '恢复数据库将覆盖当前所有数据，此操作不可撤销。是否继续？',
      buttons: ['取消', '确定'],
      defaultId: 0
    })

    if (response === 1) {
      fs.copyFileSync(data.backupPath, dbPath)
      return { success: true }
    }

    return { success: false }
  })

  ipcMain.handle('ai:checkOllama', async (_event, url: string) => {
    const connected = await checkOllamaConnection(url)
    if (connected) {
      const models = await getAvailableModels(url)
      return { connected: true, models }
    }
    return { connected: false, models: [] }
  })

  // 检查 Ollama 安装状态
  ipcMain.handle('ai:checkOllamaInstalled', async () => {
    const installStatus = await checkOllamaInstalled()
    const running = await checkOllamaRunning()
    return { ...installStatus, running }
  })

  // 启动 Ollama 服务
  ipcMain.handle('ai:startOllama', async () => {
    try {
      // 检查是否已在运行
      const running = await checkOllamaRunning()
      if (running) {
        return { success: true, message: 'Ollama 服务已在运行' }
      }

      // 后台启动 ollama serve
      spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      }).unref()

      // 等待服务启动
      await new Promise(resolve => setTimeout(resolve, 2000))

      const nowRunning = await checkOllamaRunning()
      return {
        success: nowRunning,
        message: nowRunning ? 'Ollama 服务已启动' : '启动服务失败，请手动运行 ollama serve'
      }
    } catch (error) {
      return { success: false, message: `启动失败: ${error}` }
    }
  })

  // 停止 Ollama 服务
  ipcMain.handle('ai:stopOllama', async () => {
    try {
      // 检查是否在运行
      const running = await checkOllamaRunning()
      if (!running) {
        return { success: true, message: 'Ollama 服务未运行' }
      }

      // 终止 ollama 进程
      execSync('taskkill /F /IM ollama.exe', { encoding: 'utf-8' })

      // 等待进程终止
      await new Promise(resolve => setTimeout(resolve, 1000))

      const nowRunning = await checkOllamaRunning()
      return {
        success: !nowRunning,
        message: nowRunning ? '停止服务失败' : 'Ollama 服务已停止'
      }
    } catch (error) {
      return { success: false, message: `停止失败: ${error}` }
    }
  })

  // 流式生成 AI 解读
  ipcMain.handle('ai:generateStream', async (event, data: {
    settings: AISettings
    question: string | null
    originalHexagram: Hexagram
    changedHexagram: Hexagram | null
    movingYaoPositions: number[]
  }) => {
    const { settings, question, originalHexagram, changedHexagram, movingYaoPositions } = data

    // 验证必要参数
    if (!settings.model) {
      throw new Error('未选择AI模型，请前往设置选择模型')
    }

    if (!settings.ollamaUrl) {
      throw new Error('未配置Ollama服务地址')
    }

    const prompt = buildAIPrompt(question, originalHexagram, changedHexagram, movingYaoPositions)
    console.log('[AI] Starting stream generation with model:', settings.model)

    try {
      const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: settings.model,
          prompt,
          stream: true,
          options: {
            temperature: settings.temperature,
            num_predict: settings.maxTokens
          }
        }),
        signal: AbortSignal.timeout(180000) // 3分钟超时
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AI] Ollama response error:', response.status, errorText)
        throw new Error(`Ollama请求失败(${response.status}): ${errorText || '请检查模型是否正确'}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          event.sender.send('ai:generateEnd')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.response) {
              event.sender.send('ai:generateChunk', json.response)
            }
            if (json.done) {
              event.sender.send('ai:generateEnd')
            }
          } catch {
            // Ignore parse errors for incomplete JSON
          }
        }
      }

      console.log('[AI] Stream generation complete')
      return { success: true }
    } catch (error) {
      console.error('[AI] Stream generation failed:', error)
      event.sender.send('ai:generateError', error instanceof Error ? error.message : '未知错误')
      if (error instanceof Error) {
        throw error
      }
      throw new Error('AI生成失败，请检查Ollama服务是否正常运行')
    }
  })

  ipcMain.handle('ai:generate', async (_event, data: {
    settings: AISettings
    question: string | null
    originalHexagram: Hexagram
    changedHexagram: Hexagram | null
    movingYaoPositions: number[]
  }) => {
    const { settings, question, originalHexagram, changedHexagram, movingYaoPositions } = data

    // 验证必要参数
    if (!settings.model) {
      throw new Error('未选择AI模型，请前往设置选择模型')
    }

    if (!settings.ollamaUrl) {
      throw new Error('未配置Ollama服务地址')
    }

    const prompt = buildAIPrompt(question, originalHexagram, changedHexagram, movingYaoPositions)
    console.log('[AI] Generating interpretation with model:', settings.model)

    try {
      const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: settings.model,
          prompt,
          stream: false,
          options: {
            temperature: settings.temperature,
            num_predict: settings.maxTokens
          }
        }),
        signal: AbortSignal.timeout(120000)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AI] Ollama response error:', response.status, errorText)
        throw new Error(`Ollama请求失败(${response.status}): ${errorText || '请检查模型是否正确'}`)
      }

      const result = await response.json()
      console.log('[AI] Generation complete')
      return result.response
    } catch (error) {
      console.error('[AI] Generation failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('AI生成失败，请检查Ollama服务是否正常运行')
    }
  })

  ipcMain.handle('ai:downloadOllama', async (event, useMirror: boolean) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender)

    // 国内镜像源 - 使用最新版本
    const mirrors = [
      'https://gh-proxy.com/https://github.com/ollama/ollama/releases/download/v0.17.4/OllamaSetup.exe'
    ]

    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow!, {
      title: '保存Ollama安装程序',
      defaultPath: 'OllamaSetup.exe',
      filters: [
        { name: '可执行文件', extensions: ['exe'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (canceled || !filePath) {
      return { success: false, message: '用户取消下载' }
    }

    // 选择下载源 - 官方也使用具体版本
    const downloadUrls = useMirror ? mirrors : ['https://github.com/ollama/ollama/releases/download/v0.17.4/OllamaSetup.exe']

    return new Promise((resolve) => {
      let currentIndex = 0

      function tryDownload() {
        if (currentIndex >= downloadUrls.length) {
          resolve({ success: false, message: '所有下载源均失败，请检查网络或手动下载' })
          return
        }

        const downloadUrl = downloadUrls[currentIndex]
        const protocol = downloadUrl.startsWith('https') ? https : http

        event.sender.send('ai:downloadProgress', {
          progress: 0,
          downloadedSize: 0,
          totalSize: 0,
          source: currentIndex + 1,
          totalSources: downloadUrls.length
        })

        const request = protocol.get(downloadUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }, (response) => {
          // 处理重定向
          if (response.statusCode === 302 || response.statusCode === 301) {
            const redirectUrl = response.headers.location
            if (redirectUrl) {
              const redirectProtocol = redirectUrl.startsWith('https') ? https : http
              redirectProtocol.get(redirectUrl, {
                timeout: 30000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
              }, handleResponse).on('error', handleError)
              return
            }
          }
          handleResponse(response)
        })

        function handleResponse(response: any) {
          if (response.statusCode !== 200) {
            currentIndex++
            tryDownload()
            return
          }

          const totalSize = parseInt(response.headers['content-length'] || '0', 10)
          let downloadedSize = 0

          const fileStream = fs.createWriteStream(filePath)

          response.on('data', (chunk: Buffer) => {
            downloadedSize += chunk.length
            const progress = totalSize > 0 ? Math.round((downloadedSize / totalSize) * 100) : 0
            event.sender.send('ai:downloadProgress', { progress, downloadedSize, totalSize })
          })

          response.pipe(fileStream)

          fileStream.on('finish', () => {
            fileStream.close()
            resolve({ success: true, filePath, message: '下载完成' })
          })

          fileStream.on('error', (err) => {
            fs.unlink(filePath, () => {})
            resolve({ success: false, message: `保存失败: ${err.message}` })
          })
        }

        function handleError(err: Error) {
          console.error(`下载源 ${currentIndex + 1} 失败:`, err.message)
          currentIndex++
          if (currentIndex < downloadUrls.length) {
            event.sender.send('ai:downloadProgress', {
              progress: 0,
              message: `切换到备用下载源...`
            })
          }
          tryDownload()
        }

        request.on('error', handleError)
        request.setTimeout(60000, () => {
          request.destroy()
          currentIndex++
          tryDownload()
        })
      }

      tryDownload()
    })
  })

  // 静默安装 Ollama
  ipcMain.handle('ai:installOllama', async (_event, installerPath: string) => {
    try {
      if (!fs.existsSync(installerPath)) {
        return { success: false, message: '安装程序不存在' }
      }

      // 静默安装命令
      const { stdout, stderr } = await execAsync(`"${installerPath}" /S`, {
        timeout: 300000 // 5分钟超时
      })

      // 安装后刷新环境变量
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 检查安装是否成功
      const installStatus = await checkOllamaInstalled()

      return {
        success: installStatus.installed,
        message: installStatus.installed ? '安装成功' : `安装可能失败: ${stderr || stdout}`,
        path: installStatus.path
      }
    } catch (error) {
      return { success: false, message: `安装失败: ${error}` }
    }
  })

  // 打开下载页面
  ipcMain.handle('ai:openDownloadPage', async (_event, useMirror: boolean) => {
    const url = useMirror
      ? 'https://github.com/ollama/ollama/releases'
      : 'https://ollama.com/download/windows'
    await shell.openExternal(url)
    return { success: true }
  })

  // 拉取模型（带进度）
  ipcMain.handle('ai:pullModel', async (event, modelName: string) => {
    return new Promise((resolve) => {
      const pullProcess = spawn('ollama', ['pull', modelName], {
        windowsHide: true
      })

      let outputBuffer = ''
      let totalBytes = 0
      let completedBytes = 0

      const stripAnsi = (str: string): string => {
        return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
          .replace(/\x1b\][^\x07]*\x07/g, '')
          .replace(/\[\?[0-9;]*[a-zA-Z]/g, '')
          .replace(/\[\?[0-9]*h/g, '')
          .replace(/\[\?[0-9]*l/g, '')
          .replace(/\[K/g, '')
          .replace(/\[A/g, '')
          .replace(/\[1G/g, '')
          .replace(/\[\?25[hl]/g, '')
          .replace(/\[\?2026[hl]/g, '')
          .replace(/\x1b\][^\n]*/g, '')
      }

      const sendProgress = (output: string, progress?: number) => {
        const cleanOutput = stripAnsi(output).trim()
        if (cleanOutput) {
          event.sender.send('ai:modelPullProgress', { 
            output: cleanOutput, 
            progress: progress !== undefined ? progress : (totalBytes > 0 ? Math.round((completedBytes / totalBytes) * 100) : 0),
            type: 'progress' 
          })
        }
      }

      pullProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString()
        outputBuffer += output
        
        const lines = output.split('\n').filter(line => line.trim())
        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.status) {
              const statusMsg = json.status
              
              if (json.total && json.completed) {
                totalBytes = json.total
                completedBytes = json.completed
                const percent = Math.round((completedBytes / totalBytes) * 100)
                sendProgress(`${statusMsg}: ${percent}%`, percent)
              } else {
                sendProgress(statusMsg)
              }
            }
          } catch {
            const cleanLine = stripAnsi(line).trim()
            if (!cleanLine) continue
            
            const progressMatch = cleanLine.match(/(\d+)%/)
            if (progressMatch) {
              const progress = parseInt(progressMatch[1])
              sendProgress(cleanLine, progress)
            } else {
              sendProgress(cleanLine)
            }
          }
        }
      })

      pullProcess.stderr.on('data', (data: Buffer) => {
        const output = stripAnsi(data.toString()).trim()
        outputBuffer += output
        if (output) {
          event.sender.send('ai:modelPullProgress', { output, type: 'stderr' })
        }
      })

      pullProcess.on('close', (code: number) => {
        if (code === 0) {
          if (outputBuffer.includes('success')) {
            resolve({ success: true, message: '模型下载完成' })
          } else if (outputBuffer.includes('already exist') || outputBuffer.includes('up to date')) {
            resolve({ success: true, message: '模型已是最新版本' })
          } else {
            resolve({ success: true, message: '模型下载完成' })
          }
        } else {
          const errorMsg = outputBuffer.includes('error') 
            ? outputBuffer.split('error')[1]?.slice(0, 100) || `下载失败，退出码: ${code}`
            : `下载失败，退出码: ${code}`
          resolve({ success: false, message: errorMsg.trim() })
        }
      })

      pullProcess.on('error', (err: Error) => {
        resolve({ success: false, message: `下载失败: ${err.message}` })
      })
    })
  })
}

function yaosToTrigramName(yaos: { type: YaoType }[]): string {
  const binary = yaos.map(y => (y.type === 'yang' || y.type === 'oldYang') ? '1' : '0').join('')
  const trigramMap: Record<string, string> = {
    '111': '乾',
    '011': '兑',
    '101': '离',
    '001': '震',
    '110': '巽',
    '010': '坎',
    '100': '艮',
    '000': '坤'
  }
  return trigramMap[binary] || '坤'
}

function getYaoContent(hexagram: Hexagram, position: number): string {
  const yaociData: Record<string, string[]> = {
    '乾': ['初九：潜龙勿用。', '九二：见龙在田，利见大人。', '九三：君子终日乾乾，夕惕若，厉无咎。', '九四：或跃在渊，无咎。', '九五：飞龙在天，利见大人。', '上九：亢龙有悔。'],
    '坤': ['初六：履霜，坚冰至。', '六二：直方大，不习无不利。', '六三：含章可贞。或从王事，无成有终。', '六四：括囊，无咎无誉。', '六五：黄裳元吉。', '上六：龙战于野，其血玄黄。'],
    '屯': ['初九：磐桓，利居贞，利建侯。', '六二：屯邅邅，乘马班如。匪寇婚媾，女子贞不字。', '六三：即鹿无虞，惟入于林中。君子几不如舍，往吝。', '六四：乘马班如，求婚媾，往吉，无不利。', '九五：屯其膏。小贞吉，大贞凶。', '上六：乘马班如，泣血涟如。'],
    '蒙': ['初六：发蒙，利用刑人，用说桎梏，以往吝。', '九二：包蒙吉，纳妇吉，子克家。', '六三：勿用取女，见金夫，不有躬，无攸利。', '六四：困蒙，吝。', '六五：童蒙，吉。', '上九：击蒙，不利为寇，利御寇。'],
    // 其他卦的爻辞可以按需添加
  }

  if (yaociData[hexagram.name] && yaociData[hexagram.name][position - 1]) {
    return yaociData[hexagram.name][position - 1]
  }

  return `${hexagram.name}第${position}爻`
}
