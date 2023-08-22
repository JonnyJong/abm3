import { SinglePageOptions } from "../page";
import { db } from "../db";
import { Dialog, ErrorDialog } from "../../ui/dialog";
import { locale } from "../locale";
import { Flyout } from "../../ui/flyout";
import template from "./edit.json";
import { element } from "../../helper/layout";
import { timer } from "../../helper/timer";
import { VDOM, VDOMTemplate, VDiv, VImagePicker } from "../../ui/vdom";

function tagTip(key: string): string[] | void {
  return Object.keys(db.tags).filter((name)=>name.includes(key));
}
function categoryTip(key: string): string[] | void {
  return Object.keys(db.categories).filter((name)=>name.includes(key));
}

function getEditTemplate(): VDOMTemplate[] {
  (template as any)[1].body[0].autoComplete = tagTip;
  (template as any)[2].body[0].autoComplete = categoryTip;
  return (template as any);
}

type TabObject = {id: string | number, vdom: VDiv, tab: HTMLDivElement, body: HTMLDivElement, tabName: HTMLDivElement, new: boolean};
let tabs: Map<string | number, TabObject> = new Map();

let tabsElement: HTMLDivElement;
let bodysElement: HTMLDivElement;
let addBtnElement: HTMLDivElement;

async function scrollToCurrent() {
  await timer(100);
  let tab = tabsElement.querySelector<HTMLDivElement>('.edit-tab-current');
  if (!tab) return;
  tabsElement.scrollTo({left: tab.offsetLeft - tabsElement.offsetWidth / 2, behavior: 'smooth'});
}

function switchTab(current: {tab: HTMLDivElement, body: HTMLDivElement}) {
  tabsElement.querySelectorAll('.edit-tab-current').forEach((el)=>el.classList.remove('edit-tab-current'));
  bodysElement.querySelectorAll('.edit-body-current').forEach((el)=>el.classList.remove('edit-body-current'));
  current.tab.classList.add('edit-tab-current');
  current.body.classList.add('edit-body-current');
  scrollToCurrent();
}

async function closeTab(id: any) {
  let target = tabs.get(id);
  if (!target) return;
  let nextTab = target.tab.previousSibling || target.tab.nextSibling;
  if (tabs.size === 1) {
    createTab();
  } else if (target.tab.classList.contains('edit-tab-current')) {
    tabs.forEach((item)=>{
      if (item.tab !== nextTab) return;
      switchTab(item);
    });
  }
  tabs.delete(id);
  (target as any).tab.remove();
  await timer(100);
  (target as any).body.remove();
}

async function saveTab(btn: HTMLButtonElement, tab: TabObject) {
  btn.disabled = true;
  btn.innerHTML = '<ui-loader></ui-loader><ui-lang>edit.saving</ui-lang>';
  let id;
  let data = tab.vdom.data;
  data.updated = Date.now();
  if (typeof tab.id === 'number') {
    id = await db.createItem(data);
  } else if (db.items[tab.id]) {
    id = await db.items[tab.id].edit(data);
  } else {
    new ErrorDialog('<ui-lang>edit.bangumi_has_been_delete</ui-lang>', ()=>closeTab(tab.id));
    return;
  }
  tabs.delete(tab.id);
  tabs.set(id, tab);
  tab.id = id;
  tab.vdom = setVDOMInBody(tab.body, id);
  tab.tabName.textContent = db.items[tab.id].title;
  btn.innerHTML = '<i class="icon icon-Save"></i><ui-lang>edit.save</ui-lang>';
  btn.disabled = false;
}

function getItemValueForVDOM(id: any) {
  let value: any = {
    title: '',
    content: '',
    tags: [],
    categories: [],
    seasons: [{
      title: '',
      set: 0,
      watched: 0,
      cover: '',
      header: '',
      links: [],
    }],
  };
  if (id !== undefined && db.items[id]) {
    value = {
      title: db.items[id].title,
      content: db.items[id].content,
      tags: Array.from(db.items[id].tags),
      categories: Array.from(db.items[id].categories),
      seasons: db.items[id].seasons,
    };
  }
  return value;
}

