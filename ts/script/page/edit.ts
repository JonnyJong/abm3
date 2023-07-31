import { SettingOption, SettingTemplate } from "../../ui/template";
import { Page, PageOption } from "../page";
import { Bangumi } from "../db";

function tagTip(key: string): string[] | void {}
function categoryTip(key: string): string[] | void {}

function getEditTemplate(): SettingOption[] {
  return[
    {
      type: 'item',
      name: '<ui-lang>edit.title</ui-lang>',
      body: [],
      key: 'title',
      head: [
        {
          type: 'input',
          key: 'value',
          data: 'title',
        }
      ],
    },
    {
      type: 'item',
      name: '<ui-lang>edit.tags</ui-lang>',
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
              },
              {
                type: 'group',
                direction: 'row',
                key: 'cover_seasonInfo',
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

let tabs: Map<string| number, {setting: SettingTemplate, tab: HTMLDivElement, body: HTMLDivElement, tabName: HTMLDivElement}> = new Map();

let tabsElement: HTMLDivElement;
let bodysElement: HTMLDivElement;
let addBtnElement: HTMLDivElement;

function switchTab(current: {tab: HTMLDivElement, body: HTMLDivElement}) {
  tabsElement.querySelectorAll('.edit-tab-current').forEach((el)=>el.classList.remove('edit-tab-current'));
  bodysElement.querySelectorAll('.edit-body-current').forEach((el)=>el.classList.remove('edit-body-current'));
  current.tab.classList.add('edit-tab-current');
  current.body.classList.add('edit-body-current');
}

function createTab(bangumi?: Bangumi) {
  console.log('create');
  
  let tabId: string | number | undefined = bangumi?.id;
  if (tabId === undefined) {
    tabId = Date.now();
  }
  let setting = new SettingTemplate(getEditTemplate(), bangumi);
  let tab = document.createElement('div');
  tab.classList.add('edit-tab', 'edit-tab-current');
  tab.innerHTML = `<div class="edit-tab-name">${bangumi ? bangumi.title : '<ui-lang>edit.new</ui-lang>'}</div><div class="edit-tab-close"><div class="icon icon-Clear"></div></div>`;
  let tabName = (tab.querySelector('.edit-tab-name') as HTMLDivElement);
  let body = document.createElement('div');
  body.classList.add('edit-body','edit-body-current');
  body.append(setting.element);
  tabs.set(tabId, {setting, tab, tabName, body});
  tabsElement.querySelectorAll('.edit-tab-current').forEach((el)=>el.classList.remove('edit-tab-current'));
  bodysElement.querySelectorAll('.edit-body-current').forEach((el)=>el.classList.remove('edit-body-current'));
  addBtnElement.before(tab);
  bodysElement.append(body);
  let closeBtn = (tab.querySelector('.edit-tab-close') as HTMLDivElement);
  closeBtn.addEventListener('click',()=>{});
  tab.addEventListener('click',(ev)=>{
    if (ev.composedPath().includes(closeBtn)) return;
    switchTab({tab, body});
  });
}

function pageHandler(page: Page) {
  console.log('open');
  tabsElement = (page.element.querySelector('.edit-tabs') as HTMLDivElement);
  bodysElement = (page.element.querySelector('.edit-bodys') as HTMLDivElement);
  addBtnElement = (tabsElement.querySelector('.edit-tab-add') as HTMLDivElement);
  createTab();
}

const page: PageOption = {
  only: true,
  handler: pageHandler,
};

export default page;
