'use strict'
// 引入模块
const { contextBridge, ipcRenderer } = require("electron")

// 载入
ipcRenderer.invoke('layout:get', 'main').then(data=>{
  document.documentElement.innerHTML = data
  Init()
})
ipcRenderer.invoke('lang:get').then(lang=>{
  document.documentElement.lang = lang.current
})

// 初始化
const Init = ()=>{
  document.querySelector('.window-control-minimize').addEventListener('click',()=>{ipcRenderer.send('window:minimize')},false)
  document.querySelector('.window-control-resize').addEventListener('click',()=>{ipcRenderer.send('window:resize')},false)
  document.querySelector('.window-control-close').addEventListener('click',()=>{ipcRenderer.send('window:close')},false)

  ipcRenderer.send('window:ready')
}

// 暗色模式
contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})