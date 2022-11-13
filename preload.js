'use strict'

// 引入模块
const { contextBridge, ipcRenderer } = require("electron")
let lang

// 载入
ipcRenderer.invoke('lang:get').then(data=>{
  lang = data
})
ipcRenderer.invoke('layout:get', 'main').then(data=>document.write(data))

// 通知
const notice = (()=>{
  let shell
  const push = (content, title, type, option)=>{
    option = Object.assign({
      duration: 5000
    }, option)
    ipcRenderer.invoke('layout:get','includes/notice', {notice:{content, title, type}}).then(data=>{
      let item = document.createElement('ui-sort-item')
      item.className = 'notice'
      item.innerHTML = data 
      shell.append(item)
      item.style.setProperty('--duration', (option.duration / 1000) + 's')
      setTimeout(() => {
        item.classList.add('notice-fade')
        setTimeout(() => {
          item.remove()
        }, 100)
      }, option.duration - 100)
    })
  }
  return{
    info(content, title){
      return push(content, title,'info')
    },
    warn(content, title){
      return push(content, title,'warn')
    },
    error(content, title){
      return push(content, title,'error')
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
      if (history[history.length - 1].page === 'item') {
        openItem(history[history.length - 1].id, undefined, history[history.length - 1].scrollTop)
      }else{
        pageAnima(history[history.length - 1].scrollTop)
      }
      setNavbar()
    }else{
      home()
    }
  }
  const home = ()=>{
    if (lock || document.querySelector('.page-current').classList.contains('page-home')) return false
    lock = true
    pageAnima(history[0].scrollTop)
    history = history.splice(0,1)
    setNavbar()
  }
  const open = (page, id, el)=>{
    if (lock) return false
    lock = true
    if (page === 'item') {
      history[history.length - 1].scrollTop = document.querySelector('.page-current').scrollTop
      history.push({page, id})
      setNavbar()
      openItem(id, el)
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
    ipcRenderer.invoke('layout:item', id).then(data=>{
      if (el && typeof el === 'object' && el instanceof HTMLElement) {
        let from = el.querySelector('img').getBoundingClientRect()
        let img = el.querySelector('img').cloneNode()
        img.className = 'page-item-cover-anima'
        img.setAttribute('no-observer','')
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
          document.querySelector('.page-item').innerHTML = data
          let to = document.querySelector('.page-item .page-item-info .cover img').getBoundingClientRect()
          document.querySelector('.page-hidding').classList.remove('page-hidding')
          img.style.top = document.querySelector('.page-item-header').offsetHeight - 96 + 'px'
          img.style.left = to.left + 'px'
          img.style.height = to.height + 'px'
          img.style.width = to.width + 'px'
          related(id)
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
          related(id)
        }, 100)
        pageAnima(scrollTop)
      }
    })
  }
  const related = (id)=>{
    let relatedShell = document.querySelector('.page-item .page-item-related .item-list')
    ipcRenderer.invoke('layout:related', id).then((data)=>{
      relatedShell.outerHTML = data
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
    get: ()=>{return history},
    remove: (id)=>{
      history = history.filter(h=>h.id !== id)
    }
  }
})()

// 对话框
const dialog = (()=>{
  const closeDialog = (shell)=>{
    shell.classList.add('dialog-close')
    setTimeout(() => {
      shell.remove()
    }, 200)
  }
  const create = (option)=>{
    let shell = document.createElement('div')
    shell.className = 'dialog-shell'
    return new Promise((resolve)=>{
      option = Object.assign({title:lang.dialog.default_title, content:'', confirm:lang.dialog.confirm, cancel:lang.dialog.cancel, note: false, warn: false},option)
      ipcRenderer.invoke('layout:get', 'includes/dialog', {dialog: option}).then((data)=>resolve(data))
    }).then((data)=>{
      shell.innerHTML = data
      document.body.append(shell)
      return new Promise((resolve)=>{
        shell.querySelector('.dialog>.dialog-control>button.dialog-confirm').addEventListener('click',()=>{
          resolve(true)
          closeDialog(shell)
        })
        shell.querySelector('.dialog>.dialog-control>button.dialog-cancel').addEventListener('click',()=>{
          resolve(false)
          closeDialog(shell)
        })
      })
    })
  }
  const createSync = (option, callback)=>{
    create(option).then((data)=>{
      if (typeof callback === 'function') {
        callback(data)
      }
    })
  }
  return{
    create,
    createSync,
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
        if (document.querySelector('.dialog')) {
          if (document.querySelector('.dialog .dialog-cancel')) {
            document.querySelector('.dialog .dialog-cancel').click()
          }else{
            document.querySelector('.dialog .dialog-confirm').click()
          }
        }else{
          history.back()
        }
        break
    }
  })

  // 通知
  notice.init()
  
  // 完成
  {
    let imgs = document.querySelectorAll('img')
    let counter = 0
    function getReady (){
      this.removeEventListener('load', getReady)
      counter++
      if (counter === imgs.length) {
        ipcRenderer.send('window:ready')
      }
    }
    if (imgs.length > 0) {
      imgs.forEach(img=>{
        img.addEventListener('load', getReady)
      })
      setTimeout(()=>{
        ipcRenderer.send('window:ready')
      }, 1000)
    }else{
      ipcRenderer.send('window:ready')
    }
  }
}

