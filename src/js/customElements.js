'use strict'
// 窗口事件管理
const windowEvent = new class{
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
  fire(event, ev) {
    let mission = this.#missions.find(m=>m.event === event)
    if (mission) {
      mission.fns.forEach(e=>{
        setTimeout(() => {
          e(ev)
        }, 0)
      })
    }
  }
}
// DOM 突变事件
const ObserverEvent = new class{
  #observer
  #event
  #active = (mutationList)=>{
    mutationList.forEach(({target})=>{
      if (target.hasAttribute('no-observer')) return
      target.dispatchEvent(this.#event)
    })
  }
  constructor() {
    this.#event = new Event('observer',{
      bubbles: true,
      cancelable: false,
      composed: true,
    })
    this.#observer = new MutationObserver(this.#active)
    this.#observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
}
// 获取元素
const getNode = (value)=>{
  if (value instanceof HTMLElement) {
    return value
  }else{
    try {
      return document.querySelector(value)
    } catch (error) {
      return null
    }
  }
}
// 获取路径
const getNodePath = (value)=>{
  let list = []
  if (!value) return list
  if (value instanceof Event) {
    value = value.target
  }
  if (value instanceof HTMLElement) {
    let target = value
    while (target.parentNode) {
      list.push(target)
      target = target.parentNode
    }
  }
  return list
}
// 获取元素位移参考系
const getNodeRefer = (element)=>{
  element = getNode(element)
  if (!element || Array.apply(null, document.querySelectorAll('body, html, head, head *')).find(e=>e === element)) return null
  let rect = element.getBoundingClientRect()
  let target = element.parentNode
  let targetRect
  let position = getComputedStyle(element).position
  let path = getNodePath(element)
  switch (position) {
    case 'fixed':
      return {node: element, position, x: rect.x, y: rect.y}
    case 'sticky':
    case 'absolute':
      /* 
        NOTE: Why don't use this?
          Because it doesn't run well on ShadowDOM and makes errors.
        while (target !== document.body && getComputedStyle(target).position !== 'static') {
          target = target.parentNode
        }
        This does not report an error, but the result of the calculation is not correct.
        In any case, if you use ShadowDOM, you should but nest two Nodes, 
        using "position" in addition to "static" in the outer layer, 
        and using "absolute" in the outer layer may also cause calculation errors.
        while (target.parentNode instanceof HTMLElement && target !== document.body && getComputedStyle(target).position !== 'static') {
          target = target.parentNode
        }
       */
      for (let i = 1; i < path.length; i++) {
        if (path[i] !== document.body && getComputedStyle(path[i]).position !== 'static') {
          target = path[i]
          break
        }
      }
      targetRect = target.getBoundingClientRect()
      return {node: target, position, x: rect.x - targetRect.x, y: rect.y - targetRect.y}
    case 'static':
      targetRect = target.getBoundingClientRect()
      return {node: target, position, x: rect.x - targetRect.x, y: rect.y - targetRect.y}
    case 'relative':
      let range = Array.apply(null, document.querySelectorAll('body, body>*'))
      /* 
        NOTE: This also.
        while (target.parentNode instanceof HTMLElement && !range.find(e=>e === target) && getComputedStyle(target).position === 'static') {
          target = target.parentNode
        } 
      */
      for (let i = 1; i < path.length; i++) {
        if (range.find(e=>e === path[i]) || getComputedStyle(path[i]).position !== 'static') {
          target = path[i]
          break
        }
      }
      targetRect = target.getBoundingClientRect()
      return {node: target, position, x: rect.x - targetRect.x, y: rect.y - targetRect.y}
  }
}
// 获取真实显示尺寸
const screenSize = new class{
  #width = 0
  #height = 0
  #calcSize = ()=>{
    let ele = document.createElement('div')
    ele.style.cssText = 'position:fixed;pointer-event:none;height:100vh;width:100vw;top:0;left:0;transition:none;animation:none;'
    document.body.appendChild(ele)
    this.#width = ele.offsetWidth
    this.#height = ele.offsetHeight
    ele.remove()
  }
  constructor(){
    this.#calcSize()
    windowEvent.add('resize',this.#calcSize)
  }
  get height(){
    return this.#height
  }
  get width(){
    return this.#width
  }
}
// 获取元素尺寸
const getBoundingMarginRect = (element)=>{
  element = getNode(element)
  if (!element) return null
  let rect = element.getBoundingClientRect()
  let { marginTop, marginRight, marginBottom, marginLeft } = getComputedStyle(element)
  return {
    height: rect.height + parseInt(marginTop) + parseInt(marginBottom),
    width: rect.width + parseInt(marginRight) + parseInt(marginLeft),
    bottom: rect.bottom + parseInt(marginBottom),
    top: rect.top - parseInt(marginTop),
    left: rect.left - parseInt(marginLeft),
    right: rect.right + parseInt(marginRight),
    x: rect.x - parseInt(marginLeft),
    y: rect.y - parseInt(marginTop),
  }
}
// 获取路径上所有元素的样式
const getNodeStyleOnPath = ()=>{}
// 拖动处理
const dragEvent = new class{
  // 初始化
  #defaultOption = {
    target: null,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    dragstart: null,
    draging: null,
    dragend: null,
    parent: null,
    trigger: null,
  }
  #missions = []
  #now = null
  #originX = 0
  #originY = 0
  #startX = 0
  #startY = 0
  #endX = 0
  #endY = 0
  // 回调
  #callback = (fn, ev)=>{
    try {
      fn({
        originX: this.#originX,
        originY: this.#originY,
        startX: this.#startX,
        startY: this.#startY,
        endX: this.#endX,
        endY: this.#endY,
        event: ev,
      })
    } catch (error) {}
  }
  // 鼠标按下时
  #pointerdown = (ev)=>{
    if (this.#now === null) {
      this.#now = this.#missions.find(m=>m.trigger === ev.target)
      let rect = this.#now.target.getBoundingClientRect()
      let refer = getNodeRefer(this.#now.target)
      let { x, y } = getBoundingMarginRect(this.#now.target)
      // 保存鼠标与元素左上角相对坐标
      this.#originX = ev.pageX - x
      this.#originY = ev.pageY - y
      // 保存元素与参考系相对坐标
      if (this.#now.parent) {
        let parentRect = this.#now.parent.getBoundingClientRect()
        this.#startX = rect.x - parentRect.x
        this.#startY = rect.y - parentRect.y
      }else{
        if (refer.position === 'sticky') {
          this.#startX = rect.x
          this.#startY = rect.y
        }else{
          this.#startX = refer.x
          this.#startY = refer.y
        }
      }
      // 重置移动后元素与参考系相对坐标
      this.#endX = this.#startX
      this.#endY = this.#startY
      // 执行回调
      this.#callback(this.#now.dragstart, ev)
    }
  }
  // 鼠标移动或页面滚动时
  #pointermove = (ev)=>{
    if (this.#now) {
      // 保存移动后元素与参考系相对坐标
      let rect = getBoundingMarginRect(this.#now.target) // 获取元素尺寸
      let refer = getNodeRefer(this.#now.target) // 获取坐标轴
      let parentRect = refer.node.getBoundingClientRect() // 相对坐标轴坐标 
      if (refer.position === 'fixed') { // 实际坐标轴坐标
        refer.width = screenSize.width
        refer.height = screenSize.height
        refer.left = 0
        refer.right = screenSize.width
        refer.top = 0
        refer.bottom = screenSize.height
        refer.x = 0
        refer.y = 0
        parentRect = refer
      }else{
        refer = parentRect
      }
      if (this.#now.parent) {
        parentRect = this.#now.parent.getBoundingClientRect() // 相对坐标轴坐标
      }
      /* 
        未限制的元素实际坐标（相对文档）
        ev.pageX - this.#originX
        ev.pageY - this.#originY
        已限制的元素实际坐标（相对文档）
        Math.max(parentRect.left + this.#now.left, Math.min(parentRect.right - this.#now.right - rect.width, ev.pageX - this.#originX))
        Math.max(parentRect.top + this.#now.top, Math.min(parentRect.bottom - this.#now.bottom - rect.height, ev.pageY - this.#originY))
        相对坐标轴位置
        Math.max(parentRect.left + this.#now.left, Math.min(parentRect.right - this.#now.right - rect.width, ev.pageX - this.#originX)) - parentRect.x
        Math.max(parentRect.top + this.#now.top, Math.min(parentRect.bottom - this.#now.bottom - rect.height, ev.pageY - this.#originY)) - parentRect.y
        相对坐标轴和实际坐标轴差值
        parentRect.x - refer.x
        parentRect.y - refer.y
       */
      this.#endX = Math.max(parentRect.left + this.#now.left, Math.min(parentRect.right - this.#now.right - rect.width, ev.pageX - this.#originX)) - parentRect.x // 原始位移，未修正
      this.#endY = Math.max(parentRect.top + this.#now.top, Math.min(parentRect.bottom - this.#now.bottom - rect.height, ev.pageY - this.#originY)) - parentRect.y
      // 设置元素位移
      this.#now.target.style.left = this.#endX + (parentRect.x - refer.x) + 'px' // 实际位移
      this.#now.target.style.top = this.#endY + (parentRect.y - refer.y) + 'px'
      // 执行回调
      this.#callback(this.#now.draging, ev)
    }
  }
  constructor(){
    // 鼠标移动时
    windowEvent.add('pointermove', this.#pointermove)
    // windowEvent.add('ui-scroll', this.#pointermove)
    // 鼠标松开时
    windowEvent.add('pointerup',(ev)=>{
      if (this.#now) {
        // 执行回调
        this.#callback(this.#now.dragend, ev)
        // 清理
        this.#now = null
      }
    })
  }
  // 添加 & 更新
  add(option){
    if (getNode(option) instanceof HTMLElement) {
      option = Object.assign({}, this.#defaultOption, {target: getNode(option)})
    }else if (typeof option === 'object' && getNode(option.target)) {
      option.target = getNode(option.target)
      option = Object.assign({}, this.#defaultOption, option)
    }else{
      return null
    }
    option.parent = getNode(option.parent)
    option.trigger = getNode(option.trigger) || option.target
    let old = this.#missions.find(m=>m.target === option.target)
    if (old) {
      old.trigger.removeEventListener('pointerdown',this.#pointerdown)
      old = Object.assign(old, option)
      option.trigger.addEventListener('pointerdown',this.#pointerdown)
    }else{
      this.#missions.push(option)
      option.trigger.addEventListener('pointerdown',this.#pointerdown)
    }
    return option
  }
  // 移除
  remove(target){
    let index = this.#missions.findIndex(m=>m.target === target)
    if (index === -1) {
      return null
    }else{
      this.#missions[index].trigger.removeEventListener('pointerdown',this.#pointerdown)
      this.#missions.splice(index, 1)
      return target
    }
  }
}
// 滚动条
class ScrollElement extends HTMLElement {
  #shadow
  #scrollbar
  #scrolltrack
  #scrollbox
  #target = null
  #scrollEvent = null
  #scrollTop = 0
  #wheelTimestamp = 0
  #dragListener = (ev)=>{
    this.#target.style.scrollBehavior = ''
    this.#target.scrollTop = ev.endY / (this.#scrolltrack.offsetHeight - this.#scrollbar.offsetHeight) * (this.#target.scrollHeight - this.#target.offsetHeight)
  }
  #scrollListener = ()=>{
    if (this.#target.offsetHeight === this.#target.scrollHeight) {
      this.#scrollbox.classList.add('hide')
    }else{
      this.#scrollbox.classList.remove('hide')
    }
    this.#scrollbar.style.height = this.#target.offsetHeight / this.#target.scrollHeight * this.#scrolltrack.offsetHeight + 'px'
    this.#scrollbar.style.top = this.#target.scrollTop / (this.#target.scrollHeight - this.#target.offsetHeight) * (this.#scrolltrack.offsetHeight - this.#scrollbar.offsetHeight) + 'px'
    if (typeof this.#scrollEvent === 'function') {
      this.#scrollEvent({scrollTop: this.#target.scrollTop, target: this.#target})
    }
  }
  #wheel = ()=>{
    if (Date.now() - this.#wheelTimestamp > 10) {
      this.#target.style.scrollBehavior = ''
      this.#scrollTop = null
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
      transition: .1s height, .05s top;
    }
    .scrollbar::before{
      content: '';
      position: absolute;
      width: calc(100% + 8px);
      height: calc(100% + 6px);
      left: -4px;
      top: -3px;
    }
    .scrollbar:active{
      background: #000d;
      transition: .1s height;
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
    .scrollbox::before{
      content: '';
      position: absolute;
      width: calc(100% + 1px);
      height: 100%;
      left: 0;
      top: 0;
    }
    .scrollbox:active,
    .scrollbox:hover{
      background: #0002;
      width: 12px;
      backdrop-filter: blur(12px)
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
    }else{
      this.#target = this.parentNode
    }
    // 设置滚动事件
    if (this.hasAttribute('event') && typeof window[this.getAttribute('event')] === 'function') {
      this.#scrollEvent = window[this.getAttribute('event')]
    }
    // 设置滚动条
    this.#scrollbox.addEventListener('wheel',(ev)=>{
      if (this.#target) {
        this.#wheelTimestamp = Date.now()
        if (ev.deltaY > 0) {
          this.#scrollTop = (this.#scrollTop || this.#target.scrollTop) + 200
        }else{
          this.#scrollTop = (this.#scrollTop || this.#target.scrollTop) - 200
        }
        this.#scrollTop = Math.max(0, Math.min(this.#scrollTop, this.#target.scrollHeight - this.#target.offsetHeight))
        this.#target.style.scrollBehavior = 'smooth'
        this.#target.scrollTop = this.#scrollTop
      }
    })
    windowEvent.add('resize', this.#scrollListener)
    dragEvent.add({target: this.#scrollbar, parent: this.#scrolltrack, draging: this.#dragListener})
    if (this.#target) {
      this.#target.addEventListener('scroll', this.#scrollListener)
      this.#target.addEventListener('observer', this.#scrollListener)
      this.#target.addEventListener('wheel', this.#wheel)
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
      this.#target.removeEventListener('observer', this.#scrollListener)
      this.#target.removeEventListener('wheel', this.#wheel)
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
      this.#target.addEventListener('observer', this.#scrollListener)
      this.#target.addEventListener('wheel', this.#wheel)
    }
    return this.#target
  }
  // 获取事件
  get event() {
    return this.#scrollEvent
  }
  // 设置事件
  set event(fn) {
    if (typeof fn === 'function') {
      this.#scrollEvent = fn
    }else{
      this.#scrollEvent = null
    }
    return this.#scrollEvent
  }
  // 移除时
  disconnectedCallback() {
    dragEvent.remove(this.#scrollbar)
    windowEvent.remove('resize', this.#scrollListener)
    if (this.hasAttribute('target')) {
      this.#target.removeEventListener('scroll', this.#scrollListener)
      this.#target.removeEventListener('observer', this.#scrollListener)
      this.#target.removeEventListener('wheel', this.#wheel)
    }
  }
  // 其他事件
  connectedCallback(){
    this.#scrollListener()
    dragEvent.add({target: this.#scrollbar, parent: this.#scrolltrack, draging: this.#dragListener})
  }
  adoptedCallback(){
    this.#scrollListener()
    dragEvent.add({target: this.#scrollbar, parent: this.#scrolltrack, draging: this.#dragListener})
  }
}
customElements.define('ui-scroll', ScrollElement)
// 自动关闭
windowEvent.add('click',(ev)=>{
  let list = getNodePath(ev)
  document.querySelectorAll('[auto-close]').forEach(e=>{
    if (!list.includes(e) && e.getAttribute('auto-close')) {
      e.classList.remove(e.getAttribute('auto-close'))
    }
  })
})
// 按键
const keyborad = (()=>{
  let lastKey = null
  let keyDown = 0
  windowEvent.add('keydown', ev=>{
    keyDown++
    if (lastKey !== null) {
      lastKey = 'NULL'
    }else{
      lastKey = ev.key
    }
  })
  windowEvent.add('keyup',(ev)=>{
    keyDown--
    if (lastKey === ev.key && keyDown === 0) {
      document.querySelectorAll(`[keyborad="${ev.key}"]`).forEach((e)=>e[e.getAttribute('keyborad-event')]())
    }
    if (keyDown < 1) {
      keyDown = 0
      lastKey = null
    }
  })
  windowEvent.add('blur',()=>{
    keyDown = 0
    lastKey = null
  })
})()
// 菜单
class MenuElement extends HTMLDivElement {
  #toggle = null
  constructor(){
    super()
    if (this.getAttribute('menu-toggle')) {
      if (document.querySelector(this.getAttribute('menu-toggle'))) {
        this.#toggle = document.querySelector(this.getAttribute('menu-toggle'))
      }
    }
    this.addEventListener('keydown',(ev)=>{
      let now = this.querySelector((this.classList.contains('menu-no-hover') ? '' : '.menu-item:hover, ') + '.menu-item:focus')
      let all = Array.apply(null, this.querySelectorAll('.menu-item'))
      this.classList.add('menu-no-hover')
      switch (ev.key) {
        case 'ArrowDown':
          if (now && all.length > 1) {
            if (all.indexOf(now) !== all.length - 1) {
              all[all.indexOf(now) + 1].focus()
            }else{
              all[0].focus()
            }
          }else if (all.length > 0) {
            all[0].focus()
          }
          break
        case 'ArrowUp':
          if (now && all.length > 1) {
            if (all.indexOf(now) !== 0) {
              all[all.indexOf(now) - 1].focus()
            }else{
              all[all.length - 1].focus()
            }
          }else if (all.length > 0) {
            all[all.length - 1].focus()
          }
          break
      }
    })
    this.addEventListener('pointermove',()=>{
      this.focus()
      this.classList.remove('menu-no-hover')
    })
    this.addEventListener('click',(ev)=>{
      if (this.#toggle) {
        let close = false
        getNodePath(ev).forEach(e => {
          if (e.classList && e.classList.contains('menu-item') && !e.disabled) {
            close = true
          }
        })
        if (close) {
          this.#toggle.classList.remove('menu-open')
        }
      }else{
        this.classList.remove('menu-open')
      }
    })
  }
  get toggle(){
    return this.#toggle
  }
  set toggle(value){
    if (value instanceof HTMLElement) {
      this.#toggle = value
    }else if (typeof value === 'string' && value.length > 0) {
      this.#toggle = document.querySelector(value)
    }else{
      this.#toggle = null
    }
    return this.#toggle
  }
}
customElements.define('ui-menu', MenuElement, {extends: 'div'})
// 数组
class ArrayElement extends HTMLElement {
  allowRepeat = true
  #input
  #placeholder = ''
  #setItems(value) {
    this.childNodes.forEach(e=>{
      if (e !== this.#input) {
        e.remove()
      }
    })
    value.forEach(e=>{
      this.#addItem(e)
    })
  }
  #addItem(e) {
    if (!this.allowRepeat && this.#getValue().includes(e)) return
    let el = document.createElement('div')
    el.className = 'array-item'
    el.textContent = e
    this.insertBefore(el, this.#input)
    return true
  }
  #removeItem(el) {
    if (el !== this && el !== this.#input) {
      el.remove()
    }
  }
  #getValue() {
    let value = []
    this.childNodes.forEach(e=>{
      if (e !== this.#input) {
        value.push(e.textContent)
      }
    })
    return value
  }
  constructor() {
    super()
    this.#input = document.createElement('input')
    this.appendChild(this.#input)
    if (this.hasAttribute('placeholder')) {
      this.placeholder = this.getAttribute('placeholder')
    }
    this.addEventListener('click',(ev)=>{
      this.#removeItem(ev.target)
    })
    this.addEventListener('keydown',(ev)=>{
      switch (ev.key) {
        case 'Enter':
          if (this.#input.value.length > 0) {
            this.#addItem(this.#input.value)
            this.#input.value = ''
          }
          break
        case 'Backspace':
        case 'Delete':
          if (this.#input.value.length === 0 && this.childNodes.length > 1) {
            this.#removeItem(this.#input.previousSibling)
          }
          break
      }
    })
    if (this.hasAttribute('no-repeat')) {
      this.allowRepeat = false
    }
  }
  get value(){
    return this.#getValue()
  }
  set value(data){
    let value = []
    if (typeof data === 'object' && data instanceof Array) {
      let allowTypes = ['boolean', 'number', 'bigint', 'string']
      data.forEach((v)=>{
        if (allowTypes.includes(typeof v) && !(!this.allowRepeat && value.includes(v))) {
          value.push(v)
        }
      })
    }
    this.#setItems(value)
    return value
  }
  get placeholder(){
    return this.#placeholder
  }
  set placeholder(value){
    this.#placeholder = String(value)
    this.#input.placeholder = this.#placeholder
    return this.#placeholder
  }
}
customElements.define('ui-array', ArrayElement)
// 排序
class SortElement extends HTMLElement {
  static get observedAttributes() {return ['style'] }
  #row = false
  #cell = Infinity
  #gap = {x:0, y:0}
  #style(lineItem, offset, padding){
    let inlineOffset = this.#row ? padding.left : padding.top
    lineItem.forEach((e)=>{
      let { width, height } = getBoundingMarginRect(e)
      if (this.#row) {
        e.style.top = offset + 'px'
        e.style.left = inlineOffset + 'px'
        inlineOffset += this.#gap.x + width
      }else{
        e.style.left = offset + 'px'
        e.style.top = inlineOffset + 'px'
        inlineOffset += this.#gap.y + height
      }
    })
  }
  #sort = ()=>{
    // 准备元素
    let child = Array.from(this.children).filter(e => e.tagName === 'UI-SORT-ITEM' && !e.hasAttribute('sorting'))
    // 样式
    let style = getComputedStyle(this)
    let padding = {top: parseFloat(style.paddingTop), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), left: parseFloat(style.paddingLeft)}
    let lineItem = []
    let lineSize = 0
    let offset = this.#row ? padding.top : padding.left
    let lineHeight = 0
    let lineWidth = 0
    let width = -this.#gap.x
    let height = -this.#gap.y
    let firstCell = true
    // 计算子元素样式
    child.forEach((e, i)=>{
      let rect = getBoundingMarginRect(e)
      lineItem.push(e)
      lineSize = Math.max(lineSize, this.#row ? rect.height : rect.width)
      lineHeight = this.#row ? lineSize : lineHeight + rect.height + (firstCell ? 0 : this.#gap.y)
      lineWidth = this.#row ? lineWidth + rect.width + (firstCell ? 0 : this.#gap.x) : lineSize
      firstCell = false
      if (i === child.length - 1) {
        this.#style(lineItem, offset, padding)
        height = this.#row ? height + lineHeight + this.#gap.y : Math.max(lineHeight, height)
        width = this.#row ? Math.max(lineWidth, width) : width + lineWidth + this.#gap.x
      } else if (lineItem.length >= this.#cell) {
        this.#style(lineItem, offset, padding)
        height = this.#row ? height + lineHeight + this.#gap.y : Math.max(lineHeight, height)
        width = this.#row ? Math.max(lineWidth, width) : width + lineWidth + this.#gap.x
        lineHeight = 0
        lineWidth = 0
        offset += lineSize + (this.#row ? this.#gap.y : this.#gap.x)
        lineSize = 0
        lineItem = []
        firstCell = true
      }
    })
    // 计算外部尺寸
    if (child.length > 0) {
      this.style.height = height + padding.top + padding.bottom + 'px'
      this.style.width = width + padding.left + padding.right + 'px'
    }else{
      this.style.height = 0
      this.style.width = 0
    }
  }
  constructor() {
    super()
    this.#row = this.hasAttribute('row')
    this.#cell = Math.max(parseInt(this.getAttribute('cell')), 1) || Infinity
    let gap = this.getAttribute('gap')
    if (gap) {
      gap = gap.split(' ')
      this.#gap.x = Math.max(parseFloat(gap[0]), 0) || 0
      this.#gap.y = this.#gap.x
      if (gap.length > 1) {
        this.#gap.y = Math.max(parseFloat(gap[1]), 0) || 0
      }
    }
    this.#sort()
    this.addEventListener('observer', this.sort)
    windowEvent.add('resize', this.#sort)
  }
  attributeChangedCallback(){
    this.#sort()
  }
  get row(){
    return this.#row
  }
  set row(value){
    this.#row = Boolean(value)
    this.#sort()
    return this.#row
  }
  get cell(){
    return this.#cell
  }
  set cell(value){
    this.#cell = Math.max(parseInt(value), 1) || Infinity
    this.#sort()
    return this.#cell
  }
  get gap(){
    return this.#gap
  }
  set gap(value){
    switch (typeof value) {
      case 'bigint':
      case 'number':
        this.#gap.x = Math.max(parseFloat(value), 0) || this.#gap.x
        this.#gap.y = Math.max(parseFloat(value), 0) || this.#gap.y
        break
      case 'string':
        value = value.split(' ')
        this.#gap.x = Math.max(parseFloat(value[0]), 0) || this.#gap.x
        this.#gap.y = Math.max(parseFloat(value[0]), 0) || this.#gap.y
        if (value.length > 1) {
          this.#gap.y = Math.max(parseFloat(value[1]), 0) || this.#gap.y
        }
        break
      case 'object':
        if (value instanceof Array) {
          this.#gap.x = Math.max(parseFloat(value[0]), 0) || this.#gap.x
          this.#gap.y = Math.max(parseFloat(value[0]), 0) || this.#gap.y
        }else{
          this.#gap.x = Math.max(parseFloat(value.x), 0) || this.#gap.x
          this.#gap.y = Math.max(parseFloat(value.y), 0) || this.#gap.y
        }
        break
    }
    this.#sort()
    return this.#gap
  }
  disconnectedCallback(){
    this.removeEventListener('observer', this.#sort)
    windowEvent.remove('resize', this.#sort)
  }
  sort = ()=>{
    return this.#sort()
  }
  connectedCallback(){
    this.sort()
  }
  adoptedCallback(){
    this.sort()
  }
}
customElements.define('ui-sort', SortElement)
class SortGrabElement extends HTMLElement {
  #clone
  #sortItem
  #sort
  #timeout
  #dragstart = ()=>{
    this.#clone = this.#sortItem.cloneNode(true)
    this.#clone.setAttribute('placeholder','')
    this.#sortItem.before(this.#clone)
    this.#sortItem.setAttribute('sorting','')
    this.#sortItem.setAttribute('no-observer','')
  }
  #timer = (ev)=>{
    if (this.#timeout) return
    this.#timeout = setTimeout(()=>{
      this.#draging(ev)
      this.#timeout = null
    },150)
  }
  #draging = (ev)=>{
    let all = Array.from(this.#sort.children).filter(e => e.tagName === 'UI-SORT-ITEM' && !e.hasAttribute('sorting') && !e.hasAttribute('no-sort'))
    let child = all.filter(e => !e.hasAttribute('placeholder'))
    let path = getNodePath(this.#sortItem)
    let rect = this.#sortItem.getBoundingClientRect()
    let x = rect.left + rect.width / 2
    let y = rect.top + rect.height / 2
    for (const e of child) {
      let eRect = e.getBoundingClientRect()
      if (x >= eRect.left && x <= eRect.right && y >= eRect.top && y <= eRect.bottom) {
        if (all.indexOf(this.#clone) < all.indexOf(e)) {
          e.after(this.#clone)
        }else{
          e.before(this.#clone)
        }
        break
      }
    }
    if (ev.event.y <= 50) {
      for (const e of path) {
        if (e.classList.contains('page')) {
          e.scrollTop -= 5
          break
        }
      }
    } else if (ev.event.y >= screenSize.height - 50) {
      for (const e of path) {
        if (e.classList.contains('page')) {
          e.scrollTop = Math.min(e.scrollTop + 5, e.scrollHeight - e.offsetHeight)
          break
        }
      }
    }
  }
  #dragend = ()=>{
    clearTimeout(this.#timeout)
    this.#timeout = null
    this.#clone.before(this.#sortItem)
    this.#clone.remove()
    this.#sortItem.removeAttribute('no-observer','')
    this.#sortItem.removeAttribute('sorting')
  }
  constructor() {
    super()
    this.reset()
  }
  reset(){
    dragEvent.remove(this.#sortItem)
    for (const node of getNodePath(this)) {
      if (node.tagName === 'UI-SORT-ITEM') {
        this.#sortItem = node
      }
      if (node.tagName === 'UI-SORT') {
        this.#sort = node
        break
      }
    }
    if (this.hasAttribute('inside')) {
      dragEvent.add({target: this.#sortItem, dragstart: this.#dragstart, draging: this.#timer, dragend: this.#dragend, trigger: this})
    }else{
      dragEvent.add({target: this.#sortItem, dragstart: this.#dragstart, draging: this.#timer, dragend: this.#dragend, trigger: this, top: -Infinity, left: -Infinity, right: -Infinity, bottom: -Infinity})
    }
  }
  adoptedCallback(){
    this.reset()
  }
  connectedCallback(){
    this.reset()
  }
  disconnectedCallback(){
    dragEvent.remove(this.#sortItem)
  }
}
customElements.define('ui-sort-grab', SortGrabElement)
// 多标签
class TabElement extends HTMLElement {
  #bar
  #add
  #addTab = ()=>{
    let item = this.#add.querySelector('ui-tab-item')
    let content = this.#add.querySelector('ui-tab-content')
    if (item && content) {
      this.#bar.append(item)
      this.#add.before(content)
      item.querySelector('.info').addEventListener('click', this.#click)
      item.querySelector('.close').addEventListener('click', this.#close)
      item.querySelector('.info').click()
    }
    this.#add.innerHTML = ''
    this.classList.remove('tab-empty')
  }
  #click = (ev)=>{
    if (ev.target.parentNode !== this.#bar.querySelector('.ui-tab-current')) {
      this.querySelectorAll('.ui-tab-current').forEach(e=>{
        e.classList.remove('ui-tab-current')
      })
      this.querySelector(`ui-tab-content[data-id="${ev.target.parentNode.dataset.id}"]`).classList.add('ui-tab-current')
      ev.target.parentNode.classList.add('ui-tab-current')
      let rect = ev.target.parentNode.getBoundingClientRect()
      this.style.setProperty('--left', rect.left - 10 + 'px')
      this.style.setProperty('--width', rect.width - 20 + 'px')
    }
  }
  #close = (ev)=>{
    let content = this.querySelector(`ui-tab-content[data-id="${ev.target.parentNode.dataset.id}"]`)
    let prev = ev.target.parentNode.previousSibling
    let next = ev.target.parentNode.nextSibling
    ev.target.parentNode.remove()
    if (prev) {
      prev.querySelector('.info').click()
    }else if (next) {
      next.querySelector('.info').click()
    }else{
      setTimeout(() => {
        this.style.setProperty('--width', '0px')
        this.classList.add('tab-empty')
      }, 100)
    }
    content.classList.remove('ui-tab-current')
    setTimeout(() => {
      content.remove()
    }, 100)
  }
  constructor() {
    super()
    this.#bar = document.createElement('ui-tab-bar')
    this.#add = document.createElement('ui-tab-add')
    this.append(this.#bar)
    this.append(this.#add)
    this.#add.addEventListener('observer', this.#addTab)
  }
  disconnectedCallback(){
    this.#add.addEventListener('observer', this.#addTab)
  }
}
customElements.define('ui-tab',TabElement)
// 聚光灯
class SpotlightElement extends HTMLElement {
  #pointermove = (ev)=>{
    let rect = this.getBoundingClientRect()
    this.style.setProperty("--x", ev.x - rect.x + "px")
    this.style.setProperty("--y", ev.y - rect.y + "px")
  }
  constructor(){
    super()
    windowEvent.add('pointermove',this.#pointermove)
  }
  disconnectedCallback(){
    windowEvent.remove('pointermove',this.#pointermove)
  }
}
customElements.define('ui-spotlight', SpotlightElement)