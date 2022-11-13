'use strict'
// 引入模块
const { app, BrowserWindow, ipcMain, nativeTheme, systemPreferences, shell, dialog } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const pug = require('pug')
const Settings = require('./src/lib/settings')
const utility = require('./src/lib/utility')
const store = require('electron-store')
const { version } = require('./package.json')
const build = 95
let initialized = false

// 单例限制
const singleInstanceLock = app.requestSingleInstanceLock()
if (!singleInstanceLock) {
  app.quit()
}else{
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData)=>{
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })
}

// 设置
const settings = new Settings()
utility.setGlobal('settings', settings)

// 语言
const locales = (()=>{
  let languageList = ['zh-CN']
  let defaultLanguage = 'zh-CN'
  let language

  const setLanguage = (languageName = settings.get('language'))=>{
    return new store({
      name: languageList.findIndex(name => name === languageName) > -1 ? languageName : defaultLanguage,
      fileExtension: 'json',
      cwd: path.join(__dirname, 'src/locales/')
    })
  }

  language = setLanguage()

  return{
    get:(key)=>{
      if (key) {
        return language.get(key)
      }else{
        return language.store
      }
    },
    refresh:()=>{language = setLanguage()}
  }
})()

// 基本设置
const CONFIG = {
  userMenu: [
    {
      items: [
        {
          name: 'user.menu.try_luck',
          icon: 'icon icon-emoji-hand',
          onclick: 'getRandomItem()',
        }
      ],
    },
    {
      items: [
        {
          name: 'user.menu.add_item',
          icon: 'icon icon-add',
          onclick: 'page.open("add")',
        },
      ]
    },
    {
      items: [
        {
          name: 'user.menu.edit_item',
          icon: 'icon icon-edit',
          onclick: 'page.open("edit")',
        },
        {
          name: 'user.menu.delete_item',
          icon: 'icon icon-delete',
          onclick: 'deleteItem()',
        },
      ]
    },
    {
      items: [
        {
          name: 'user.menu.settings',
          icon: 'icon icon-settings',
        },
        {
          name: 'user.menu.about',
          icon: 'icon icon-info',
          onclick: 'page.open("about")',
        },
      ]
    }
  ]
}

// 模板
const layout = (name, option)=>{
  option = Object.assign({
    lang: locales.get(),
    app: {
      version: version,
      build: build,
      config: CONFIG,
    },
    system: {
      accentColor: systemPreferences.getAccentColor().slice(0, 6),
      accentColorWithAlpha: systemPreferences.getAccentColor(),
    },
    settings: settings.store(),
    test:(...args)=>{
      console.log(...args)
    },
    getLangByKey: (key)=>{return locales.get(key)},
  }, utility.layout.get(), option)
  try {
    return pug.renderFile((`./src/layout/${name}.pug`), option)
  } catch (error) {
    console.error(error)
    return ''
  }
}

