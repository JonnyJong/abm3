'use strict'
// 窗口事件管理
const windowEvent = new (class{
  #missions = []
  add(event,fn) {
    if (typeof event === 'string' && event.length > 0 && typeof fn === 'function') {
      let ev = this.#missions.find(m=>m.event === event)
      if (ev) {
        if (ev.fns.findIndex(f=>f===fn) === -1) {
          ev.fns.push(fn)
          return fn
        }else{
          return null
        }
      }else{
        let mission = {event, fns:[fn]}
        this.#missions.push(mission)
        window.addEventListener(event,(ev)=>{
          mission.fns.forEach(e=>{
            setTimeout(() => {
              e(ev)
            }, 0)
          })
        })
      }
    }else{
      return null
    }
  }
  remove(event, fn) {
    let ev = this.#missions.find(m=>m.event === event)
    if (ev) {
      let missionIndex = ev.fns.findIndex(f=>f===fn)
      if (missionIndex === -1) {
        return null
      }else{
        ev.fns.splice(missionIndex, 1)
        return fn
      }
    }else{
      return null
    }
  }
})()
// 拖动处理
const dragEvent = new (class{
  // 初始化
  #missions = []
  #nowDraging = null
  #originX = 0
  #originY = 0
  #offsetX = 0
  #offsetY = 0
  // 拖动开始事件
  #pointerdown = (ev)=>{
    ev.composedPath().forEach(e=>{
      if (!this.#nowDraging) {
        let target = this.#missions.find(m=>m.element === e)
        if (target && target.option.dragable) {
          this.#nowDraging = target
          this.#originX = ev.layerX
          this.#originY = ev.layerY
          this.#offsetX = 0
          this.#offsetY = 0
        }
      }
    })
  }
  constructor(){
    // 拖动事件
    windowEvent.add('pointermove',(ev)=>{
      if (this.#nowDraging !== null) {
        // 计算边缘
        let elementRect = this.#nowDraging.element.getBoundingClientRect()
        let left = this.#nowDraging.option.left
        let right = 0
        let top = this.#nowDraging.option.top
        let bottom = 0
        let fixedX = 0
        let fixedY = 0
        if (this.#nowDraging.option.parent !== null) {
          let parentRect = this.#nowDraging.option.parent.getBoundingClientRect()
          if (this.#nowDraging.option.absolute) {
            fixedX = parentRect.left
            fixedY = parentRect.top
            right = parentRect.width - this.#nowDraging.option.right - elementRect.width
            bottom = parentRect.height - this.#nowDraging.option.bottom - elementRect.height
          }else{
            left += parentRect.left
            right = parentRect.right - this.#nowDraging.option.right - elementRect.width
            top += parentRect.top
            bottom = parentRect.bottom - this.#nowDraging.option.bottom - elementRect.height
          }
        }else{
          right = this.#nowDraging.option.right
          bottom = this.#nowDraging.option.bottom
        }
        // console.log({left,right,top,bottom})
        // 计算结果
        this.#offsetX = Math.max(left, Math.min(right, (ev.clientX - this.#originX - fixedX)))
        this.#offsetY = Math.max(top, Math.min(bottom, (ev.clientY - this.#originY - fixedY)))
        // 执行结果
        if (this.#nowDraging.option.left === Infinity || this.#nowDraging.option.right === -Infinity) {
          this.#offsetX = 0
        }else{
          this.#nowDraging.element.style.left = this.#offsetX + 'px'
        }
        if (this.#nowDraging.option.top === Infinity || this.#nowDraging.option.bottom === -Infinity) {
          this.#offsetY = 0
        }else{
          this.#nowDraging.element.style.top = this.#offsetY + 'px'
        }
        // 绑定的函数
        if (typeof this.#nowDraging.option.draging === 'function') {
          this.#nowDraging.option.draging({
            originX: this.#originX,
            originY: this.#originY,
            x: this.#offsetX,
            y: this.#offsetY,
            event: ev,
          })
        }
      }
    })
    // 拖动结束事件
    windowEvent.add('pointerup',(ev)=>{
      if (this.#nowDraging !== null) {
        if (typeof this.#nowDraging.option.draged === 'function') {
          this.#nowDraging.option.draged({
            originX: this.#originX,
            originY: this.#originY,
            x: this.#offsetX,
            y: this.#offsetY,
            event: ev,
          })
        }
        this.#nowDraging = null
      }
    })
  }
  // 添加
  add(element,option){
    option = Object.assign({
      left: -Infinity,
      right: Infinity,
      top: -Infinity,
      bottom: Infinity,
      parent: null,
      draging: null,
      draged: null,
      dragable: true,
      absolute: false,
    },option)
    if (this.#missions.findIndex(m=>m.element === element) === -1) {
      if (typeof option.draging !== 'function') {
        option.draging = null
      }
      if (typeof option.draged !== 'function') {
        option.draged = null
      }
      if (option.parent !== null) {
        if (typeof option.parent === 'string') {
          if (option.parent.length === 0) {
            option.parent = null
          }else{
            option.parent = document.querySelector(option.parent)
          }
        }else if (!option.parent instanceof HTMLElement) {
          option.parent = null
        }
      }
      this.#missions.push({element,option})
      element.addEventListener('pointerdown',this.#pointerdown)
      return {element,option}
    }else{
      return null
    }
  }
  // 移除
  remove(element){
    let index = this.#missions.findIndex(m=>m.element === element)
    if (index === -1) {
      return null
    }else{
      this.#missions.splice(index, 1)
      element.removeEventListener('pointerdown',this.#pointerdown)
      return element
    }
  }
  // 更新
  update(element,option){
    if (this.#missions.findIndex(m=>m.element === element) === -1) {
      return null
    }else{
      let target = this.#missions.find(m=>m.element === element)
      option = Object.assign(target.option,option)
      if (typeof option.draging !== 'function') {
        option.draging = null
      }
      if (typeof option.draged !== 'function') {
        option.draged = null
      }
      if (option.parent !== null) {
        if (typeof option.parent === 'string') {
          if (option.parent.length === 0) {
            option.parent = null
          }else{
            option.parent = document.querySelector(option.parent)
          }
        }else if (!option.parent instanceof HTMLElement) {
          option.parent = null
        }
      }
      target.option = option
      return {element,option}
    }
  }
})()
// 滚动条
class ScrollElement extends HTMLElement {
  #shadow
  #scrollbar
  #scrolltrack
  #scrollbox
  #target = null
  #draging = false
  #dragListener = ()=>{
    this.#draging = true
    this.#target.scrollTop = (this.#scrollbar.offsetTop - 6) / this.#scrollbar.offsetHeight * this.#target.scrollHeight
    this.#draging = false
    this.#scrollListener()
  }
  #scrollListener = ()=>{
    if (!this.#draging) {
      if (this.#target.offsetHeight === this.#target.scrollHeight) {
        this.#scrolltrack.classList.add('hide')
      }else{
        this.#scrolltrack.classList.remove('hide')
      }
      this.#scrollbar.style.height = this.#target.offsetHeight / this.#target.scrollHeight * 100 + '%'
      this.#scrollbar.style.top = this.#target.scrollTop / this.#target.scrollHeight * 100 + '%'
    }
  }
  constructor() {
    super()
    // 初始化
    this.#shadow = this.attachShadow({mode:'closed'})
    this.#scrollbar = document.createElement('div')
    this.#scrollbar.className = 'scrollbar'
    this.#scrolltrack = document.createElement('div')
    this.#scrolltrack.className = 'scrolltrack'
    this.#scrollbox = document.createElement('div')
    this.#scrollbox.className = 'scrollbox'
    this.#scrolltrack.appendChild(this.#scrollbar)
    this.#scrollbox.appendChild(this.#scrolltrack)
    this.#shadow.appendChild(this.#scrollbox)
    let style = document.createElement('style')
    style.textContent = `*{
      box-sizing: border-box;
    }
    .scrolltrack{
      left: 3px;
      position: absolute;
      width: calc(100% - 6px);
      height: calc(100% - 12px);
      top: 6px;
    }
    .scrollbar{
      left: 0px;
      position: absolute;
      min-height: min(50%, 20px);
      width: 100%;
      background: #0008;
      border-radius: 100vw;
    }
    .scrollbar:active{
      background: #000d;
    }
    .scrollbox{
      right: 0px;
      position: absolute;
      height: 100%;
      width: 8px;
      margin: 0 1px;
      border-radius: 100vw;
      transition: .1s width, .1s background, .1s opacity;
    }
    .scrollbox:active,
    .scrollbox:hover{
      background: #0004;
      width: 12px;
    }
    .hide{
      pointer-events: none;
      opacity: 0;
    }
    @media (prefers-color-scheme: dark){
      .scrollbar{
        background: #fff8;
      }
      .scrollbar:active{
        background: #fffd;
      }
      .scrollbox:active,
      .scrollbox:hover{
        background: #fff4;
      }
    }`
    this.#shadow.appendChild(style)
    // 设置目标
    if (this.hasAttribute('target')) {
      this.#target = document.querySelector(this.getAttribute('target'))
    }
    // 设置滚动条
    this.#scrollbox.addEventListener('wheel',(ev)=>{
      if (this.#target) {
        if (ev.deltaY > 0) {
          this.#target.scrollTop += 100
        }else{
          this.#target.scrollTop -= 100
        }
      }
    })
    dragEvent.add(this.#scrollbar, {left: Infinity, top:0, bottom: 0, parent: this.#scrolltrack, draging: this.#dragListener, absolute: true})
    if (this.#target) {
      this.#target.addEventListener('scroll', this.#scrollListener)
      this.#target.addEventListener('resize', this.#scrollListener)
      this.#scrollListener()
    }
    this.#scrollbox.addEventListener('click',(ev)=>{
      if (this.#target) {
        if (!ev.composedPath().includes(this.#scrollbar)) {
          this.#target.scrollTo({top: (ev.layerY - this.#scrollbar.offsetHeight / 2) / this.#scrollbox.offsetHeight * this.#target.scrollHeight, behavior: 'smooth'})
        }
      }
    })
  }
  // 获取滚动项
  get target() {
    return this.#target
  }
  // 设置滚动项
  set target(data) {
    if (this.#target) {
      this.#target.removeEventListener('scroll', this.#scrollListener)
      this.#target.removeEventListener('resize', this.#scrollListener)
    }
    if (data instanceof HTMLElement) {
      this.#target = data
    }else if (typeof data === 'string' && data.length > 0) {
      this.#target = document.querySelector(data)
    }else{
      this.#target = null
    }
    if (this.#target) {
      this.#target.addEventListener('scroll', this.#scrollListener)
      this.#target.addEventListener('resize', this.#scrollListener)
    }
    return this.#target
  }
  // 移除时
  disconnectedCallback() {
    dragEvent.remove(this.#scrollbar)
    if (this.hasAttribute('target')) {
      this.#target.removeEventListener('scroll', this.#scrollListener)
      this.#target.removeEventListener('resize', this.#scrollListener)
    }
  }
}
customElements.define('ui-scroll', ScrollElement)