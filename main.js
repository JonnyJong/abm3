'use strict'
// 引入模块
const { app, BrowserWindow, ipcMain, nativeTheme, systemPreferences } = require('electron')
const fs = require('fs')
const https = require('https')
const path = require('path')
const pug = require('pug')
const store = require('electron-store')
const packageJson = require('./package.json')
const build = 74
let win = null
let startupScreen = null
let db = null
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
const settings = (()=>{
  let data = new store({
    name: 'settings',
    fileExtension: 'json',
    cwd: path.join(app.getPath('home'),'/abm/'),
    schema: {
      language: {
        type: 'string',
        default: app.getLocale(),
      },
      dataPath: {
        type: 'string',
        default: path.join(app.getPath('home'),'/abm/'),
      },
      itemPrePage: {
        type: 'number',
        default: 48,
        minimum: 1,
      },
      autoRemoveEmptyTag: {
        type: 'boolean',
        default: false,
      },
      autoRemoveEmptyCategory: {
        type: 'boolean',
        default: false,
      },
      searchWeightBalance: {
        type: 'boolean',
        default: false,
      },
      searchExcludeMiss: {
        type: 'boolean',
        default: false,
      },
      recommendWithCatagorize: {
        type: 'boolean',
        default: false,
      },
      recommendTagsWeights: {
        type: 'array',
        default: [],
      },
      recommendCategorizeWeights: {
        type: 'array',
        default: [],
      },
      recommendExcludeItems: {
        type: 'array',
        default: [],
      },
      recommendFavoriteWeight: {
        type: 'number',
        default: 1,
        minimum: 0,
      },
      userAvatar: {
        type: 'string',
        default: './src/assets/defaultAvatar.bmp',
      },
      username: {
        type: 'string',
        default: '',
      },
    },
  })
  return{
    get:(key)=>{return data.get(key)},
    set:(key, value)=>{return data.set(key, value)},
    store:()=>{return data.store}
  }
})()

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
          onclick: '',
        }
      ],
    },
    {
      items: [
        {
          name: 'user.menu.add_item',
          icon: 'icon icon-add',
          onclick: '',
        },
      ]
    },
    {
      items: [
        {
          name: 'user.menu.edit_item',
          icon: 'icon icon-edit',
          onclick: '',
        },
        {
          name: 'user.menu.delete_item',
          icon: 'icon icon-delete',
          onclick: '',
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
      version: packageJson.version,
      build: build,
      config: CONFIG,
    },
    system: {
      accentColor: systemPreferences.getAccentColor().slice(0, 6),
      accentColorWithAlpha: systemPreferences.getAccentColor(),
    },
    settings: settings.store(),
    getLangByKey: (key)=>{return locales.get(key)},
  }, option)
  return pug.renderFile((`./src/layout/${name}.pug`), option)
}

