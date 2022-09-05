'use strict'
// 引入模块
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const pug = require('pug')
const build = 60

// 创建窗口
function createWindow () {
  // 初始化窗口
  // 主窗口
  const win = new BrowserWindow({
    // show: false,
    width: 3840,
    height: 2160,
    minWidth: 800,
    minHeight: 600,
    // frame: false,
    resizable: true,
    fullscreenable: false,
    title: '番剧管理器',
    // icon: "",
    enableLargerThanScreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 载入
  win.loadFile('index.html')

  // 通信
  // 主窗口
  ipcMain.on('window:minimize', ()=>{
    win.minimize()
  })
  ipcMain.on('window:resize', (event)=>{
    if (win.isMaximized()) {
      win.restore()
    } else {
      win.maximize()
    }
  })
  ipcMain.on('window:close', ()=>{
    parseWin.close()
    win.close()
    // app.quit()
  })
  ipcMain.on('window:size', ()=>{
    win.webContents.send('mainWin-max', win.isMaximized())
  })

  // 通用
  // 获取模板
  ipcMain.handle('i18n:get', (event)=>{})
  ipcMain.handle('layout:get', (event, path, option)=>{
    option = Object.assign({}, option)
    return pug.renderFile(('./src/layout/' + path), option)
  })
}

// 当程序就绪时
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 当所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
