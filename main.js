'use strict'
// 引入模块
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('path')
const pug = require('pug')
const store = require('electron-store')
const build = 62

// 设置
const settings = (()=>{
  let data = new store({
    name: 'settings',
    fileExtension: 'json',
    cwd: app.getPath('appData'),
    schema: {
      language: {
        type: 'string',
        default: app.getLocale(),
      }
    },
  })
  return{
    get:(key)=>{return data.get(key)},
    set:(key, value)=>{return data.set(key, value)},
  }
})()

// 语言
const locales = (()=>{
  let languageList = ['zh-CN']
  let defaultLanguage = 'zh-CN'
  let language

  const setLanguage = (languageName = settings.get('language'))=>{
    return (new store({
      name: languageList.findIndex(name => name == languageName) > -1 ? languageName : defaultLanguage,
      fileExtension: 'json',
      cwd: path.join(__dirname, 'src/locales/')
    })).store
  }

  language = setLanguage()

  return{
    get:(key)=>{
      if (key) {
        return setLanguage()
      }else{
        return language
      }
    },
    refresh:()=>{language = setLanguage()}
  }
})()

// 创建窗口
const createWindow = ()=>{
  // 初始化窗口
  // 主窗口
  const win = new BrowserWindow({
    show: false,
    width: 3840,
    height: 2160,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    resizable: true,
    fullscreenable: false,
    title: '番剧管理器',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#202020' : '#fff',
    // icon: "",
    enableLargerThanScreen: false,
    webPreferences: {
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  
  win.webContents.openDevTools()

  win.on('ready-to-show',()=>{
    win.maximize()
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
    win.close()
    // app.quit()
  })
  ipcMain.on('window:size', ()=>{
    win.webContents.send('window:isMaximized', win.isMaximized())
  })
  win.on('blur',()=>{
    win.webContents.send('window:isFocus', false)
  })
  win.on('focus',()=>{
    win.webContents.send('window:isFocus', true)
  })

  // 获取模板
  ipcMain.handle('layout:get', (event, path, option)=>{
    option = Object.assign({
      lang: locales.get()
    }, option)
    return pug.renderFile(('./src/layout/' + path + '.pug'), option)
  })

  // 暗色模式
  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })
  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })
  nativeTheme.addListener('updated', ()=>{
    win.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#202020' : '#fff')
  })

  // 语言
  ipcMain.handle('lang:get', () => {
    return locales.get()
  })
  ipcMain.handle('lang:refresh', () => {
    return locales.refresh()
  })

  // 设置
  ipcMain.handle('settings:get', (key) => {
    return settings.get(key)
  })
  ipcMain.handle('settings:set', (key, value) => {
    return settings.set(key,value)
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