// 初始化
const readyInit = ()=>{
  const startupScreen = new BrowserWindow({
    show: false,
    width: 600,
    height: 300,
    frame: false,
    resizable: false,
    fullscreenable: false,
    transparent: true,
    title: '番剧管理器',
    icon: './src/assets/icons/icon.ico',
    enableLargerThanScreen: false,
    webPreferences:{
      preload: path.join(__dirname, 'startupScreen.js')
    }
  })
  global.startupScreen = startupScreen
  startupScreen.loadFile('index.html')
  startupScreen.webContents.send('layout', layout('startupScreen', {startupImage: (()=>{
    try {
      let images = fs.readdirSync(path.join(settings.get('dataPath'), '/startup_images/'))
      if (images.length > 0) {
        return path.join(settings.get('dataPath'), '/startup_images/', images[Math.floor(Math.random() * images.length)])
      }else{
        return './src/assets/defaultStartupScreenImage.png'
      }
    } catch (error) {
      return './src/assets/defaultStartupScreenImage.png'
    }
  })()}))
  startupScreen.on('ready-to-show',()=>{
    startupScreen.show()
    init()
  })
  startupScreen.on('close',()=>{
    if (!initialized) {
      app.quit()
    }
  })
  ipcMain.on('startup:close',()=>{
    startupScreen.close()
  })
}
const init = ()=>{
  // 报告启动信息：加载数据库
  startupScreen.webContents.send('info',locales.get().startup_screen.loading_database)

  // 数据库
  const db = new store({
    name: 'database',
    fileExtension: 'json',
    cwd: settings.get('dataPath'),
    schema: utility.DB_SCHEMA,
  })
  utility.setGlobal('db', db)
  global.db = db
  utility.initAssetsDir()

  // 报告启动信息：初始化功能
  startupScreen.webContents.send('info',locales.get().startup_screen.init_method)

  // 模板
  ipcMain.handle('layout:get', (event, name, option)=>{
    option = Object.assign({
      db: db.store,
    }, option)
    return layout(name, option)
  })
  // 列出番剧
  ipcMain.handle('layout:listItems', (_, pageFn, items, page)=>{
    return listItems(pageFn, items, page)
  })
  // 番剧页
  ipcMain.handle('layout:item',(_, id)=>{
    return layout('includes/page-item', {
      item: db.get('items').find(i=> i.id === id),
      db: db.store,
    })
  })
  // 相关番剧
  ipcMain.handle('layout:related',(_,id)=>{
    return listItems(null, getRelated(id))
  })

  // 暗色模式
  ipcMain.handle('dark-mode:toggle', ()=>{
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })
  ipcMain.handle('dark-mode:system', ()=>{
    nativeTheme.themeSource = 'system'
  })
  nativeTheme.addListener('updated', ()=>{
    win.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#202020' : '#f3f3f3')
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

  // 获取文件
  ipcMain.handle('dialog:open', (_, option)=>{
    return dialog.showOpenDialog(win, option)
  })
  ipcMain.handle('dialog:save', (_, option)=>{
    return dialog.showSaveDialog(win, option)
  })

  // 数据库
  // 重命名标签或归类
  const setTagOrCategory = (id, name, type)=>{
    let objs = db.get(type)
    let target = objs.find(objs=>objs.id === id)
    if (target) {
      target.name = String(name)
      db.set(type, objs)
      return true
    }else{
      return false
    }
  }
  // 合并标签或归类
  const margeTagOrCategory = (mainId, margedId, type)=>{
    let objs = db.get(type)
    let items = db.get('items')
    let mainIndex = objs.findIndex(obj=>obj.id === mainId)
    let margedIndex = objs.findIndex(obj=>obj.id === margedId)
    if (mainIndex > -1 && margedIndex > -1) {
      objs[margedIndex].items.forEach(itemId=>{
        let targetItem = items.find(item=>item.id === itemId)
        if (targetItem[type].indexOf(mainId) === -1) {
          targetItem[type][targetItem[type].indexOf(margedId)] = itemId
        }else{
          targetItem[type] = targetItem[type].splice(targetItem[type].indexOf(margedId), 1)
        }
      })
      objs[mainIndex] = Array.from(new Set([...objs[mainIndex], ...objs[margedIndex]]))
      objs = objs.splice(margedIndex, 1)
      db.set(type, objs)
      db.set('items', items)
      return true
    }else{
      return false
    }
  }
  // 移除标签或归类
  const removeTagOrCategory = (id, type)=>{
    let targetIndex = db.get(type).findIndex(obj=>obj.id === id)
    if (targetIndex === -1) {
      return false
    }else{
      let objs = db.get(type)
      let items = db.get('items')
      objs[targetIndex].items.forEach(itemId=>{
        let target = items.find(item=>item.id === itemId)[type]
        target = target.splice(target.findIndex(objId=>objId === id), 1)
      })
      objs = objs.splice(targetIndex, 1)
      db.set(type, objs)
      db.set('items', items)
      return true
    }
  }
  // 获取 ID（注册）
  const getId = (type)=>{
    let id = db.get(`id.${type}`)
    if (typeof id === 'undefined') {
      return NaN
    }else{
      db.set(`id.${type}`, id + 1)
      return id
    }
  }
  // 设置标签或分类（设置番剧）
  const setLabel = (type, name, id)=>{
    let labels = db.get(type)
    let item = labels.find(i=> i.name === name)
    if (item) {
      if (!item.items.find(i=>i === id)) item.items.push(id)
    }else{
      item = {
        id: getId(type),
        name,
        items: [id],
      }
      labels.push(item)
    }
    db.set(type, labels)
    return item.id
  }
  // 移除标签或分类（设置番剧）
  const removeLabel = (type, labelId, id)=>{
    let labels = db.get(type)
    let item = labels.find(i=> i.id === labelId)
    if (item) {
      let index = item.items.findIndex(i=> i === id)
      if (index > -1) item.items.splice(index, 1)
      db.set(type, labels)
    }
    return
  }
  // 获取相关番剧
  const getRelated = (id)=>{
    let item = db.store.items.find(item=>item.id === parseInt(id))
    let hits = []
    let result = []
    if (item && item.tags.length > 0) {
      item.tags.forEach(tagId=>{
        db.store.tags.find(tag=>tag.id == tagId).items.forEach(itemId=>{
          if (itemId !== id) {
            let hit = hits.findIndex(hit=>hit.id === itemId)
            if (hit > -1) {
              hits[hit].weight++
            }else{
              hits.push({id:itemId, weight: 1})
            }
          }
        })
      })
      hits.sort(()=>{return Math.random() - 0.5})
      hits.sort((a,b)=>{return b.weight - a.weight})
      hits.forEach(hit=>{
        result.push(db.store.items.find(item=>item.id === hit.id))
      })
    }
    if (result.length > 5) {
      result.length = 5
    }
    result.reverse()
    return result
  }
  // 通过 ID 获取
  const getItemById = (id)=>{
    return db.store.items.find(item=>item.id === parseInt(id))
  }
  // 列出番剧
  const listItems = (pageFn, items, page)=>{
    let itemPrePage = settings.get('itemPrePage')
    if (!items) {
      items = db.get('items')
      items.reverse()
    }
    if (typeof page === 'undefined') {
      page = 0
    }
    let pages = parseInt(items.length / itemPrePage)
    page = Math.max(0, Math.min(page, pages))
    items = items.splice(page * itemPrePage, itemPrePage)
    return layout('includes/list-items', {items, pageFn, page, pages})
  }
  // 注册模板辅助函数
  utility.layout.register('getRelated', getRelated)
  utility.layout.register('getItemById', getItemById)
  utility.layout.register('listItems', listItems)
  // 获取数据库
  ipcMain.handle('db:get', () => {
    return db.store
  })
  // 获取所有番剧
  ipcMain.handle('db:getAllItems', () => {
    return db.store.items
  })
  // 通过 id 获取番剧
  ipcMain.handle('db:getItemById', (_,id) => {
    console.warn('The "db:getItemById" API will be deprecated, do not use this API if possible.')
    return getItemById(id)
  })
  // 随机获取番剧
  ipcMain.handle('db:getItemIdByRandom',()=>{
    return db.store.items[Math.floor(Math.random() * db.store.items.length)].id
  })
  // 获取所有标签
  ipcMain.handle('db:getAllTags', () => {
    return db.store.tags
  })
  // 获取所有归类
  ipcMain.handle('db:getAllCategorize', () => {
    return db.store.categorize
  })
  // 获取相关番剧
  ipcMain.handle('db:getRelated',(_,id)=>{
    return getRelated(id)
  })
  // 搜索番剧
  ipcMain.handle('db:search', (_,option) => {
    option = Object.assign({
      keywords: [],
      includeTags: [],
      excludeTags: [],
      includeCategorize: [],
      excludeCategorize: [],
      includeStars: [],
      excludeStars: [],
      favorite: 0,
    },option)
    let hits = []
    let result = {onlyKeywords:[], withFilter:[]}
    let maxWeight = 0
    let items = db.get('items')
    let tags = db.get('tags')
    let categorize = db.get('categorize')
    let includeByTags = []
    let includeByCategorize = []
    let excludeByTags = []
    let excludeByCategorize = []
    // 通过关键词搜索
    if (option.keywords.length > 0) {
      items.forEach(item=>{
        option.keywords.forEach(keyword=>{
          let titleMatchResult = utility.textMatch(keyword, item.title)
          let contentMatchResult = utility.textMatch(keyword, item.content)
          let hit = hits.find(hit=>hit.id === item.id)
          if (hit) {
            hit.weight += titleMatchResult + contentMatchResult
            if ((titleMatchResult + contentMatchResult) === 0) {
              hit.miss++
            }
            if (hit.weight > maxWeight) {
              maxWeight = hit.weight
            }
          }else{
            let newHit = {id: item.id, weight:titleMatchResult + contentMatchResult, miss: 0}
            if ((titleMatchResult + contentMatchResult) === 0) {
              newHit.miss++
            }
            if (newHit.weight > maxWeight) {
              maxWeight = newHit.weight
            }
            hits.push(newHit)
          }
        })
      })
    }
    // 排除命中数较少的番剧
    if (settings.get('searchExcludeMiss')) {
      hits.filter(hit=>{
        return (hit.miss === 0)
      })
    }
    // 按照权重排列并生成仅使用关键词过滤的番剧
    hits.sort((a, b) => a.weight - b.weight)
    hits.forEach(hit=>{
      result.onlyKeywords.push(items.find(item=>item.id === hit.id))
    })
    // 过滤出必包含标签的番剧
    if (option.includeTags.length > 0) {
      option.includeTags.forEach(tagId=>{
        if (includeByTags.length === 0) {
          includeByTags = tags.find(tag=>tag.id === tagId).items
        }else{
          includeByTags = includeByTags.filter(x => (new Set(tags.find(tag=>tag.id === tagId).items)).has(x))
        }
      })
      hits.filter(hit=>{
        return (new Set(includeByTags)).has(hit.id)
      })
    }
    // 过滤出必不包含标签的番剧
    if (option.excludeTags.length > 0) {
      option.excludeTags.forEach(tagId=>{
        if (excludeByTags.length === 0) {
          excludeByTags = tags.find(tag=>tag.id === tagId).items
        }else{
          excludeByTags = Array.from(new Set([...excludeByTags, ...tags.find(tag=>tag.id === tagId).items]))
        }
      })
      hits.filter(hit=>{
        return !(new Set(excludeByTags)).has(hit.id)
      })
    }
    // 过滤出必包含分类的番剧
    if (option.includeCategorize.length > 0) {
      option.includeCategorize.forEach(categoryId=>{
        if (includeByCategorize.length === 0) {
          includeByCategorize = categorize.find(category=>category.id === categoryId).items
        }else{
          includeByCategorize = includeByCategorize.filter(x => (new Set(categorize.find(category=>category.id === categoryId).items)).has(x))
        }
      })
      hits.filter(hit=>{
        return (new Set(includeByCategorize)).has(hit.id)
      })
    }
    // 过滤出必不包含分类的番剧
    if (option.excludeCategorize.length > 0) {
      option.excludeCategorize.forEach(categoryId=>{
        if (excludeByCategorize.length === 0) {
          excludeByCategorize = categorize.find(category=>category.id === categoryId).items
        }else{
          excludeByCategorize = Array.from(new Set([...excludeByCategorize, ...categorize.find(category=>category.id === categoryId).items]))
        }
      })
      hits.filter(hit=>{
        return !(new Set(excludeByCategorize)).has(hit.id)
      })
    }
    // 过滤包含分级的番剧
    if (option.includeStars.length > 0) {
      hits.filter(hit=>{
        let miss = true
        option.includeStars.forEach(star=>{
          if (items.find(item=>item.id === hit.id).stars === star) {
            miss = false
          }
        })
        return !miss
      })
    }
    // 过滤出不包含分级的番剧
    if (option.excludeStars.length > 0) {
      hits.filter(hit=>{
        let miss = true
        option.excludeStars.forEach(star=>{
          if (items.find(item=>item.id === hit.id).stars === star) {
            miss = false
          }
        })
        return miss
      })
    }
    // 过滤出喜爱或未喜爱的番剧
    if (option.favorite === 1) {
      hits.filter(hit=>{
        return items.find(item=>item.id === hit.id).favorite
      })
    }else if (option.favorite === -1) {
      hits.filter(hit=>{
        return !items.find(item=>item.id === hit.id).favorite
      })
    }
    // 生成并返回最终结果
    hits.forEach(hit=>{
      result.withFilter.push(items.find(item=>item.id === hit.id))
    })
    return result
  })
  // 设置番剧
  ipcMain.handle('db:setItem', (_, data) => {
    let items = db.get('items')
    let originItem = items.find(i=>i.id === data.id)
    return new Promise((resolve, reject)=>{
      // 初始化
      let imgQueue = []
      let item = originItem || {
        id: getId('item'),
        title: '',
        content: '',
        favorite: false,
        stars: 0,
        categorize: [],
        tags: [],
        seasons: [{
          title: '',
          header: null,
          cover: null,
          links: [],
          set: null,
          finished: null,
        }],
      }
      // 设置基本信息
      item.title = data.title ? String(data.title) : item.title
      item.content = data.content ? String(data.content) : item.content
      item.stars = typeof data.stars === 'number' && !isNaN(data.stars) ? Math.max(Math.min(parseInt(data.stars), 5), 0) : item.stars
      // 设置喜爱
      if (typeof data.favorite === 'boolean' && item.favorite !== data.favorite) {
        let favorites = db.get('favorites')
        if (item.favorite) {
          favorites.splice(favorites.findIndex(f=>f === item.id))
        }else{
          favorites.push(item.id)
        }
        db.set('favorites', favorites)
      }
      item.favorite = typeof data.favorite === 'boolean' ? data.favorite : item.favorite
      // 设置分类
      if (typeof data.categorize === 'object' && data.categorize instanceof Array) {
        item.categorize = item.categorize.filter((id)=>{
          if (!data.categorize.includes(db.get('categorize').find(c=>c.id === id).name)) {
            removeLabel('categorize', id, item.id)
            return false
          }
          return true
        })
        data.categorize.forEach((name)=>{
          name = String(name)
          let id = setLabel('categorize', name, item.id)
          if (!item.categorize.includes(id)) item.categorize.push(id)
        })
      }
      // 设置标签
      if (typeof data.tags === 'object' && data.tags instanceof Array) {
        item.tags = item.tags.filter((id)=>{
          if (!data.tags.includes(db.get('tags').find(c=>c.id === id).name)) {
            removeLabel('tags', id, item.id)
            return false
          }
          return true
        })
        data.tags.forEach(name=>{
          name = String(name)
          let id = setLabel('tags', name, item.id)
          if (!item.tags.includes(id)) item.tags.push(id)
        })
      }
      // 设置季
      if (typeof data.seasons === 'object' && data.seasons instanceof Array) {
        data.seasons.forEach((obj, index)=>{
          let season = item.seasons[index] || {
            title:'',
            set: null,
            finished: null,
            header: null,
            cover: null,
            links: [],
          }
          season.title = obj.title ? String(obj.title) : season.title
          season.set = obj.set === null ? obj.set : (isNaN(parseInt(obj.set)) ? season.set : Math.max(parseInt(obj.set), 0))
          season.finished = obj.finished === null ? obj.finished : (isNaN(parseInt(obj.finished)) ? season.finished : Math.max(parseInt(obj.finished), 0))
          if (season.header !== null && season.header !== obj.header) {
            imgQueue.push(utility.removeImg('/header/' + season.header))
          }
          if (season.header !== obj.header) {
            imgQueue.push(utility.getImg(obj.header, index, 'header', item.id))
          }
          if (season.cover !== null && season.cover !== obj.cover) {
            imgQueue.push(utility.removeImg('/cover/' + season.cover))
          }
          if (season.cover !== obj.cover) {
            imgQueue.push(utility.getImg(obj.cover, index, 'cover', item.id))
          }
          if (typeof obj.links === 'object' && obj.links instanceof Array) {
            season.links = []
            obj.links.forEach(({url, name})=>{
              season.links.push({url: String(url), name: String(name)})
            })
          }
          if (index + 1 > item.seasons.length) {
            item.seasons.push(season)
          }
        })
        item.seasons.splice(data.seasons.length, item.seasons.length)
      }
      Promise.all(imgQueue).then((imgs)=>{
        imgs.forEach((img)=>{
          item.seasons[img.index][img.type] = img.path
        })
        resolve({item, imgs})
      })
    }).then(({item, imgs})=>{
      // TODO: plugin
      return {item, imgs}
    }).then(({item, imgs})=>{
      if (!originItem) items.push(item)
      db.set('items', items)
      return {item, imgs}
    })
  })
  // 设置标签名称
  ipcMain.handle('db:setTag', (_,id, name) => {
    return setTagOrCategory(id, name, 'tags')
  })
  // 设置分类名称
  ipcMain.handle('db:setCategory', (_,id, name) => {
    return setTagOrCategory(id, name, 'categorize')
  })
  // 合并标签
  ipcMain.handle('db:mergeTag', (_,mainId, margedId)=>{
    return margeTagOrCategory(mainId, margedId, 'tags')
  })
  // 合并分类
  ipcMain.handle('db:mergeCategory', (_,mainId, margedId)=>{
    return margeTagOrCategory(mainId, margedId, 'categorize')
  })
  // 删除番剧
  ipcMain.handle('db:removeItem', (_,id) => {
    let items = db.get('items')
    let itemIndex = items.findIndex(item=>item.id === id)
    if (itemIndex === -1) {
      // 若未找到番剧返回 false
      return false
    }else{
      let item = items[itemIndex]
      let favorites = db.get('favorites')
      let recommendation = db.get('recommendation')
      // 设置标签
      item.tags.forEach(tagId=>{
        removeLabel('tags', tagId, id)
      })
      // 设置分类
      item.categorize.forEach(categoryId=>{
        removeLabel('categorize', categoryId, id)
      })
      // 设置喜爱
      if (item.favorite) {
        favorites.splice(favorites.findIndex(item.id), 1)
        db.set('favorites', favorites)
      }
      // 设置每周推荐
      if (recommendation.id === id) {
        recommendation.id = -1
        db.set('recommendation', recommendation)
      }
      // 设置季，移除封面文件
      item.seasons.forEach(season=>{
        if (season.cover !== null) {
          fs.unlink(path.join(settings.get('dataPath'), '/covers/', season.cover))
        }
        if (season.header !== null) {
          fs.unlink(path.join(settings.get('dataPath'), '/header/', season.header))
        }
      })
      // 保存结果并返回 true
      items.splice(itemIndex, 1)
      db.set('items', items)
      return true
    }
  })
  // 移除标签
  ipcMain.handle('db:removeTag', (_,id) => {
    return removeTagOrCategory(id, 'tags')
  })
  // 移除分类
  ipcMain.handle('db:removeCategory', (_,id) => {
    return removeTagOrCategory(id, 'categorize')
  })
  // 获取每周推荐
  ipcMain.handle('db:getWeeklyRecommend', ()=>{
    let itemId = db.get('recommendation').id
    if (itemId < 0) {
      return null
    }else{
      let result = db.get('items').find(item=>item.id === itemId)
      if (!result) {
        result = null
      }
      return result
    }
  })

  // 报告启动信息：生成推荐
  startupScreen.webContents.send('info',locales.get().startup_screen.reparing_weekly_recommendation)

  // 生成每周推荐
  const generateWeeklyRecommendation = ()=>{
    let now = new Date()
    let nextTime = new Date(now.getTime() - now.getDay() * 86400000)
    let rec = db.get('recommendation')
    let items = db.get('items')
    let tags = db.get('tags')
    let categorize = db.get('categorize')
    let favorites = db.get('favorites')
    let isRecCate = settings.get('recommendWithCatagorize')
    let recTags = rec.weights.tags //settings.get('recommendTagsWeights')
    let recCate = rec.weights.categorize //settings.get('recommendCategorizeWeights')
    let exclude = rec.exclude // settings.get('recommendExcludeItems')
    let favWeight = settings.get('recommendFavoriteWeight')
    let hits = []
    const setWeight = (setItems, weight, isItems)=>{
      setItems.forEach(data=>{
        let id = data
        if (isItems) {
          id = data.id
        }
        if (exclude.indexOf(id) === -1) {
          let hit = hits.find(hit=>hit.id === id)
          if (hit) {
            hit.weight += weight
          }else{
            hits.push({id: id, weight: weight})
          }
        }
      })
    }
    // 检查日期
    if ((now.getTime() - rec.generationTime) / 604800000 > 1) {
      // 检查番剧数量
      if (items.length === 0) {
        rec.id = -1
        return -1
      }else{
        // 若有喜爱的番剧或已设置标签或归类权重
        if (recTags.length > 0 || (isRecCate && recCate.length > 0) || favorites.length > 0) {
          // 根据喜爱的番剧
          favorites.forEach(fItemId=>{
            if (exclude.indexOf(fItemId) === -1) {
              items.find(item=>item.id === fItemId).tags.forEach(tagId=>{
                setWeight(tags.find(tag=>tag.id === tagId).items, favWeight)
              })
              if (isRecCate) {
                items.find(item=>item.id === fItemId).categorize.forEach(categoryId=>{
                  setWeight(categorize.find(category=>category.id === categoryId).items, favWeight)
                })
              }
            }
          })
          // 标签
          recTags.forEach(recTag=>{
            setWeight(tags.find(tag=>tag.id === recTag.id).items, recTag.weight)
          })
          // 分类
          if (isRecCate) {
            recCate.forEach(recCat=>{
              setWeight(categorize.find(category=>category.id === recCat.id).items, recCat.weight)
            })
          }
        }else{
          // 若没有，去除 exclude 的番剧
          setWeight(items, 1, true)
        }
        if (hits.length > 0) {
          // 整理顺序
          hits.sort(()=>{return Math.random()-0.5})
          hits.sort((a,b)=>{return b.weight - a.weight})
          // 取出
          hits.slice(0, Math.max(parseInt(hits.length / 2), 6))
          rec.id = hits[Math.floor(Math.random() * hits.length)].id
          // 设置日期
          nextTime.setSeconds(0)
          nextTime.setMinutes(0)
          nextTime.setHours(0)
          rec.generationTime = nextTime.getTime()
          // 保存并返回结果
          db.set('recommendation', rec)
          return rec.id
        }else{
          rec.id = -1
          return -1
        }
      }
    }
  }
  // generateWeeklyRecommendation()

  // 报告启动信息：完成
  startupScreen.webContents.send('info',locales.get().startup_screen.ready)

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
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#202020' : '#f3f3f3',
    icon: './src/assets/icons/icon.ico',
    enableLargerThanScreen: false,
    webPreferences: {
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    }
  })
  global.win = win
  ipcMain.on('window:ready', ()=>{
    if (!initialized) {
      win.webContents.openDevTools()
      initialized = true
      win.maximize()
    }
    if (startupScreen) {
      startupScreen.close()
      startupScreen = null
    }
    win.focus()
  })
  // 载入
  /* fs.writeFile(path.join(__dirname, 'main.html'), layout('main',{db: db.store}), 'utf-8').then(()=>{
    win.loadFile('main.html')
  }) */
  win.loadFile('index.html')

  // 窗口行为
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
  win.on('resize', ()=>{
    win.webContents.send('window:size', win.isMaximized())
  })
  win.on('blur',()=>{
    win.webContents.send('window:isFocus', false)
  })
  win.on('focus',()=>{
    win.webContents.send('window:isFocus', true)
  })

  // 打开外部链接
  ipcMain.on('open:url',(_,url)=>{
    shell.openExternal(url)
  })

  // TEST
  // 监听 css 变更
  require('fs').watch('./src/css/style.css', ()=>{
    win.webContents.send('test:css')
  })
}

// 当程序就绪时
app.whenReady().then(() => {
  readyInit()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      readyInit()
    }
  })
})

// 当所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})