function setVDOMInBody(body: HTMLDivElement, id?: string | number) {
  body.querySelector('.edit-main')?.remove();
  let value: any = getItemValueForVDOM(id);
  let vdom = VDOM.create<VDiv>({
    type: 'div',
    classList: ['ui-width2', 'edit-main'],
    children: getEditTemplate(),
  });
  vdom.data = value;

  setTimeout(() => {
    let headers = vdom.querySelectorAll('.edit-header') as VImagePicker[];
    let covers = vdom.querySelectorAll('.edit-season-info-cover ui-image-picker') as VImagePicker[];
    for (let i = 0; i < value.seasons.length; i++) {
      headers[i].default = value.seasons[i].header;
      covers[i].default = value.seasons[i].cover;
    }
  }, 100);
  
  body.append(vdom._element);
  return vdom;
}

function confirmHandler(btn: HTMLButtonElement, tab: TabObject) {
  btn.addEventListener('click',()=>{
    let dialog = new Dialog({
      title: locale.edit.confirm_before + tab.vdom.data.title + locale.edit.confirm_after,
      content: document.createElement('div'),
      buttons: [
        {
          text: locale.dialog.confirm,
          action: ()=>{
            dialog.close();
            saveTab(btn, tab);
          },
          level: 'confirm'
        },
        {
          text: locale.dialog.cancel,
          action: ()=>{
            dialog.close();
          },
        }
      ],
    });
    dialog.content.innerHTML = locale.edit.confirm_content;
    dialog.show();
  });
}
function resetHandler(btn: HTMLButtonElement, tab: TabObject) {
  btn.addEventListener('click',()=>{
    let flyout = new Flyout({
      content: locale.edit.reset_confirm,
      buttons: [
        {
          name: locale.edit.reset,
          action: ()=>{
            flyout.close();
            tab.vdom = getItemValueForVDOM(tab.id);
          },
        },
      ],
    });
    flyout.show(btn.getBoundingClientRect());
  });
}

function createTab(id?: string | number) {
  if (id === undefined) {
    id = Date.now();
  }

  let tab = element('page/edit/tab', ['edit-tab', 'edit-tab-current']);
  let body = element('page/edit/body', ['edit-body', 'edit-body-current'], { bangumi: db.items[id] });
  let vdom = setVDOMInBody(body, id);

  let tabObject = {id, vdom, tab, body, new: typeof id === 'number', tabName: tab.querySelector('.edit-tab-name') as HTMLDivElement};
  tabs.set(id, tabObject);
  if (db.items[id]) {
    tabObject.tabName.textContent = db.items[id].title;
  }

  confirmHandler(body.querySelector('.edit-confirm') as HTMLButtonElement, tabObject);
  resetHandler(body.querySelector('.edit-reset') as HTMLButtonElement, tabObject);

  let closeBtn = tab.querySelector('.edit-tab-close') as HTMLDivElement;
  closeBtn.addEventListener('click',()=>closeTab(tabObject.id));
  tab.addEventListener('click',(ev)=>{
    if (ev.composedPath().includes(closeBtn)) return;
    switchTab(tabObject);
  });
  tab.addEventListener('mousedown',(ev)=>{
    if (ev.button !== 1) return;
    ev.preventDefault();
    closeTab(tabObject.id);
  });

  addBtnElement.before(tab);
  bodysElement.append(body);
  switchTab(tabObject);
}

const page: SinglePageOptions = {
  name: 'edit',
  single: true,
  onCreate(element, option) {
    tabsElement = element.querySelector('.edit-tabs') as HTMLDivElement;
    tabsElement.addEventListener('wheel',(ev)=>{
      tabsElement.scrollLeft += ev.deltaY;
    });
    bodysElement = element.querySelector('.edit-bodys') as HTMLDivElement;
    addBtnElement = tabsElement.querySelector('.edit-tab-add') as HTMLDivElement;
    addBtnElement.addEventListener('click',()=>{
      createTab();
      tabsElement.scrollLeft = tabsElement.scrollWidth;
    });
  },
  onBack(element, option) {
    scrollToCurrent();
  },
  async onOpen(element, option) {
    await timer(150);
    scrollToCurrent();
    if (option !== undefined) {
      let target = tabs.get(option);
      if (target) {
        switchTab(target);
      } else {
        createTab(option);
      }
    };
    if (tabs.size > 0) return;
    createTab();
  },
};

export default page;
