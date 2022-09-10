'use strict'
// 引入模块
const { ipcRenderer } = require("electron")

// 载入
ipcRenderer.on('layout',(_, data)=>{
  document.documentElement.innerHTML = data
})

// 启动信息
ipcRenderer.on('info',(_, data)=>{
  document.querySelector('.startup-info').innerText = data
})