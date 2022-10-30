'use strict'
const editUI = (e,type)=>{
  switch (type) {
    case 'confirm':
      let item = {seasons:[]}
      item.id = parseInt(e.dataset.id)
      item.title = e.querySelector('#item-title').value
      item.tags = e.querySelector('#item-tags').value
      item.categorize = e.querySelector('#item-categorize').value
      item.content = e.querySelector('#item-content').value
      e.querySelectorAll('#item-season').forEach(s=>{
        let season = {links:[]}
        season.title = s.querySelector('#item-season-title').value
        season.cover = s.querySelector('#item-season-cover').value
        season.header = s.querySelector('#item-season-header').value
        season.set = parseInt(s.querySelector('#item-season-set').value) || null
        season.finished = parseInt(s.querySelector('#item-season-finished').value) || null
        s.querySelectorAll('#item-season-link').forEach(l=>{
          season.links.push({url: l.querySelector('#item-season-url').value, name: l.querySelector('#item-season-url-name').value})
        })
        item.seasons.push(season)
      })
      editUIHelper(item,type)
      break
    default:
      editUIHelper(e,type)
      break
  }
}
DOMObserver.on(()=>{
  if (document.querySelector('.page-edit ui-tab-content')) {
    document.querySelector('.page-edit ui-tab').classList.remove('tab-empty')
  }else{
    document.querySelector('.page-edit ui-tab').classList.add('tab-empty')
  }
})