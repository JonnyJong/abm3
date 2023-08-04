import { SettingOption, SettingTemplate } from "../../ui/template";
import { SinglePageOptions } from "../page";
import { Bangumi } from "../db";
import { Dialog } from "../../ui/dialog";
import { locale } from "../locale";
import { Flyout } from "../../ui/flyout";

function tagTip(key: string): string[] | void {}
function categoryTip(key: string): string[] | void {}

function getEditTemplate(): SettingOption[] {
  return[
    {
      type: 'item',
      name: '<ui-lang>edit.title</ui-lang>',
      icon: 'FullAlpha',
      body: [],
      key: 'title',
      head: [
        {
          type: 'input',
          key: 'value',
          data: 'title',
          classList: ['edit-title'],
        }
      ],
    },
    {
      type: 'item',
      name: '<ui-lang>edit.tags</ui-lang>',
      icon: 'Tag',
      head: [],
      key: 'tags',
      body: [
        {
          type: 'tags',
          key: 'value',
          autoComplete: tagTip,
          data: 'tags',
        }
      ],
    },
    {
      type: 'item',
      name: '<ui-lang>edit.categories</ui-lang>',
      icon: 'Folder',
      head: [],
      key: 'cateories',
      body: [
        {
          type: 'tags',
          key: 'value',
          autoComplete: categoryTip,
          data: 'categories',
        }
      ],
    },
    {
      type: 'item',
      name: '<ui-lang>edit.markdown</ui-lang>',
      icon: 'AlignLeft',
      head: [],
      key: 'content',
      body: [
        {
          type: 'textarea',
          key: 'value',
          data: 'content',
        }
      ],
    },
    {
      type: 'item',
      name: '<ui-lang>edit.seasons</ui-lang>',
      icon: 'AllApps',
      head: [],
      key: 'seasons',
      body: [
        {
          type: 'list',
          key: 'list',
          data: 'seasons',
          inline: false,
          template: {
            type: 'group',
            direction: 'column',
            key: 'value',
            items: [
              {
                type: 'image',
                key: 'header',
                data: 'header',
                classList: ['edit-header'],
              },
              {
                type: 'group',
                direction: 'row',
                key: 'cover_seasonInfo',
                classList: ['edit-season-info-cover'],
                items: [
                  {
                    type: 'image',
                    key: 'cover',
                    data: 'cover',
                  },
                  {
                    type: 'group',
                    key: 'seasonInfo',
                    direction: 'column',
                    classList: ['edit-season-info'],
                    items: [
                      {
                        type: 'text',
                        text: '<ui-lang>edit.title</ui-lang>',
                        key: 'title_text'
                      },
                      {
                        type: 'input',
                        key: 'title',
                        data: 'title',
                      },
                      {
                        type: 'text',
                        text: '<ui-lang>edit.set</ui-lang>',
                        key: 'title_text'
                      },
                      {
                        type: 'number',
                        key: 'set',
                        data: 'set',
                        min: 0,
                        step: 1,
                        max: Infinity,
                      },
                      {
                        type: 'text',
                        text: '<ui-lang>edit.watched</ui-lang>',
                        key: 'title_text'
                      },
                      {
                        type: 'number',
                        key: 'watched',
                        data: 'watched',
                        min: 0,
                        step: 1,
                        max: Infinity,
                      },
                      {
                        type: 'text',
                        text: '<ui-lang class="edit-link-title">edit.links</ui-lang><ui-lang class="edit-link-name">edit.links_name</ui-lang><ui-lang>edit.links_url</ui-lang>',
                        key: 'links_text'
                      },
                      {
                        type: 'list',
                        key: 'links',
                        data: 'links',
                        inline: true,
                        template: {
                          type: 'group',
                          direction: 'row',
                          key: 'value',
                          items: [
                            {
                              type: 'input',
                              key: 'name',
                              data: 'name',
                              classList: ['edit-link-name'],
                            },
                            {
                              type: 'input',
                              key: 'url',
                              data: 'url',
                              classList: ['edit-links-url'],
                            },
                          ],
                        },
                      }
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    }
  ];
}

let tabs: Map<string | number, {setting: SettingTemplate, tab: HTMLDivElement, body: HTMLDivElement, tabName: HTMLDivElement, new: boolean}> = new Map();

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

function createTab(bangumi?: Bangumi) {
  let tabId: string | number | undefined = bangumi?.id;
  if (tabId === undefined) {
    tabId = Date.now();
  }
  let setting = new SettingTemplate(getEditTemplate(), bangumi);
  setting.element.classList.add('ui-width2');
  let control = document.createElement('div');
  control.classList.add('edit-control', 'ui-width2');
  let btnConfirm = document.createElement('button');
  btnConfirm.classList.add('btn-accent');
  btnConfirm.innerHTML = '<i class="icon icon-Save"></i><ui-lang>edit.save</ui-lang>';
  btnConfirm.addEventListener('click',()=>{
    let dialog = new Dialog({
      title: locale.edit.confirm_before + setting.get('title', 'value') + locale.edit.confirm_after,
      content: document.createElement('div'),
      buttons: [
        {
          text: locale.dialog.confirm,
          action: ()=>{
            dialog.close();
          },
          level: 'confirm',
        },
        {
          text: locale.dialog.cancel,
          action: ()=>{
            dialog.close();
          },
        },
      ],
    });
    dialog.content.innerHTML = locale.edit.confirm_content;
    dialog.show();
  });
  let btnUndo = document.createElement('button');
  btnUndo.innerHTML = '<i class="icon icon-Undo"></i><ui-lang>edit.undo</ui-lang>';
  btnUndo.addEventListener('click',()=>{
    let flyout = new Flyout({
      content: locale.edit.undo_confirm,
      buttons: [
        {
          name: locale.edit.undo,
          action: ()=>{
            flyout.close();
          },
        },
      ],
    });
    flyout.show(btnUndo.getBoundingClientRect());
  });
  control.append(btnConfirm, btnUndo);
  let tab = document.createElement('div');
  tab.classList.add('edit-tab', 'edit-tab-current');
  tab.innerHTML = `<div class="edit-tab-name">${bangumi ? bangumi.title : '<ui-lang>edit.new</ui-lang>'}</div><div class="edit-tab-close"><div class="icon icon-Clear"></div></div>`;
  let tabName = (tab.querySelector('.edit-tab-name') as HTMLDivElement);
  let body = document.createElement('div');
  body.classList.add('edit-body','edit-body-current');
  body.append(control, setting.element);
  tabs.set(tabId, {setting, tab, tabName, body, new: !bangumi});
  tabsElement.querySelectorAll('.edit-tab-current').forEach((el)=>el.classList.remove('edit-tab-current'));
  bodysElement.querySelectorAll('.edit-body-current').forEach((el)=>el.classList.remove('edit-body-current'));
  addBtnElement.before(tab);
  bodysElement.append(body);
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
    if (tabs.size > 0) return;
    createTab();
  },
};

export default page;
