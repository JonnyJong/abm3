'use strict'
const path = require('path')
const fs = require('fs/promises')
const https = require('https')

// 设置全局变量
const setGlobal = (name, value)=>{
  global[name] = value
}
// 获取图片后缀
const getImgSuffix = (data)=>{
  const imgBufHeaders = [
    { bufBegin: [0x42, 0x4d], suffix: 'bmp' },
    { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: 'gif' },
    { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: 'gif' },
    { bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: 'ico' },
    { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: 'jpg' },
    { bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], suffix: 'png' },
    { bufBegin: [0x3c, 0x73, 0x76, 0x67], suffix: 'svg' },
    { bufBegin: [0x49, 0x49], suffix: 'tif' },
    { bufBegin: [0x4d, 0x4d], suffix: 'tif' },
    { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: 'webp' },
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
// 保存图片
const getImg = (url, index, type, id)=>{
  let result
  let dir
  let msg = ''
  switch (type) {
    case 'cover':
      dir = '/covers/'
      break
    case 'header':
      dir = '/headers/'
      break
  }
  if (typeof url === 'string' && url.length > 0) {
    return new Promise((resolve)=>{
      resolve(fs.stat(url)) // 检查是否为本地文件
    }).then((stat)=>{
      if (stat.isFile()) {
        return
      }else{
        throw 'continue' // 不是本地文件，跳到复制阶段
      }
    }).then(()=>{
      return fs.readFile(url, 'binary')
    }).then((file)=>{
      let suffix = getImgSuffix(new Buffer.from(file, 'binary'))
      if (suffix.length === 0) {
        msg = 'local_file_no_image'
        throw 'error' // 不是图片文件抛出错误
      }else{
        result = `${id}_${index}.${suffix}`
        return fs.copyFile(url, path.join(global.settings.get('dataPath'), dir, result))
      }
    }).then((err)=>{
      if (err) {
        msg = 'can_not_copy_local_file'
        throw 'error' // 保存失败
      }else{
        throw 'done' // 保存成功
      }
    }).catch((err)=>{
      switch (err) {
        case 'continue':
          return
        case 'error':
          result = null
        case 'done':
          throw 'done'
        default:
          return
      }
    }).then(()=>{
      return new Promise((resolve,rejcet)=>{
        https.get(url,(res)=>{
          let data = ''
          res.setEncoding('binary')
          res.on('data', (chunk)=>{
            data += chunk
          })
          res.on('end',()=>{
            resolve(data)
          })
          res.on('error',(err)=>{
            msg = 'url_can_not_download'
            rejcet(err)
          })
        })
      })
    }).then((data)=>{
      let suffix = getImgSuffix(new Buffer.from(data, 'binary'))
      if (suffix.length === 0) {
        msg = 'url_not_a_image'
        throw 'error'
      }else{
        result = `${id}_${index}.${suffix}`
        return fs.writeFile(path.join(global.settings.get('dataPath'), dir, result), data, 'binary')
      }
    }).then((err)=>{
      if (err) {
        msg = 'url_can_not_save'
        throw 'error'
      }else{
        throw 'done'
      }
    }).catch((err)=>{
      switch (err) {
        case 'done':
          return {path: result, index, type, id, msg, error: false}
        default:
          return {path: null, index, type, msg, error: true}
      }
    })
  }else{
    return {path: null, index, type, msg, error: false}
  }
}
// 移除图片
const removeImg = (url)=>{
  return new Promise((resolve)=>{
    resolve(fs.unlink(path.join(global.settings.get('dataPath'), url)))
  }).then(()=>{return true},()=>{return false})
}
// 文本匹配
const textMatch = (keyword, content)=>{
  if (content.indexOf(keyword) > -1) {
    return 1
  }
  return 0
}
// 数据库格式
const DB_SCHEMA = {
  id: {
    type: 'object',
    properties: {
      item: {
        type: 'integer',
        default: 0,
      },
      tags: {
        type: 'integer',
        default: 0,
      },
      categorize: {
        type: 'integer',
        default: 0,
      },
    },
    default: {
      item: 0,
      tags: 0,
      categorize: 0,
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
        type: 'object',
        default: {
          "tags": [],
          "categorize": []
        },
      },
      exclude: {
        type: 'array',
        items: {
          type: 'integer',
        },
        default: [],
      }
    },
    default: {
      generationTime: 0,
      id: -1,
      weights: {
        "tags": [],
        "categorize": []
      },
      exclude: [],
    },
  },
  favorites: {
    type: 'array',
    default: [],
  },
  finished: {
    type: 'object',
    properties: {
      categoryId: {
        type: 'number',
        default: -1,
      },
      count: {
        type: 'number',
        default: 0,
      },
    },
    default: {
      categoryId: -1,
      count: 0,
    },
  },
  payable: {
    type: 'object',
    properties: {
      categoryId: {
        type: 'number',
        default: -1,
      },
      count: {
        type: 'number',
        default: 0,
      },
    },
    default: {
      categoryId: -1,
      count: 0,
    },
  }
}
// 创建资源文件夹
const initAssetsDir = ()=>{
  const dirs = ['covers', 'headers', 'startup_images', 'plugins']
  dirs.forEach((dir)=>{
    fs.readdir(path.join(settings.get('dataPath'), `/${dir}/`)).catch(()=>{
      return fs.mkdir(path.join(settings.get('dataPath'), `/${dir}/`))
    }).catch((error)=>{
      console.error(error)
    })
  })
}
// 模板函数
const layout = {
  helpers : {
    getItemImg: (item)=>{
      let cover = []
      let header = []
      let current = null
      let forward = ()=>{
        cover.forEach((c, i)=>{
          if (c === null) {
            cover[i] = current
          }else{
            current = c
          }
          if (header[i] === null) {
            header[i] = current
          }
        })
        cover.reverse()
        header.reverse()
      }
      item.seasons.forEach((season, i)=>{
        cover.push(season.cover ? path.join(settings.get('dataPath'), '/covers/', season.cover) : null)
        header.push(season.header ? path.join(settings.get('dataPath'), '/headers/', season.header) : cover[i])
        if (cover[i] === null) {
          cover[i] = header[i]
        }
      })
      forward()
      forward()
      cover.forEach((c, i)=>{
        if (c === null) {
          cover[i] = './src/assets/defaultCover.png'
        }
        if (header[i] === null) {
          header[i] = './src/assets/defaultCover.png'
        }
      })
      return {cover, header}
    },
    getRealSrc: (src, type)=>{
      switch (type) {
        case 'header':
          type = '/headers/'
          break
        case 'cover':
          type = '/covers/'
          break
      }
      return path.join(settings.get('dataPath'), type, src)
    },
    markdown: (data)=>{
      return data
    },
  },
  get: ()=>{
    return layout.helpers
  },
  register: (name, helper)=>{
    layout.helpers[name] = helper
  }
}


module.exports = {
  setGlobal,
  DB_SCHEMA,
  getImg,
  removeImg,
  textMatch,
  initAssetsDir,
  layout,
}