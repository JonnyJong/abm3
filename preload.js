'use strict'

// 引入模块
const { contextBridge, ipcRenderer } = require("electron")
let lang

// 载入
ipcRenderer.invoke('lang:get').then(data=>{
  lang = data
})
ipcRenderer.invoke('db:getWeeklyRecommend').then(item=>{
  ipcRenderer.invoke('layout:get', 'main', {recommendItem: item}).then(data=>document.write(data))
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
const init = ()=>{
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
  // 搜索框
  window.addEventListener('keyup',(ev)=>{
    if (ev.key === '/' && !document.querySelector(':focus')) {
      document.querySelector('#searchbar').focus()
    }
  })
  // 自动刷新
  ipcRenderer.on('db:img-ready',()=>{
    console.log('done')
  })
  
  // 完成
  ipcRenderer.send('window:ready')
}

// 暗色模式
contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
})
// 初始化
contextBridge.exposeInMainWorld('init', init)
// 项目页
contextBridge.exposeInMainWorld('pageItemScroll',(ev)=>{
  ev.target.querySelector('.page-item-header').style.setProperty('--top', ev.scrollTop + 'px')
})
// 打开外部链接
contextBridge.exposeInMainWorld('openUrl', (url)=>{
  ipcRenderer.send('open:url', url)
})
// TEST
contextBridge.exposeInMainWorld('add',(data)=>{
  ipcRenderer.invoke('db:addItem', data).then(d=>console.log(d))
})