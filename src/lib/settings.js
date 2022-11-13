'use strict'
const { app } = require('electron')
const store = require('electron-store')
const path = require('path')

class Settings {
  schema = {
    language: {
      type: 'string',
      default: app.getLocale(),
    },
    dataPath: {
      type: 'string',
      default: path.join(app.getPath('home'),'/.abm/'),
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
    searchExcludeMiss: {
      type: 'boolean',
      default: false,
    },
    recommendWithCatagorize: {
      type: 'boolean',
      default: false,
    },
    userAvatar: {
      type: 'string',
      default: './src/assets/defaultAvatar.bmp',
    },
    username: {
      type: 'string',
      default: '',
    },
  }
  constructor(){
    this.data = new store({
      name: 'settings',
      fileExtension: 'json',
      cwd: path.join(app.getPath('home'),'/.abm/'),
      schema: this.schema,
    })
  }
  get(key){
    return this.data.get(key)
  }
  set(key, value){
    return this.data.set(key, value)
  }
  store(){
    return this.data.store
  }
}

module.exports = Settings