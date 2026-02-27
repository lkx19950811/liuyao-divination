import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { join } from 'path'
import fs from 'fs'
import type { YaoType, DivinationResult, Hexagram } from '../../shared/types'
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

export function registerIpcHandlers(): void {
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

  ipcMain.handle('history:update', async (_event, data: { id: string; question?: string; remark?: string }) => {
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
