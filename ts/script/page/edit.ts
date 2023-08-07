import { SettingOption, SettingTemplate } from "../../ui/template";
import { SinglePageOptions } from "../page";
import { Bangumi, db } from "../db";
import { Dialog } from "../../ui/dialog";
import { locale } from "../locale";
import { Flyout } from "../../ui/flyout";
import template from "./edit.json";
import { element } from "../../helper/layout";

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

function closeTab(id: any) {
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
  setTimeout(() => {
    (target as any).body.remove();
  }, 100);
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
          },
        },
      ],
    });
    flyout.show(btn.getBoundingClientRect());
  });
}

function createTab(bangumi?: Bangumi) {
  let tabId: string | number | undefined = bangumi?.id;
  if (tabId === undefined) {
    tabId = Date.now();
  }

  let setting = new SettingTemplate(getEditTemplate(), bangumi);
  setting.element.classList.add('ui-width2');
  let tab = element('page/edit/tab', ['edit-tab', 'edit-tab-current']);
  let body = element('page/edit/body', ['edit-body', 'edit-body-current'], { bangumi });
  body.append(setting.element);

  let tabObject = {id: tabId, setting, tab, body, new: !bangumi, tabName: (tab.querySelector('.edit-tab-name') as HTMLDivElement)};
  tabs.set(tabId, tabObject);

  confirmHandler((body.querySelector('.edit-confirm') as HTMLButtonElement), tabObject);
  resetHandler((body.querySelector('.edit-reset') as HTMLButtonElement), tabObject);

  let closeBtn = (tab.querySelector('.edit-tab-close') as HTMLDivElement);
  closeBtn.addEventListener('click',()=>closeTab(tabId));
  tab.addEventListener('click',(ev)=>{
    if (ev.composedPath().includes(closeBtn)) return;
    switchTab({tab, body});
  });
  tab.addEventListener('mousedown',(ev)=>{
    if (ev.button !== 1) return;
    ev.preventDefault();
    closeTab(tabId);
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
    tabsElement = (element.querySelector('.edit-tabs') as HTMLDivElement);
    tabsElement.addEventListener('wheel',(ev)=>{
      tabsElement.scrollLeft += ev.deltaY;
    });
    bodysElement = (element.querySelector('.edit-bodys') as HTMLDivElement);
    addBtnElement = (tabsElement.querySelector('.edit-tab-add') as HTMLDivElement);
    addBtnElement.addEventListener('click',()=>{
      createTab();
      tabsElement.scrollLeft = tabsElement.scrollWidth;
    });
  },
  onBack(element, option) {
  },
  onOpen(element, option) {
    if (db.items[option]) createTab(db.items[option]);
    if (tabs.size > 0) return;
    createTab();
  },
};

export default page;
