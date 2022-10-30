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

// 当前番剧
// let nowItemId = null

// 通知
const notice = (()=>{
  let shell
  const push = (value, type)=>{
    ipcRenderer.invoke('layout:get','includes/notice', {notice:{value, type}}).then(data=>{
      let item = document.createElement('ui-sort-item')
      item.className = 'notice'
      item.innerHTML = data 
      shell.append(item)
      setTimeout(() => {
        item.classList.add('notice-fade')
        setTimeout(() => {
          item.remove()
        }, 100)
      }, 4900)
    })
  }
  return{
    info(value){
      console.log('d')
      return push(value,'info')
    },
    warn(value){
      return push(value,'warn')
    },
    error(value){
      return push(value,'error')
    },
    init(){
      shell = document.querySelector('body>.notices')
    },
  }
})()

// 历史记录
const history = (()=>{
  let history = [{page: 'home'}]
  let lock = false
  const back = ()=>{
    if (lock) return false
    if (history.length > 1) {
      lock = true
      history.pop()
      // nowItemId = null
      if (history[history.length - 1].page === 'item') {
        openItem(history[history.length - 1].id, undefined, history[history.length - 1].scrollTop)
        // nowItemId = history[history.length - 1].id || null
      }else{
        pageAnima(history[history.length - 1].scrollTop)
      }
      setNavbar()
    }
  }
  const home = ()=>{
    if (lock) return false
    lock = true
    pageAnima(history[0].scrollTop)
    history = [{page: 'home'}]
    setNavbar()
    // nowItemId = null
  }
  const open = (page, id, el)=>{
    if (lock) return false
    lock = true
    // nowItemId = null
    if (page === 'item') {
      history[history.length - 1].scrollTop = document.querySelector('.page-current').scrollTop
      history.push({page, id})
      setNavbar()
      openItem(id, el)
      // nowItemId = id
    }else if (page === 'edit') {
      id = history[history.length - 1].id
      history[history.length - 1].scrollTop = document.querySelector('.page-current').scrollTop
      history.push({page, id})
      setNavbar()
      if (id !== undefined) {
        if (document.querySelector(`.page-edit ui-tab-item[data-id="${id}"]`)) {
          document.querySelector(`.page-edit ui-tab-item[data-id="${id}"] .info`).click()
          pageAnima()
        }else{
          if (document.querySelector('.page-edit ui-tab-bar').children.length > 2) {
            notice.warn(lang.notice.edit_tab_too_much)
          }
          ipcRenderer.invoke('db:getItemById', id).then(item=>{
            ipcRenderer.invoke('layout:get','includes/page-edit', {item}).then(data=>{
              document.querySelector('.page-edit ui-tab-add').innerHTML = data
              pageAnima()
            })
          })
        }
        // nowItemId = id
      }else{
        pageAnima()
      }
    }else if (document.querySelector(`.page-${page}`)) {
      history.push({page})
      setNavbar()
      pageAnima()
    }else{
      ipcRenderer.invoke('layout:get', `includes/page-${page}`).then(data=>{
        if (data) {
          history.push({page})
          setNavbar()
          let newPage = document.createElement('div')
          newPage.className = `page page-${page}`
          document.querySelector('.pages').appendChild(newPage)
          newPage.innerHTML = data
          pageAnima()
        }
      })
    }
  }
  const openItem = (id, el, scrollTop)=>{
    ipcRenderer.invoke('db:getItemById', id).then(item=>{
      ipcRenderer.invoke('layout:get', 'includes/page-item', {item}).then(data=>{
        if (el && typeof el === 'object' && el instanceof HTMLElement) {
          document.querySelector('.page-item').innerHTML = data
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
            document.querySelector('.page-item').scrollTop = scrollTop ? scrollTop : 0
            document.querySelector('.page-item').classList.add('page-current')
            img.style.top = document.querySelector('.page-item-header').offsetHeight - 100 + 'px'
            img.style.transition = '.1s top linear, .1s opacity linear'
            lock = false
          }, 310)
          setTimeout(() => {
            img.style.opacity = 0
          }, 410)
          setTimeout(() => {
            img.remove()
          }, 470)
        }else{
          setTimeout(() => {
            document.querySelector('.page-item').innerHTML = data
          }, 100)
          pageAnima(scrollTop)
        }
      })
    })
  }
  const pageAnima = (scrollTop)=>{
    document.querySelector('.page-current').classList.add('page-hidding')
    document.querySelector('.page-current').classList.remove('page-current')
    setTimeout(()=>{
      document.querySelector(`.page-${history[history.length - 1].page}`).scrollTop = Number(scrollTop) || 0
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
    document.querySelector('.user-control').classList.toggle('menu-open')
    if (document.querySelector('.user-control').classList.contains('menu-open')) {
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

  // 通知
  notice.init()
  
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
navigation.addEventListener('navigate',(ev)=>{
  ev.preventDefault()
  if (ev.destination.url.indexOf('file')) {
    ipcRenderer.send('open:url', ev.destination.url)
  }
})
contextBridge.exposeInMainWorld('openUrl', (url)=>{
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
// 打开随机项目
contextBridge.exposeInMainWorld('getRandomItem',()=>{
  ipcRenderer.invoke('db:getItemIdByRandom').then(id=>{
    history.open('item', id)
  })
})
// 历史记录
contextBridge.exposeInMainWorld('page',{
  open: history.open,
  back: history.back,
  home: history.home,
})
// 编辑页
contextBridge.exposeInMainWorld('editUIHelper',(e,type)=>{
  switch (type) {
    case 'addSeason':
      ipcRenderer.invoke('layout:get', `includes/item-season`).then(data=>{
        if (data) {
          let shell = document.createElement('div')
          shell.innerHTML = data
          e.before(shell.querySelector('ui-sort-item'))
        }
      })
      break
    case 'addLink':
      ipcRenderer.invoke('layout:get', `includes/item-link`).then(data=>{
        if (data) {
          let shell = document.createElement('div')
          shell.innerHTML = data
          e.parentNode.before(shell.querySelector('ui-sort-item'))
        }
      })
      break
    case 'reduceSeason':
      if (e.parentNode.parentNode.parentNode.children.length > 2) {
        e.parentNode.parentNode.remove()
      }
      break
    case 'reduceLink':
      e.parentNode.remove()
      break
    case 'resetSeason':
      e.parentNode.parentNode.querySelectorAll('input').forEach(el=>{
        el.hasAttribute('value') && (el.value = el.getAttribute('value'))
      })
      break
    case 'reset':
      ipcRenderer.invoke('db:getItemById', parseInt(e.dataset.id)).then(item=>{
        if (!item) item = {id:-1,title:'',tags:[],categorize:[],content:'',seasons:[{title:'',cover:'',header:'',set:'',finished:'',links:[]}]}
        ipcRenderer.invoke('layout:get', `includes/item-edit`, {item}).then(data=>{
          if (data) {
            let shell = document.createElement('div')
            shell.innerHTML = data
            e.innerHTML = shell.querySelector('.item-edit').innerHTML
          }
        })
      })
      break
    case 'confirm':
      console.log(e)
      break
  }
})
// TEST
contextBridge.exposeInMainWorld('add',(data)=>{
  // ipcRenderer.invoke('db:addItem', data).then(d=>console.log(d))
})

ipcRenderer.on('test:css',()=>{
  var h, a, f;
  a = document.getElementsByTagName('link');
  for (h = 0; h < a.length; h++) {
    f = a[h];
    if (f.rel.toLowerCase().match(/stylesheet/) && f.href) {
      var g = f.href.replace(/(&|\?)rnd=\d+/, '');
      f.href = g + (g.match(/\?/) ? '&' : '?');
      f.href += 'rnd=' + (new Date().valueOf());
    }
  }
})