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

// 历史记录
const history = (()=>{
  let history = [{page: 'home'}]
  let lock = false
  const back = ()=>{
    if (lock) return false
    if (history.length > 1) {
      lock = true
      history.pop()
      if (history[history.length - 1].page === 'item') {
        openItem(history[history.length - 1].option)
      }else{
        pageAnima()
      }
      setNavbar()
    }
  }
  const home = ()=>{
    if (lock) return false
    lock = true
    history = [{page: 'home'}]
    pageAnima()
    setNavbar()
  }
  const open = (page, option, el)=>{
    if (lock || !document.querySelector(`.page-${page}`)) return false
    lock = true
    history.push({page, option})
    setNavbar()
    if (page === 'item' && el && typeof el === 'object' && el instanceof HTMLElement) {
      openItem(option, el)
    }else{
      pageAnima()
    }
  }
  const openItem = (id, el)=>{
    ipcRenderer.invoke('db:getItemById', id).then(item=>{
      ipcRenderer.invoke('layout:get', 'includes/page-item', {item}).then(data=>{
        document.querySelector('.page-item').innerHTML = data
        if (el && typeof el === 'object' && el instanceof HTMLElement) {
          let from = el.querySelector('img').getBoundingClientRect()
          let to = document.querySelector('.page-item .page-item-info .cover img').getBoundingClientRect()
          let img = el.querySelector('img').cloneNode()
          img.className = 'page-item-cover-anima'
          img.style.top = from.top + 'px'
          img.style.left = from.left + 'px'
          img.style.height = from.height + 'px'
          img.style.width = from.width + 'px'
          img.style.opacity = 0
          document.body.appendChild(img)
          setTimeout(() => {
            document.querySelector('.page-current').classList.add('page-hidding')
            document.querySelector('.page-current').classList.remove('page-current')
            img.style.opacity = 1
          }, 10)
          setTimeout(()=>{
            document.querySelector('.page-hidding').classList.remove('page-hidding')
            img.style.top = to.top + document.querySelector('.page-item').scrollTop + 'px'
            img.style.left = to.left + 'px'
            img.style.height = to.height + 'px'
            img.style.width = to.width + 'px'
          }, 110)
          setTimeout(() => {
            document.querySelector('.page-item').scrollTop = 0
            document.querySelector('.page-item').classList.add('page-current')
            img.style.top = document.querySelector('.page-item-header').offsetHeight - 100 + 'px'
            img.style.transition = '.1s top linear, .1s opacity linear'
          }, 310)
          setTimeout(() => {
            img.style.opacity = 0
          }, 410)
          setTimeout(() => {
            img.remove()
            lock = false
          }, 470)
        }else{
          pageAnima()
        }
      })
    })
  }
  const pageAnima = ()=>{
    document.querySelector('.page-current').classList.add('page-hidding')
    document.querySelector('.page-current').classList.remove('page-current')
    setTimeout(()=>{
      document.querySelector('.page-hidding').classList.remove('page-hidding')
      document.querySelector(`.page-${history[history.length - 1].page}`).classList.add('page-current')
      lock = false
    }, 100)
  }
  const setNavbar = ()=>{
    if (history.length === 2) {
      document.body.classList.add('show-history-back')
      document.body.classList.remove('show-history-home')
    }else if (history.length > 2) {
      document.body.classList.add('show-history-back')
      document.body.classList.add('show-history-home')
    }else{
      document.body.classList.remove('show-history-back')
      document.body.classList.remove('show-history-home')
    }
  }
  return{
    open: open,
    back: back,
    home: home,
  }
})()

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
    if (document.querySelector('.user-control').classList.contains('open')) {
      document.querySelector('.menu-items').focus()
    }else{
      if (document.querySelector(':focus')) {
        document.querySelector(':focus').blur()
      }
    }
  })
  document.querySelector('.greet').innerHTML = greet()
  // 自动刷新
  ipcRenderer.on('db:img-ready',()=>{
    console.log('done')
  })

  window.addEventListener('mousedown',(ev)=>{
    switch (ev.buttons) {
      case 2:
        console.log('right click')
        break
      case 8:
        history.back()
        break
    }
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
// 打开项目页
contextBridge.exposeInMainWorld('getItem', (id, el)=>{
  history.open('item', id, el)
})
// 获取库分页
contextBridge.exposeInMainWorld('getPage',(page)=>{
  let els = document.querySelectorAll('.page-home .pagination')
  if (page === 'prev') {
    page = parseInt(els[0].querySelector('.num.current').getAttribute('data-page')) - 1
  }else if (page === 'next') {
    page = parseInt(els[0].querySelector('.num.current').getAttribute('data-page')) + 1
  }else if (typeof page !== 'number') {
    return null
  }
  ipcRenderer.invoke('layout:get', 'includes/list', {page: page - 1}).then((data)=>{
    els.forEach(el=>{
      el.querySelectorAll('.current').forEach(e => {
        e.classList.remove('current')
      })
      el.querySelector(`[data-page="${page}"]`).classList.add('current')
      if (page === 1) {
        el.querySelector('.icon-chevron-left').classList.add('current')
      }
      if (el.querySelector(`[data-page="${page}"]`).nextSibling.classList.contains('icon-chevron-right')) {
        el.querySelector('.icon-chevron-right').classList.add('current')
      }
    })
    document.querySelector('.page-home .item-list').classList.add('item-list-hide')
    setTimeout(() => {
      document.querySelector('.page-home .item-list').outerHTML = data
      document.querySelector('.page-home .item-list').classList.add('item-list-hide')
    }, 100)
    setTimeout(() => {
      document.querySelector('.page-home .item-list').classList.remove('item-list-hide')
    }, 110)
  })
})
// 历史记录
contextBridge.exposeInMainWorld('page',{
  open: history.open,
  back: history.back,
  home: history.home,
})
// TEST
contextBridge.exposeInMainWorld('add',(data)=>{
  ipcRenderer.invoke('db:addItem', data).then(d=>console.log(d))
})