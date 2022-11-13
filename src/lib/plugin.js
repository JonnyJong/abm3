'use strict'
const { app } = require('electron')
const { Worker } = require('worker_threads')
const path = require('path')

class Plugin {
  constructor(dir){
    app.on('quit',()=>{
      // TODO: Stop all the plugin
    })
  }
}
module.exports = Plugin