// 库分页
const libraryPage = (page)=>{
  if (typeof page !== 'number') {
    page = 0
    if (document.querySelector('.page.page-home .home-library .pagination .current')) {
      page = parseInt(document.querySelector('.page.page-home .home-library .pagination .current').dataset.page)
    }
  }
  ipcRenderer.invoke('layout:listItems', 'libraryPage', null, page).then((data)=>{
    let shell = document.querySelector('.page.page-home .home-library .item-list-container')
    let tmp = document.createElement('div')
    tmp.innerHTML = data
    shell.children[0].innerHTML = tmp.children[0].innerHTML
    shell.children[2].innerHTML = tmp.children[2].innerHTML
    shell.children[1].classList.add('item-list-hide')
    setTimeout(() => {
      shell.children[1].outerHTML = tmp.children[1].outerHTML
    }, 200)
  })
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
contextBridge.exposeInMainWorld('libraryPage', libraryPage)
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
      ipcRenderer.invoke('layout:get', `includes/item-edit-season`).then(data=>{
        if (data) {
          let shell = document.createElement('div')
          shell.innerHTML = data
          e.before(shell.querySelector('ui-sort-item'))
        }
      })
      break
    case 'addLink':
      ipcRenderer.invoke('layout:get', `includes/item-edit-link`).then(data=>{
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
            e.outerHTML = data
          }
        })
      })
      break
    case 'confirm':
      dialog.create({
        title: (e.id === -1 ? lang.dialog.add_bangumi : lang.dialog.edit_bangumi),
        content: `${(e.id === -1 ? lang.dialog.add_bangumi_detail_before : lang.dialog.edit_bangumi_detail_before)}${e.title}${(e.id === -1 ? lang.dialog.add_bangumi_detail_after : lang.dialog.edit_bangumi_detail_after)}`,
      }).then((confirm)=>{
        if (confirm) {
          ipcRenderer.invoke('db:setItem', e).then((data)=>{
            if (history.get()[history.get().length - 1].page === 'add') {
              document.querySelector('.page.page-add button.icon-arrow-reset').click()
            }else{
              document.querySelector('.page.page-edit .ui-tab-current button.icon-arrow-reset').click()
            }
            libraryPage()
          })
        }
      })
      break
    case 'getPath':
      ipcRenderer.invoke('dialog:open',{
        title: lang.item_edit.select_img,
        filters: [
          { name: lang.item_edit.extension_img, extensions: ['bmp', 'gif', 'ico', 'jpg', 'png', 'svg', 'tif', 'webp'] },
          { name: lang.item_edit.extension_all, extensions: ['*'] },
        ],
        properties: ['openFile', 'dontAddToRecent'],
      }).then((result)=>{
        if (!result.canceled) {
          e.value = result.filePaths[0]
        }
      })
      break
  }
})
// 删除番剧
contextBridge.exposeInMainWorld('deleteItem',()=>{
  let id = null
  let page
  switch (history.get()[history.get().length - 1].page) {
    case 'item':
      id = history.get()[history.get().length - 1].id
      page = 'item'
      break
    case 'edit':
      id = parseInt(document.querySelector('.page.page-edit ui-tab-bar .ui-tab-current').dataset.id)
      page = 'edit'
      break
  }
  if (id !== null) {
    ipcRenderer.invoke('db:getItemById', id).then((item)=>{
      dialog.create({
        title: lang.dialog.delete_bangumi,
        content: `${lang.dialog.delete_bangumi_detail_before}${item.title}${lang.dialog.delete_bangumi_detail_after}`,
        warn: true,
      }).then((confirm)=>{
          if (confirm) {
            ipcRenderer.invoke('db:removeItem', id).then(()=>{
              libraryPage()
              history.remove(id)
              if (document.querySelector(`.page.page-edit ui-tab-bar [data-id="${id}"]`)) {
                document.querySelector(`.page.page-edit ui-tab-bar [data-id="${id}"] .close`).click()
              }
              if (page === 'item') {
                history.back()
              }
            })
          }
      })
    })
  }
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