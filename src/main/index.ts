import { app, BrowserWindow, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { initDatabase } from './database'
import { registerIpcHandlers } from './ipc'

let mainWindow: BrowserWindow | null = null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createMenu(): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建起卦',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-divination')
          }
        },
        { type: 'separator' },
        {
          label: '导出数据',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('menu-export')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          role: 'quit'
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于六爻预测',
          click: () => {
            mainWindow?.webContents.send('menu-about')
          }
        },
        { type: 'separator' },
        {
          label: '使用帮助',
          accelerator: 'F1',
          click: () => {
            mainWindow?.webContents.send('menu-help')
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}

function getIcon(): Electron.NativeImage | undefined {
  const iconPath = join(__dirname, '../../build/icon.ico')
  try {
    return nativeImage.createFromPath(iconPath)
  } catch {
    return undefined
  }
}

function createWindow() {
  const icon = getIcon()
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: '六爻预测',
    show: false,
    backgroundColor: '#f5f5f5',
    icon: icon,
    autoHideMenuBar: false,
    trafficLightPosition: { x: 15, y: 15 }
  })

  Menu.setApplicationMenu(createMenu())

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized', false)
  })

  mainWindow.on('minimize', () => {
    mainWindow?.webContents.send('window-minimized')
  })

  mainWindow.on('restore', () => {
    mainWindow?.webContents.send('window-restored')
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const dbPath = join(app.getPath('userData'), 'liuyao.db')
  initDatabase(dbPath)
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
})
