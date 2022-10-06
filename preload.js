'use strict'
// 引入模块
const { contextBridge, ipcRenderer } = require("electron")
let lang

// 载入
ipcRenderer.invoke('lang:get').then(data=>{
  lang = data
})
ipcRenderer.invoke('db:getWeeklyRecommend').then(item=>{
  ipcRenderer.invoke('layout:get', 'main', {recommendItem: item}).then(data=>{
    document.write(data)
    Init()
  })
})

// 问候欢迎
const greet = ()=>{
  let time = new Date()
  let hour = time.getHours()
  if (hour > 5 && hour < 12) {
    return lang.user.greet.morning[Math.floor(Math.random() * lang.user.greet.morning.length)]
  }else if(hour > 11 && hour < 16){
    return lang.user.greet.noon[Math.floor(Math.random() * lang.user.greet.noon.length)]
  }else if(hour > 15 && hour < 18){
    return lang.user.greet.afternoon[Math.floor(Math.random() * lang.user.greet.afternoon.length)]
  }else{
    return lang.user.greet.evening[Math.floor(Math.random() * lang.user.greet.evening.length)]
  }
}

// 初始化
const Init = ()=>{
  // 标题栏
  // 窗口控制
  ipcRenderer.on('window:size', (_,isMax)=>{
    document.querySelector('.window-control-resize i').className = isMax ? 'icon icon-chrome-restore' : 'icon icon-chrome-maxmize'
  })
  ipcRenderer.on('window:isFocus', (_,isFocus)=>{
    if (isFocus) {
      document.body.classList.remove('blur')
    }else{
      document.body.classList.add('blur')
    }
  })
  document.querySelector('.window-control-minimize').addEventListener('click',()=>{ipcRenderer.send('window:minimize')},false)
  document.querySelector('.window-control-resize').addEventListener('click',()=>{ipcRenderer.send('window:resize')},false)
  document.querySelector('.window-control-close').addEventListener('click',()=>{ipcRenderer.send('window:close')},false)
  // 用户控制
  document.querySelector('.user-action').addEventListener('click', ()=>{
    document.querySelector('.user-control').classList.toggle('open')
  })
  document.querySelector('.greet').innerHTML = greet()
  
  // 完成
  ipcRenderer.send('window:ready')
}

// 暗色模式
contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})