// 初始化
const readyInit = ()=>{
  startupScreen = new BrowserWindow({
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
}
const init = ()=>{
  // 报告启动信息：加载数据库
  startupScreen.webContents.send('info',locales.get().startup_screen.loading_database)

  // 数据库
  db = new store({
    name: 'database',
    fileExtension: 'json',
    cwd: settings.get('dataPath'),
    schema: {
      id: {
        type: 'object',
        properties: {
          item: {
            type: 'integer',
            default: 0,
          },
          tag: {
            type: 'integer',
            default: 0,
          },
          category: {
            type: 'integer',
            default: 0,
          },
        },
        default: {
          item: 0,
          tag: 0,
          category: 0,
        },
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
        },
        default: [],
      },
      tags: {
        type: 'array',
        items: {
          type: 'object',
        },
        default: [],
      },
      categorize: {
        type: 'array',
        items: {
          type: 'object',
        },
        default: [],
      },
      recommendation: {
        type: 'object',
        properties: {
          generationTime: {
            type: 'number',
            default: 0,
          },
          id: {
            type: 'integer',
            default: -1
          },
          weights: {
            type: 'array',
            default: [],
          },
        },
        default: {
          generationTime: 0,
          id: -1,
          weights: [],
        },
      },
      favorites: {
        type: 'array',
        default: [],
      },
    },
  })

  // 报告启动信息：初始化功能
  startupScreen.webContents.send('info',locales.get().startup_screen.init_method)

  // 保存图片
  const getImgSuffix = (data)=>{
    const imgBufHeaders = [
      { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
      { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
      { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
      { bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: '.ico' },
      { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpg' },
      { bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], suffix: '.png' },
      { bufBegin: [0x3c, 0x73, 0x76, 0x67], suffix: '.svg' },
      { bufBegin: [0x49, 0x49], suffix: '.tif' },
      { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
      { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.webp' },
    ]
    for (const imgBufHeader of imgBufHeaders) {
      let isEqual
      if (imgBufHeader.bufBegin) {
        const buf = Buffer.from(imgBufHeader.bufBegin)
        isEqual = buf.equals(
          data.slice(0, imgBufHeader.bufBegin.length)
        )
      }
      if (isEqual && imgBufHeader.bufEnd) {
        const buf = Buffer.from(imgBufHeader.bufEnd)
        isEqual = buf.equals(data.slice(-imgBufHeader.bufEnd.length))
      }
      if (isEqual) {
        return imgBufHeader.suffix
      }
    }
    return ''
  }
  const saveImg = (url, type, label) => {
    https.get(url, (res)=>{
      let data = ''
      res.setEncoding('binary')
      res.on('data', (chunk)=>{
        data += chunk
      })
      res.on('end', ()=>{
        let suffix = getImgSuffix(new Buffer.from(data, 'binary'))
        if (suffix.length === 0) {
          return ''
        }else{
          fs.writeFile(path.join(settings.get('dataPath'), (type ? '/covers/' : '/headers/'), `${label}${suffix}`), data, 'binary', (error=>{
            if (error) {
              return ''
            }else{
              return `${label}${suffix}`
            }
          }))
        }
      })
    })
  }

  // 模板
  ipcMain.handle('layout:get', (event, name, option)=>{
    option = Object.assign({
      db: db.store,
    }, option)
    return layout(name, option)
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
  // 文本匹配
  const textMatch = (keyword, content)=>{
    if (content.indexOf(keyword) > -1) {
      return 1
    }else{
      return 0
    }
  }
  // 通过标签或归类 id 获取番剧
  const getItemsByTagIdOrCategoryId = (id, type)=>{
    let items = db.get('items')
    let obj = db.get(type).find(obj=>obj.id === parseInt(id))
    let reuslt = []
    if (obj) {
      obj.items.forEach(itemId=>{
        reuslt.push(items.find(item=>item.id === itemId))
      })
    }
    return reuslt
  }
  // 获取数据库
  ipcMain.handle('db:get', () => {
    return db.store
  })
  // 获取所有番剧
  ipcMain.handle('db:getAllItems', () => {
    return db.store.items
  })
  // 通过 id 获取番剧
  ipcMain.handle('db:getItemById', (id) => {
    return db.store.items.find(item=>item.id === parseInt(id))
  })
  // 通过标签 id 获取番剧
  ipcMain.handle('db:getItemsByTagId', (id) => {
    return getItemsByTagIdOrCategoryId(id, 'tags')
  })
  // 通过归类 id 获取番剧
  ipcMain.handle('db:getItemsByCategoryId', (id) => {
    return getItemsByTagIdOrCategoryId(id, 'categorize')
  })
  // 获取所有标签
  ipcMain.handle('db:getAllTags', () => {
    return db.store.tags
  })
  // 获取所有归类
  ipcMain.handle('db:getAllCategorize', () => {
    return db.store.categorize
  })
  // 获取页面
  ipcMain.handle('db:getPage', (page) => {
    page = parseInt(page)
    if (!page) {
      page = 0
    }
    return db.store.items.slice(settings.get('itemPrePage') * page, settings.get('itemPrePage') * (page + 1))
  })
  // 获取相关番剧
  ipcMain.handle('db:getRelated',(id)=>{
    let item = db.store.items.find(item=>item.id === parseInt(id))
    let hits = []
    let result = []
    if (item && item.tags.length > 0) {
      item.tags.forEach(tagId=>{
        db.tags.find(tag=>tag.id == tagId).items.forEach(itemId=>{
          let hit = hits.findIndex(hit=>hit.id === itemId)
          if (hit > -1) {
            hits[hit].weight++
          }else{
            hits.push({id:itemId, weight: 1})
          }
        })
      })
      hits.sort(()=>{return Math.random() - 0.5})
      hits.sort((a,b)=>{return b.weight - a.weight})
      hits.forEach(hit=>{
        result.push(db.store.items.find(item=>item.id === hit.id))
      })
    }
    return result
  })
  // 搜索番剧
  ipcMain.handle('db:search', (option) => {
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
          let titleMatchResult = textMatch(keyword, item.title)
          let contentMatchResult = textMatch(keyword, item.content)
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
  // 添加番剧
  ipcMain.handle('db:addItem', (data) => {
    // 若番剧中未定义季，返回 null
    if (!data.seasons || data.seasons.length === 0) {
      return null
    }
    // 初始化番剧对象
    let item = {
      id: db.get('id.item'),
      title: String(data.title),
      content: String(data.content),
      favorite: false,
      stars: 0,
      tags: [],
      categorize: [],
      seasons: [],
    }
    let seasonId = 0
    // 分配 id
    db.set('id.item', db.get('id.item')++)
    // 设置标签
    if (data.tags && data.tags.length > 0) {
      data.tag = Array.from(new Set(data.tag))
      let tags = db.get('tags')
      data.tags.forEach(tagName=>{
        let oldTag = tags.find(tag=>tag.name === tagName)
        if (oldTag) {
          oldTag.items.push(item.id)
        }else{
          tags.push({id: db.get('id.tag'), name: tagName, items: [item.id]})
          db.set('id.tag', db.get('id.tag')++)
        }
      })
      db.set('tags', tags)
    }
    // 设置分类
    if (data.categorize && data.categorize.length > 0) {
      data.categorize = Array.from(new Set(data.categorize))
      let categorize = db.get('categorize')
      data.categorize.forEach(categoryName=>{
        let oldCategory = categorize.find(category=>category.name === categoryName)
        if (oldCategory) {
          oldCategory.items.push(item.id)
        }else{
          categorize.push({id: db.get('id.category'), name: categoryName, items: [item.id]})
          db.set('id.category', db.get('id.category')++)
        }
      })
      db.set('categorize', categorize)
    }
    // 设置季
    data.seasons.forEach(season=>{
      let newSeason = {
        title: String(season.title),
        cover: '',
        header: '',
        links: [],
      }
      if (parseInt(season.set) === NaN) {
        newSeason.set = 1
      }else{
        newSeason.set = Math.min(parseInt(season.set), 1)
      }
      if (parseInt(season.finished) === NaN) {
        newSeason.finished = 0
      }else{
        newSeason.finished = Math.min(parseInt(season.finished), 0)
      }
      if (typeof season.cover === 'string' && season.cover.length > 0) {
        newSeason.cover = saveImg(season.cover, true, `${item.id}_${seasonId}`)
      }
      if (typeof season.header === 'string' && season.header.length > 0) {
        newSeason.header = saveImg(season.header, false, `${item.id}_${seasonId}`)
      }
      if (season.links && season.links.length === 0) {
        season.links.forEach(link=>{
          newSeason.links.push({name: String(link.name), url: String(link.url)})
        })
      }
      seasonId++
      item.seasons.push(newSeason)
    })
    // 保存并返回番剧 id
    let items = db.get('items')
    items.push(item)
    db.set('items', items)
    return item.id
  })
  // 设置番剧
  ipcMain.handle('db:setItem', (id, data) => {
    let items = db.get('items')
    let tags = db.get('tags')
    let categorize = db.get('categorize')
    let newId = db.get('id')
    let item = items.find(item=>item.id === id)
    if (item && data.seasons.length > 0) {
      item.title = String(data.title)
      item.content = String(data.content)
      // 设置标签
      let newItemTags = []
      data.tags.forEach(tagName=>{
        tagName = String(tagName)
        let tag = tags.find(tag=>tag.name === tagName)
        if (tag) {
          if (item.tags.indexOf(tag.id) === -1) {
            newItemTags.push(tag.id)
            tag.items.push(item.id)
          }
        }else{
          newItemTags.push(newId.tag)
          tags.push({id:newId.tag, name: tagName, items: item.id})
          newId.tag++
        }
      })
      item.tags = newItemTags
      db.set('tags', tags)
      // 设置分类
      let newItemCategorize = []
      data.categorize.forEach(categorizeName=>{
        categorizeName = String(categorizeName)
        let category = categorize.find(category=>category.name === categorizeName)
        if (category) {
          if (item.categorize.indexOf(category.id) === -1) {
            newItemCategorize.push(category.id)
            category.items.push(item.id)
          }
        }else{
          newItemCategorize.push(newId.category)
          categorize.push({id:newId.category, name: categorizeName, items: item.id})
          newId.category++
        }
      })
      item.categorize = newItemCategorize
      db.set('categorize', categorize)
      db.set('id',newId)
      // 设置季
      let seasonId = 0
      let newSeasons = []
      data.seasons.forEach(season=>{
        let newSeason = {
          title: String(season.title),
          cover: '',
          header: '',
          links: [],
        }
        if (parseInt(season.set) === NaN) {
          newSeason.set = 1
        }else{
          newSeason.set = Math.min(parseInt(season.set), 1)
        }
        if (parseInt(season.finished) === NaN) {
          newSeason.finished = 0
        }else{
          newSeason.finished = Math.min(parseInt(season.finished), 0)
        }
        if (!item.seasons[seasonId] || item.seasons[seasonId].cover !== season.cover) {
          if (typeof season.cover === 'string' && season.cover.length > 0) {
            newSeason.cover = saveImg(season.cover, true, `${item.id}_${seasonId}`)
          } else if (item.seasons[seasonId] || item.seasons[seasonId].cover) {
            fs.unlink(path.join(settings.get('dataPath'), '/covers/', item.seasons[seasonId].cover))
          }
        }
        if (!item.seasons[seasonId] || item.seasons[seasonId].header !== season.header) {
          if (typeof season.header === 'string' && season.header.length > 0) {
            newSeason.header = saveImg(season.header, false, `${item.id}_${seasonId}`)
          } else if (item.seasons[seasonId] || item.seasons[seasonId].header) {
            fs.unlink(path.join(settings.get('dataPath'), '/header/', item.seasons[seasonId].header))
          }
        }
        if (season.links && season.links.length === 0) {
          season.links.forEach(link=>{
            newSeason.links.push({name: String(link.name), url: String(link.url)})
          })
        }
        seasonId++
        newSeasons.push(newSeason)
      })
      if (item.seasons.length > data.seasons.length) {
        for (; i < item.seasons.length; seasonId++) {
          const season = item.seasons[seasonId]
          if (season.cover.length > 0) {
            fs.unlink(path.join(settings.get('dataPath'), '/covers/', season.cover))
          }
          if (season.header.length > 0) {
            fs.unlink(path.join(settings.get('dataPath'), '/header/', season.header))
          }
        }
      }
      item.seasons = newSeasons
      // 保存结果并返回 true
      db.set('items', items)
      return true
    }else{
      // 不存在此番剧或没有设置季返回 false
      return false
    }
  })
  // 设置番剧喜爱或未喜爱
  ipcMain.handle('db:setItemFavorite', (id, data) => {
    let items = db.get('items')
    let favorites = db.get('favorites')
    let item = items.find(item=>item.id === id)
    let itemIndex = favorites.findIndex(itemId=>itemId === item.id)
    if (item) {
      item.favorite = data
      if (data && itemIndex == -1) {
        favorites.push(item.id)
      }else if (!data && itemIndex > -1) {
        favorites = favorites.splice(itemIndex, 1)
      }
      db.set('favorites', favorites)
      db.set('items', items)
      return true
    }else{
      return false
    }
  })
  // 设置番剧分级
  ipcMain.handle('db:setItemStars', (id, data) => {
    let items = db.get('items')
    let item = items.find(item=>item.id === id)
    let stars = parseInt(data)
    if (item) {
      if (!stars || stars < 0) {
        stars = 0
      }
      item.stars = stars
      db.set('items', items)
      return true
    }else{
      return false
    }
  })
  // 设置标签名称
  ipcMain.handle('db:setTag', (id, name) => {
    return setTagOrCategory(id, name, 'tags')
  })
  // 设置分类名称
  ipcMain.handle('db:setCategory', (id, name) => {
    return setTagOrCategory(id, name, 'categorize')
  })
  // 合并标签
  ipcMain.handle('db:mergeTag', (mainId, margedId)=>{
    return margeTagOrCategory(mainId, margedId, 'tags')
  })
  // 合并分类
  ipcMain.handle('db:mergeCategory', (mainId, margedId)=>{
    return margeTagOrCategory(mainId, margedId, 'categorize')
  })
  // 删除番剧
  ipcMain.handle('db:removeItem', (id) => {
    let items = db.get('items')
    let itemIndex = items.findIndex(item=>item.id === id)
    let item = items[itemIndex]
    if (itemIndex === -1) {
      // 若未找到番剧返回 false
      return false
    }else{
      let tags = db.get('tags')
      let categorize = db.get('categorize')
      let favorites = db.get('favorites')
      // 设置标签
      item.tags.forEach(tagId=>{
        let target = tags.find(tag=>tag.id === tagId)
        target = target.splice(target.items.findIndex(itemId=>itemId === id), 1)
      })
      // 设置分类
      item.categorize.forEach(categoryId=>{
        let target = categorize.find(category=>category.id === categoryId)
        target = target.splice(target.items.findIndex(itemId=>itemId === id), 1)
      })
      db.set('tags', tags)
      db.set('categorize', categorize)
      // 设置喜爱
      if (item.favorite) {
        favorites = favorites.splice(favorites.findIndex(item.id), 1)
        db.set('favorites', favorites)
      }
      // 设置季，移除封面文件
      items.seasons.forEach(season=>{
        if (season.cover.length > 0) {
          fs.unlink(path.join(settings.get('dataPath'), '/covers/', season.cover))
        }
        if (season.header.length > 0) {
          fs.unlink(path.join(settings.get('dataPath'), '/header/', season.header))
        }
      })
      // 保存结果并返回 true
      items = items.splice(itemIndex, 1)
      db.set('items', items)
      return true
    }
  })
  // 移除标签
  ipcMain.handle('db:removeTag', (id) => {
    return removeTagOrCategory(id, 'tags')
  })
  // 移除分类
  ipcMain.handle('db:removeCategory', (id) => {
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
    let recTags = settings.get('recommendTagsWeights')
    let recCate = settings.get('recommendCategorizeWeights')
    let exclude = settings.get('recommendExcludeItems')
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
          rec.id = hits[Math.floor(Math.random() * hits.length)]
          // 设置日期
          nextTime.setSeconds(0)
          nextTime.setMinutes(0)
          nextTime.setHours(0)
          rec.generationTime = nextTime.getTime()
          // 保存并返回结果
          db.get('recommendation', rec)
          return rec.id
        }else{
          rec.id = -1
          return -1
        }
      }
    }
  }
  generateWeeklyRecommendation()

  // 报告启动信息：完成
  startupScreen.webContents.send('info',locales.get().startup_screen.ready)

  // 主窗口
  win = new BrowserWindow({
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
    icon: './src/assets/icons/icon.ico',
    enableLargerThanScreen: false,
    webPreferences: {
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })
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
