import { SettingOption, SettingTemplate } from "../../ui/template";
import { SinglePageOptions } from "../page";
import { db } from "../db";
import { Dialog, ErrorDialog } from "../../ui/dialog";
import { locale } from "../locale";
import { Flyout } from "../../ui/flyout";
import template from "./edit.json";
import { element } from "../../helper/layout";
import { timer } from "../../helper/timer";

function tagTip(key: string): string[] | void {
  return Object.keys(db.tags).filter((name)=>name.includes(key));
}
function categoryTip(key: string): string[] | void {
  return Object.keys(db.categories).filter((name)=>name.includes(key));
}

function getEditTemplate(): SettingOption[] {
  (template[1].body[0] as any).autoComplete = tagTip;
  (template[2].body[0] as any).autoComplete = categoryTip;
  return (template as any);
}

type TabObject = {id: string | number, setting: SettingTemplate, tab: HTMLDivElement, body: HTMLDivElement, tabName: HTMLDivElement, new: boolean};
let tabs: Map<string | number, TabObject> = new Map();

let tabsElement: HTMLDivElement;
let bodysElement: HTMLDivElement;
let addBtnElement: HTMLDivElement;

function switchTab(current: {tab: HTMLDivElement, body: HTMLDivElement}) {
  tabsElement.querySelectorAll('.edit-tab-current').forEach((el)=>el.classList.remove('edit-tab-current'));
  bodysElement.querySelectorAll('.edit-body-current').forEach((el)=>el.classList.remove('edit-body-current'));
  current.tab.classList.add('edit-tab-current');
  current.body.classList.add('edit-body-current');
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
      switchTab({tab: item.tab, body: item.body});
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
  let data = tab.setting.value;
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
  setSettingInBody(tab.body, id);
  tab.tabName.textContent = db.items[tab.id].title;
  btn.innerHTML = '<i class="icon icon-Save"></i><ui-lang>edit.save</ui-lang>';
  btn.disabled = false;
}

function setSettingInBody(body: HTMLDivElement, id?: string | number) {
  body.querySelector('.settings')?.remove();
  let value = undefined;
  if (id !== undefined && db.items[id]) {
    value = {
      title: db.items[id].title,
      content: db.items[id].content,
      tags: Array.from(db.items[id].tags),
      categories: Array.from(db.items[id].categories),
      seasons: db.items[id].seasons,
    };
  }
  let setting = new SettingTemplate(getEditTemplate(), value);
  setting.element.classList.add('ui-width2');
  body.append(setting.element);
  return setting;
}

function confirmHandler(btn: HTMLButtonElement, tab: TabObject) {
  btn.addEventListener('click',()=>{
    let dialog = new Dialog({
      title: locale.edit.confirm_before + tab.setting.get('title', 'value') + locale.edit.confirm_after,
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
            tab.setting = setSettingInBody(tab.body, tab.id);
          },
        },
      ],
    });
    flyout.show(btn.getBoundingClientRect());
  });
}

function createTab(id?: string | number) { // TODO: fix page.open('edit', 'g0')
  if (id === undefined) {
    id = Date.now();
  }

  let tab = element('page/edit/tab', ['edit-tab', 'edit-tab-current']);
  let body = element('page/edit/body', ['edit-body', 'edit-body-current'], { bangumi: db.items[id] });
  let setting = setSettingInBody(body, id);

  let tabObject = {id, setting, tab, body, new: typeof id === 'number', tabName: tab.querySelector('.edit-tab-name') as HTMLDivElement};
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
    switchTab({tab, body});
  });
  tab.addEventListener('mousedown',(ev)=>{
    if (ev.button !== 1) return;
    ev.preventDefault();
    closeTab(tabObject.id);
  });

  tabsElement.querySelectorAll('.edit-tab-current').forEach((el)=>el.classList.remove('edit-tab-current'));
  bodysElement.querySelectorAll('.edit-body-current').forEach((el)=>el.classList.remove('edit-body-current'));
  addBtnElement.before(tab);
  bodysElement.append(body);
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
  },
  onOpen(element, option) {
    if (option !== undefined) createTab(option);
    if (tabs.size > 0) return;
    createTab();
  },
};

export default page;
