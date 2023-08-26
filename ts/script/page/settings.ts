import { ipcRenderer } from "electron";
import { getLocaleList, lang } from "../locale";
import { SinglePageOptions } from "../page";
import { SettingsPage, backup, restore, settings } from "../settings";
import { VColor, VDOM, VDOMTemplate, VDiv, VIcon, VImagePicker, VInput, VNumber, VSelect, VSettingItemTemplate, VSwitch } from "../../ui/vdom";
import { UIIcon } from "../../ui/icon";
import { UIColor } from "../../ui/color";
import { Dialog, ErrorDialog } from "../../ui/dialog";
import { timer } from "../../helper/timer";
import { db } from "../db";
import { saveZip, saveInFolder, getZip } from "../../helper/dialog";
import { checkUpdate } from "../update";
import { license, third_party, developer } from "./settings.json"

let pageListElement: HTMLDivElement;
let pageBodysElement: HTMLDivElement;
let pageListIndicator: HTMLDivElement;

function createPage(page: SettingsPage) {
  let tab = document.createElement('div');
  tab.className = 'settings-tab';
  let icon = document.createElement('ui-icon') as UIIcon;
  if (page.icon) {
    icon = VDOM.create<VIcon>(page.icon)._element;
  }
  tab.append(icon, VDOM.create(page.name)._element);
  let body = document.createElement('div');
  body.className = 'settings-body';
  let bodyName = VDOM.create(page.name)._element;
  bodyName.classList.add('settings-body-name');
  body.append(bodyName);
  let content = VDOM.create<VDiv>({
    type: 'div',
    children: page.template,
  });
  content.className = 'settings-content';
  body.append(content._element);
  pageListElement.append(tab);
  pageBodysElement.append(body);
  tab.addEventListener('click',()=>{
    if (tab.classList.contains('settings-tab-current')) return;
    pageListElement.querySelectorAll('.settings-tab-current').forEach((e)=>e.classList.remove('settings-tab-current'));
    tab.classList.add('settings-tab-current');
    pageBodysElement.querySelectorAll('.settings-body-current').forEach((e)=>e.classList.remove('settings-body-current'));
    body.classList.add('settings-body-current');
    pageListIndicator.style.top = tab.offsetTop + 10 + 'px';
  });
  return content;
}

async function initSettingsGeneral() {
  const general: SettingsPage = {
    name: {
      type: 'lang',
      key: 'settings.general',
    },
    icon: {
      type: 'icon',
      key: 'Settings',
    },
    template: [
      {
        type: 'lang',
        key: 'settings.personalized',
      },
      {
        type: 'div',
        classList: ['settings-user'],
        children: [
          {
            type: 'image-picker',
            classList: ['setting-user-avatar'],
            value: settings.getAvatar(),
            events: {
              change: ({target})=>{
                if ((target as VImagePicker).error) return;
                settings.setAvatar((target as VImagePicker).value);
                (document.querySelector('.user-avatar') as HTMLImageElement).src = (target as VImagePicker).value;
              },
            },
          },
          {
            type: 'input',
            classList: ['setting-user-name'],
            value: settings.getUsername(),
            placeholder: 'Akari~~',
            events: {
              change: ({target})=>{
                settings.setUsername((target as VInput).value);
              },
              keydown: (ev)=>{
                if ((ev as any).key === 'Enter') {
                  (ev.target as VInput).blur();
                  return;
                }
                if ((ev as any).key === 'Escape') {
                  (ev.target as VInput).value = settings.getUsername();
                  (ev.target as VInput).blur();
                }
              },
            }
          },
        ],
      },
      {
        type: 'setting',
        icon: {
          type: 'icon',
          key: 'DarkTheme'
        },
        name: [{
          type: 'lang',
          key: 'settings.theme.title',
        }],
        head: [{
          type: 'select',
          value: settings.getTheme(),
          values: [
            {
              name: lang('settings.theme.system'),
              value: 'system',
            },
            {
              name: lang('settings.theme.light'),
              value: 'light',
            },
            {
              name: lang('settings.theme.dark'),
              value: 'dark',
            },
          ],
          events: {
            change: ({target})=>{
              settings.setTheme((target as VSelect).value);
            },
          },
        }],
      },
      {
        type: 'setting',
        icon: {
          type: 'icon',
          key: 'Color'
        },
        name: [{
          type: 'lang',
          key: 'settings.theme_color',
        }],
        head: [
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.use_system_color',
            }],
            events: {
              click: ()=>{
                settings.setThemeColor('system');
                (document.querySelectorAll('.settings-theme-color') as unknown as UIColor[]).forEach((e)=>e.value = settings.getThemeColor());
              },
            },
          },
          {
            type: 'color',
            dataKey: 'themeColor',
            value: settings.getThemeColor(),
            classList: ['settings-theme-color'],
            events: {
              change: ({target})=>{
                settings.setThemeColor((target as VColor).value);
              },
            },
          },
        ],
      },
      {
        type: 'lang',
        key: 'settings.application',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.language',
        }],
        icon: {
          type: 'icon',
          key: 'LocaleLanguage',
        },
        head: [{
          type: 'select',
          dataKey: 'locale',
          values: await getLocaleList(),
          value: settings.getLocale(),
          events: {
            change: async ({target})=>{
              await settings.setLocale((target as VSelect).value);
            },
          },
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.reset_settings.title',
        }],
        description: [{
          type: 'lang',
          key: 'settings.reset_settings.description',
        }],
        icon: {
          type: 'icon',
          key: 'Warning',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.reset_settings.button',
            events: {
              click: ()=>{
                let content = document.createElement('ui-lang');
                content.textContent = 'settings.reset_settings.dialog.content';
                let dialog = new Dialog({
                  title: lang('settings.reset_settings.dialog.title'),
                  content,
                  buttons: [
                    {
                      text: lang('dialog.confirm'),
                      level: 'danger',
                      action: async ()=>{
                        dialog.close();
                        await settings.reset();
                        let tip = new Dialog({
                          title: lang('settings.reset_settings.before_relaunch'),
                          content: document.createElement('div'),
                          buttons: [],
                        });
                        tip.show();
                        await timer(1000);
                        location.reload();
                      },
                    },
                    {
                      text: lang('dialog.cancel'),
                      action: ()=>{
                        dialog.close();
                      },
                    },
                  ],
                });
                dialog.show();
              },
            },
          }],
        }],
      },
    ],
  };
  createPage(general);
  pageListElement.children[1].classList.add('settings-tab-current');
  pageBodysElement.children[0].classList.add('settings-body-current');
}

async function initSettingsDatabase() {
  function DBToList(value: {[x: string]: any}) {
    let list: {id: string, value: any}[] = [];
    for (const id of Object.keys(value)) {
      list.push({id, value: value[id]});
    }
    return list;
  }

  function ListToDB(list: {id: string, value: any}[]) {
    let value: {[x: string]: any} = {};
    for (const item of list) {
      if (item.id === undefined) continue;
      value[item.id] = item.value;
    }
    return value;
  }

  function dbToSelect(obj: any, withNone?: boolean) {
    let list: {name: string, value: any}[] = [];
    if (withNone) {
      list.push({name: '<ui-lang>settings.special_categories.none</ui-lang>', value: null});
    }
    for (const key of Object.keys(obj)) {
      list.push({name: key, value: key});
    }
    return list;
  }

  let content: VDiv;

  const database: SettingsPage = {
    name: {
      type: 'lang',
      key: 'settings.database',
    },
    icon: {
      type: 'icon',
      key: 'Database',
    },
    template: [
      {
        type: 'lang',
        key: 'settings.mark.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.mark.category',
        }],
        icon: {
          type: 'icon',
          key: 'Archive',
        },
        head: [{
          type: 'button',
          children: [
            {
              type: 'icon',
              key: 'Save',
            },
            {
              type: 'lang',
              key: 'settings.save',
            },
          ],
          events: {
            click: async ()=>{
              db.mark.categories = ListToDB(content.querySelectorAll('[settings-data="mark.categories"]')[0].data.mark.categories);
              await db.save();
              window.dispatchEvent(new Event('db'));
              ;
            },
          },
        }],
        body: [{
          type: 'list',
          dataKey: 'mark.categories',
          attribute: {'settings-data': 'mark.categories'},
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'mark-category',
              classList: ['settings-select'],
              attribute: {select: 'categories'},
              placeholder: lang('settings.select_category'),
              values: dbToSelect(db.categories),
            },
            {
              type: 'color',
              dataKey: 'value',
              value: '#888888',
            },
          ],
          value: DBToList(db.mark.categories),
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.mark.tag',
        }],
        icon: {
          type: 'icon',
          key: 'Tag',
        },
        head: [{
          type: 'button',
          children: [
            {
              type: 'icon',
              key: 'Save',
            },
            {
              type: 'lang',
              key: 'settings.save',
            },
          ],
          events: {
            click: async ()=>{
              db.mark.tags = ListToDB(content.querySelectorAll('[settings-data="mark.tags"]')[0].data.mark.tags);
              await db.save();
              window.dispatchEvent(new Event('db'));
              ;
            },
          },
        }],
        body: [{
          type: 'list',
          dataKey: 'mark.tags',
          attribute: {'settings-data': 'mark.tags'},
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'mark-tags',
              classList: ['settings-select'],
              attribute: {select: 'tags'},
              placeholder: lang('settings.select_tag'),
              values: dbToSelect(db.tags),
            },
            {
              type: 'color',
              dataKey: 'value',
              value: '#888888',
            },
          ],
          value: DBToList(db.mark.tags),
        }],
      },
      {
        type: 'lang',
        key: 'settings.rcmd_weights.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.rcmd_weights.category',
        }],
        icon: {
          type: 'icon',
          key: 'Archive',
        },
        head: [{
          type: 'button',
          children: [
            {
              type: 'icon',
              key: 'Save',
            },
            {
              type: 'lang',
              key: 'settings.save',
            },
          ],
          events: {
            click: async ()=>{
              db.recommendation.weights.categories = ListToDB(content.querySelectorAll('[settings-data="rcmd.categories"]')[0].data.recommendation.weights.categories);
              await db.save();
              window.dispatchEvent(new Event('db'));
              ;
            },
          },
        }],
        body: [{
          type: 'list',
          dataKey: 'recommendation.weights.categories',
          attribute: {'settings-data': 'rcmd.categories'},
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'rcmd-category',
              classList: ['settings-select'],
              attribute: {select: 'categories'},
              placeholder: lang('settings.select_category'),
              values: dbToSelect(db.categories),
            },
            {
              type: 'number',
              dataKey: 'value',
              value: 0,
              step: 1,
            },
          ],
          value: DBToList(db.recommendation.weights.categories),
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.rcmd_weights.tag',
        }],
        icon: {
          type: 'icon',
          key: 'Tag',
        },
        head: [{
          type: 'button',
          children: [
            {
              type: 'icon',
              key: 'Save',
            },
            {
              type: 'lang',
              key: 'settings.save',
            },
          ],
          events: {
            click: async ()=>{
              db.recommendation.weights.tags = ListToDB(content.querySelectorAll('[settings-data="rcmd.tags"]')[0].data.recommendation.weights.tags);
              await db.save();
              window.dispatchEvent(new Event('db'));
              ;
            },
          },
        }],
        body: [{
          type: 'list',
          dataKey: 'recommendation.weights.tags',
          attribute: {'settings-data': 'rcmd.tags'},
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'rcmd-tag',
              classList: ['settings-select'],
              attribute: {select: 'tags'},
              placeholder: lang('settings.select_tag'),
              values: dbToSelect(db.tags),
            },
            {
              type: 'number',
              dataKey: 'value',
              value: 0,
              step: 1,
            },
          ],
          value: DBToList(db.recommendation.weights.tags),
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.rcmd_weights.favorite',
        }],
        icon: {
          type: 'icon',
          key: 'Heart',
        },
        head: [{
          type: 'number',
          dataKey: 'recommendation.weights.favorites',
          value: 1,
          step: 1,
          events: {
            change: async ({target})=>{
              db.recommendation.weights.favorites = (target as VNumber).value;
              await db.save();
              window.dispatchEvent(new Event('db'));
            },
          },
        }],
      },
      {
        type: 'lang',
        key: 'settings.special_categories.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.special_categories.watched',
        }],
        icon: {
          type: 'icon',
          key: 'Completed',
        },
        head: [{
          type: 'select',
          dataKey: 'specialCategory.watched',
          attribute: {select: 'categories', 'select-with-none': 'true'},
          values: dbToSelect(db.categories, true),
          value: db.specialCategory.watched,
          events: {
            change: async ({target})=>{
              db.specialCategory.watched = (target as VSelect).value;
              await db.save();
              window.dispatchEvent(new Event('db'));
            },
          },
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.special_categories.pay',
        }],
        icon: {
          type: 'icon',
          key: 'Money',
        },
        head: [{
          type: 'select',
          dataKey: 'specialCategory.pay',
          attribute: {select: 'categories', 'select-with-none': 'true'},
          values: dbToSelect(db.categories, true),
          value: db.specialCategory.payable,
          events: {
            change: async ({target})=>{
              db.specialCategory.payable = (target as VSelect).value;
              await db.save();
              window.dispatchEvent(new Event('db'));
            },
          },
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.special_categories.serialized',
        }],
        icon: {
          type: 'icon',
          key: 'Play',
        },
        head: [{
          type: 'select',
          dataKey: 'specialCategory.serialized',
          attribute: {select: 'categories', 'select-with-none': 'true'},
          values: dbToSelect(db.categories, true),
          value: db.specialCategory.serialized,
          events: {
            change: async ({target})=>{
              db.specialCategory.serialized = (target as VSelect).value;
              await db.save();
              window.dispatchEvent(new Event('db'));
            },
          },
        }],
      },
      {
        type: 'lang',
        key: 'settings.archive.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.archive.rename.category',
        }],
        icon: {
          type: 'icon',
          key: 'Rename',
        },
        head: [
          {
            type: 'select',
            placeholder: lang('settings.select_category'),
            values: dbToSelect(db.categories),
            attribute: {'setting-data': 'rename.category.target', select: 'categories'},
            events: {
              change: ({target})=>{
                let input = (content.querySelectorAll('[setting-data="rename.category.value"]')[0] as VInput);
                let btn = content.querySelectorAll('[setting-data="rename.category.action"]')[0];
                if (typeof (target as VSelect).value !== 'string') {
                  input.disabled = true;
                  input.value = '';
                  btn.disabled = true;
                  return;
                }
                input.disabled = false;
              },
            },
          },
          {
            type: 'input',
            attribute: {'setting-data': 'rename.category.value'},
            disabled: true,
            events: {
              input: ({target})=>{
                let btn = content.querySelectorAll('[setting-data="rename.category.action"]')[0];
                if ((target as VInput).value === '' || Object.keys(db.categories).includes((target as VInput).value)) {
                  btn.disabled = true;
                  return;
                }
                btn.disabled = false;
              },
            },
          },
          {
            type: 'button',
            attribute: {'setting-data': 'rename.category.action'},
            disabled: true,
            children: [{
              type: 'lang',
              key: 'settings.archive.rename.button',
              inert: true,
            }],
            events: {
              click: async (ev)=>{
                let target = (content.querySelectorAll('[setting-data="rename.category.target"]')[0] as VSelect);
                let input = (content.querySelectorAll('[setting-data="rename.category.value"]')[0] as VInput);
                if (typeof target.value !== 'string' || input.value === '' || Object.keys(db.categories).includes(input.value)) {
                  new ErrorDialog(lang('settings.archive.rename.category_failed'));
                  return;
                };
                await db.renameCategory(target.value, input.value);
                target.value = undefined;
                input.value = '';
                input.disabled = true;
                (ev.target as VDOM).disabled = true;
              },
            },
          },
        ],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.archive.rename.tag',
        }],
        icon: {
          type: 'icon',
          key: 'Rename',
        },
        head: [
          {
            type: 'select',
            placeholder: lang('settings.select_category'),
            values: dbToSelect(db.tags),
            attribute: {'setting-data': 'rename.tag.target', select: 'tags'},
            events: {
              change: ({target})=>{
                let input = (content.querySelectorAll('[setting-data="rename.tag.value"]')[0] as VInput);
                let btn = content.querySelectorAll('[setting-data="rename.tag.action"]')[0];
                if (typeof (target as VSelect).value !== 'string') {
                  input.disabled = true;
                  input.value = '';
                  btn.disabled = true;
                  return;
                }
                input.disabled = false;
              },
            },
          },
          {
            type: 'input',
            attribute: {'setting-data': 'rename.tag.value'},
            disabled: true,
            events: {
              input: ({target})=>{
                let btn = content.querySelectorAll('[setting-data="rename.tag.action"]')[0];
                if ((target as VInput).value === '' || Object.keys(db.tags).includes((target as VInput).value)) {
                  btn.disabled = true;
                  return;
                }
                btn.disabled = false;
              },
            },
          },
          {
            type: 'button',
            attribute: {'setting-data': 'rename.tag.action'},
            disabled: true,
            children: [{
              type: 'lang',
              key: 'settings.archive.rename.button',
              inert: true,
            }],
            events: {
              click: async (ev)=>{
                let target = (content.querySelectorAll('[setting-data="rename.tag.target"]')[0] as VSelect);
                let input = (content.querySelectorAll('[setting-data="rename.tag.value"]')[0] as VInput);
                if (typeof target.value !== 'string' || input.value === '' || Object.keys(db.tags).includes(input.value)) {
                  new ErrorDialog(lang('settings.archive.rename.tag_failed'));
                  return;
                };
                await db.renameTag(target.value, input.value);
                target.value = undefined;
                input.value = '';
                input.disabled = true;
                (ev.target as VDOM).disabled = true;
              },
            },
          },
        ],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.archive.merge.category',
        }],
        icon: {
          type: 'icon',
          key: 'Merge',
        },
        head: [
          {
            type: 'select',
            group: 'merge-category',
            placeholder: lang('settings.archive.merge.select_category_main'),
            values: dbToSelect(db.categories),
            attribute: {'settings-data': 'merge.category.main', select: 'categories'},
            events: {
              change: ({target})=>{
                let main = (target as VSelect).value;
                let branch = (content.querySelectorAll('[settings-data="merge.category.branch"]')[0] as VSelect).value;
                let btn = content.querySelectorAll('[settings-data="merge.category.action"]')[0];
                if (typeof main === 'string' && typeof branch === 'string' && main !== branch) {
                  btn.disabled = false;
                  return;
                }
                btn.disabled = true;
              },
            },
          },
          {
            type: 'select',
            group: 'merge-category',
            placeholder: lang('settings.archive.merge.select_category_branch'),
            values: dbToSelect(db.categories),
            attribute: {'settings-data': 'merge.category.branch', select: 'categories'},
            events: {
              change: ({target})=>{
                let main = (content.querySelectorAll('[settings-data="merge.category.main"]')[0] as VSelect).value;
                let branch = (target as VSelect).value;
                let btn = content.querySelectorAll('[settings-data="merge.category.action"]')[0];
                if (typeof main === 'string' && typeof branch === 'string' && main !== branch) {
                  btn.disabled = false;
                  return;
                }
                btn.disabled = true;
              },
            },
          },
          {
            type: 'button',
            disabled: true,
            children: [{
              type: 'lang',
              key: 'settings.archive.merge.button',
              inert: true,
            }],
            attribute: {'settings-data': 'merge.category.action'},
            events: {
              click: async ({target})=>{
                let main = (content.querySelectorAll('[settings-data="merge.category.main"]')[0] as VSelect);
                let branch = (content.querySelectorAll('[settings-data="merge.category.branch"]')[0] as VSelect);
                if (typeof main.value !== 'string' || typeof branch.value !== 'string' || main.value === branch.value) return;
                await db.mergeCategory(main.value, branch.value);
                main.value = undefined;
                branch.value = undefined;
                (target as VDOM).disabled = true;
              },
            },
          },
        ],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.archive.merge.tag',
        }],
        icon: {
          type: 'icon',
          key: 'Merge',
        },
        head: [
          {
            type: 'select',
            group: 'merge-tag',
            placeholder: lang('settings.archive.merge.select_tag_main'),
            values: dbToSelect(db.tags),
            attribute: {'settings-data': 'merge.tag.main', select: 'tags'},
            events: {
              change: ({target})=>{
                let main = (target as VSelect).value;
                let branch = (content.querySelectorAll('[settings-data="merge.tag.branch"]')[0] as VSelect).value;
                let btn = content.querySelectorAll('[settings-data="merge.tag.action"]')[0];
                if (typeof main === 'string' && typeof branch === 'string' && main !== branch) {
                  btn.disabled = false;
                  return;
                }
                btn.disabled = true;
              },
            },
          },
          {
            type: 'select',
            group: 'merge-tag',
            placeholder: lang('settings.archive.merge.select_tag_branch'),
            values: dbToSelect(db.tags),
            attribute: {'settings-data': 'merge.tag.branch', select: 'tags'},
            events: {
              change: ({target})=>{
                let main = (content.querySelectorAll('[settings-data="merge.tag.main"]')[0] as VSelect).value;
                let branch = (target as VSelect).value;
                let btn = content.querySelectorAll('[settings-data="merge.tag.action"]')[0];
                if (typeof main === 'string' && typeof branch === 'string' && main !== branch) {
                  btn.disabled = false;
                  return;
                }
                btn.disabled = true;
              },
            },
          },
          {
            type: 'button',
            disabled: true,
            children: [{
              type: 'lang',
              key: 'settings.archive.merge.button',
              inert: true,
            }],
            attribute: {'settings-data': 'merge.tag.action'},
            events: {
              click: async ({target})=>{
                let main = (content.querySelectorAll('[settings-data="merge.tag.main"]')[0] as VSelect);
                let branch = (content.querySelectorAll('[settings-data="merge.tag.branch"]')[0] as VSelect);
                if (typeof main.value !== 'string' || typeof branch.value !== 'string' || main.value === branch.value) return;
                await db.mergeTag(main.value, branch.value);
                main.value = undefined;
                branch.value = undefined;
                (target as VDOM).disabled = true;
              },
            },
          },
        ],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.archive.delete.category',
        }],
        icon: {
          type: 'icon',
          key: 'Delete',
        },
        head: [
          {
            type: 'select',
            placeholder: lang('settings.select_category'),
            values: dbToSelect(db.categories),
            attribute: {'settings-data': 'delete.category.select', select: 'categories'},
            events: {
              change: ({target})=>{
                content.querySelectorAll('[settings-data="delete.category.action"]')[0].disabled = (typeof (target as VSelect).value !== 'string');
              },
            },
          },
          {
            type: 'button',
            disabled: true,
            children: [{
              type: 'lang',
              key: 'settings.archive.delete.button',
              inert: true,
            }],
            attribute: {'settings-data': 'delete.category.action'},
            events: {
              click: async ({target})=>{
                let select = (content.querySelectorAll('[settings-data="delete.category.select"]')[0] as VSelect);
                if (typeof select.value !== 'string') return;
                await db.removeCategory(select.value);
                select.value = undefined;
                (target as VDOM).disabled = true;
              },
            },
          },
        ],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.archive.delete.tag',
        }],
        icon: {
          type: 'icon',
          key: 'Delete',
        },
        head: [
          {
            type: 'select',
            placeholder: lang('settings.select_tag'),
            values: dbToSelect(db.tags),
            attribute: {'settings-data': 'delete.tag.select', select: 'tags'},
            events: {
              change: ({target})=>{
                content.querySelectorAll('[settings-data="delete.tag.action"]')[0].disabled = (typeof (target as VSelect).value !== 'string');
              },
            },
          },
          {
            type: 'button',
            disabled: true,
            children: [{
              type: 'lang',
              key: 'settings.archive.delete.button',
              inert: true,
            }],
            attribute: {'settings-data': 'delete.tag.action'},
            events: {
              click: async ({target})=>{
                let select = (content.querySelectorAll('[settings-data="delete.tag.select"]')[0] as VSelect);
                if (typeof select.value !== 'string') return;
                await db.removeTag(select.value);
                select.value = undefined;
                (target as VDOM).disabled = true;
              },
            },
          },
        ],
      },
      {
        type: 'lang',
        key: 'settings.manage',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.open_db_dir',
        }],
        icon: {
          type: 'icon',
          key: 'OpenFolderHorizontal',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'icon',
            key: 'OpenInNewWindow'
          }],
          events: {
            click: ()=>ipcRenderer.send('open:path', settings.getDB()),
          },
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.move_db.title',
        }],
        icon: {
          type: 'icon',
          key: 'MoveToFolder',
        },
        head: [
          {
            type: 'div',
            classList: ['settings-move-info'],
            attribute: {'settings-data': 'db.move.info'},
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.move_db.button',
              inert: true,
            }],
            events: {
              click: async ({target})=>{
                async function move() {
                  let result = await saveInFolder(settings.getDB());
                  if (result.canceled) return;
                  (target as VDOM).disabled = true;
                  let info = (content.querySelectorAll('[settings-data="db.move.info"]')[0] as VDiv)._element;
                  settings.setDB(result.filePaths[0]).onProgress = (mover)=>{
                    switch (mover.status) {
                      case "checking":
                        info.innerHTML = '<ui-lang>settings.move_db.checking</ui-lang>';
                        return;
                      case "failed":
                        info.innerHTML = `<ui-lang>settings.move_db.failed</ui-lang> ${mover.msg}`;
                        (target as VDOM).disabled = false;
                        return;
                      case "scaning":
                        info.innerHTML = '<ui-lang>settings.move_db.scaning</ui-lang>';
                        return;
                      case "moving":
                        info.innerHTML = `<ui-lang>settings.move_db.moving</ui-lang>${mover.finished}/${mover.total} ${mover.msg}`;
                        return;
                      case "saving":
                        info.innerHTML = '<ui-lang>settings.move_db.saving</ui-lang>';
                        return;
                      case "successed":
                        info.innerHTML = '';
                        (target as VDOM).disabled = false;
                        return;
                    }
                  };
                }
                let dialogContent = document.createElement('ui-lang');
                dialogContent.innerHTML = 'settings.move_db.dialog.content';
                let dialog = new Dialog({
                  title: '<ui-lang>settings.move_db.dialog.title</ui-lang>',
                  content: dialogContent,
                  buttons: [
                    {
                      text: '<ui-lang>dialog.confirm</ui-lang>',
                      action: ()=>{
                        move();
                        dialog.close();
                      },
                      level: 'danger',
                    },
                    {
                      text: '<ui-lang>dialog.cancel</ui-lang>',
                      action: ()=>{
                        dialog.close();
                      },
                    },
                  ],
                });
                dialog.show();
              },
            },
          }
        ],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.backup.title',
        }],
        icon: {
          type: 'icon',
          key: 'Download',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.backup.button',
            inert: true,
          }],
          events: {
            click: async ({target})=>{
              let {canceled, filePath} = await saveZip();
              if (canceled || typeof filePath !== 'string') return;
              (target as VDOM)._element.innerHTML = `<ui-lang inert>settings.backup.wait</ui-lang>`;
              (target as VDOM).disabled = true;
              await backup(filePath);
              (target as VDOM)._element.innerHTML = `<ui-lang inert>settings.backup.button</ui-lang>`;
              (target as VDOM).disabled = false;
            },
          },
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.recover.title',
        }],
        description: [{
          type: 'lang',
          key: 'settings.recover.description',
        }],
        icon: {
          type: 'icon',
          key: 'Upload',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.recover.button',
            inert: true,
          }],
          events: {
            click: async ({target})=>{
              let {canceled, filePaths} = await getZip();
              if (canceled || typeof filePaths[0] !== 'string') return;
              (target as VDOM).disabled = true;
              await restore(filePaths[0]);
              (target as VDOM).disabled = false;
            }
          },
        }],
      },
      {
        type: 'lang',
        key: 'settings.danger',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.reset_db.title',
        }],
        icon: {
          type: 'icon',
          key: 'Warning',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.reset_db.button',
            inert: true,
          }],
          events: {
            click: ()=>{
              let content = document.createElement('ui-lang');
              content.innerHTML = 'settings.reset_db.dialog.content';
              let dialog = new Dialog({
                title: '<ui-lang>settings.reset_db.dialog.title</ui-lang>',
                content,
                buttons: [
                  {
                    text: '<ui-lang>dialog.confirm</ui-lang>',
                    action: async ()=>{
                      dialog.close();
                      let wait = new Dialog({
                        title: '<ui-lang>settings.reset_db.resetting</ui-lang>',
                        content: document.createElement('div'),
                        buttons: [],
                      });
                      wait.show();
                      await db.reset();
                      location.reload();
                    },
                    level: 'danger',
                  },
                  {
                    text: '<ui-lang>dialog.cancel</ui-lang>',
                    action: ()=>{
                      dialog.close();
                    },
                  },
                ],
              });
              dialog.show();
            },
          },
        }],
      },
    ],
  };
  content = createPage(database);
  window.addEventListener('db', ()=>{
    content.querySelectorAll('[select]').forEach((vdom)=>{
      switch (vdom.getAttribute('select')) {
        case 'categories':
          (vdom as VSelect).values = dbToSelect(db.categories, vdom.hasAttribute('select-with-none'));
          break;
        case 'tags':
          (vdom as VSelect).values = dbToSelect(db.tags, vdom.hasAttribute('select-with-none'));
          break;
      }
    });
  });
}

async function initSettingsAbout() {
  const about: SettingsPage = {
    name: {
      type: 'lang',
      key: 'settings.about',
    },
    icon: {
      type: 'icon',
      key: 'Info',
    },
    template: [
      {
        type: 'lang',
        key: 'settings.version.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'div',
          text: await ipcRenderer.invoke('app:version'),
        }],
        icon: {
          type: 'icon',
          key: 'ArrowSyncCircle',
        },
        attribute: {'settings-update': 'setting'},
        head: [
          {
            type: 'progress',
            attribute: {'settings-update': 'progress'},
            style: 'display: none',
            value: NaN,
          },
          {
            type: 'button',
            attribute: {'settings-update': 'button'},
            children: [{
              type: 'lang',
              key: 'settings.version.check_update',
              inert: true,
            }],
            events: {
              click: ()=>{
                checkUpdate(true);
              },
            },
          }
        ],
        body: [],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.version.auto_check_update',
        }],
        icon: {
          type: 'icon',
          key: 'UpArrowShiftKey',
        },
        head: [{
          type: 'switch',
          value: settings.getAutoUpdate(),
          events: {
            change: ({target})=>{
              settings.setAutoUpdate((target as VSwitch).value);
            },
          },
        }],
      },
      {
        type: 'lang',
        key: 'settings.help.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.help.get_help',
        }],
        icon: {
          type: 'icon',
          key: 'Help',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'icon',
            key: 'OpenInNewWindow'
          }],
          events: {
            click: ()=>ipcRenderer.send('open:url', 'https://jonnys.top/lib/apps/abm/help'),
          },
        }],
      },
      {
        type: 'lang',
        key: 'settings.open_source.title',
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.open_source.license',
        }],
        icon: {
          type: 'icon',
          key: 'Key',
        },
        body: [{
          type: 'div',
          classList: ['settings-license'],
          text: license,
        }],
      },
      {
        type: 'lang',
        key: 'settings.open_source.third_party',
      },
    ],
  };
  for (const key of Object.keys(process.versions)) {
    ((about.template[1] as VSettingItemTemplate).body as VDOMTemplate[]).push({
      type: 'setting-child',
      name: [{
        type: 'div',
        text: key,
      }],
      head: [{
        type: 'div',
        text: process.versions[key],
      }],
    });
  }
  for (const item of third_party) {
    let obj: VSettingItemTemplate = {
      type: 'setting',
      name: [{
        type: 'div',
        text: item.name,
      }],
      description: [{
        type: 'div',
        text: item.version,
      }],
      head: [],
      body: [{
        type: 'div',
        classList: ['settings-license'],
        text: item.license,
      }],
    };
    for (const link of item.links) {
      obj.head?.push({
        type: 'link',
        text: link.name,
        link: link.url,
      });
    }
    if (item.icon) {
      obj.icon = {
        type: 'icon',
        image: true,
        key: item.icon,
      };
    }
    about.template.push(obj);
  }
  about.template.push(...developer as any);
  createPage(about);
}

async function initSettingsExtensions() {
  const extensions: SettingsPage = {
    name: {
      type: 'lang',
      key: 'settings.extensions',
    },
    icon: {
      type: 'icon',
      key: 'Extension',
    },
    template: [
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.open_ext_dir',
        }],
        icon: {
          type: 'icon',
          key: 'OpenFolderHorizontal',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'icon',
            key: 'OpenInNewWindow'
          }],
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.scan_ext.title',
        }],
        icon: {
          type: 'icon',
          key: 'Search',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.scan_ext.button'
          }],
        }],
      },
      {
        type: 'div',
        style: 'height: 4px;'
      },
    ],
  };
  createPage(extensions);
  let separator = document.createElement('div');
  separator.className = 'settings-list-separator';
  pageListElement.append(separator);
}

async function initSettingsPages() {
  await initSettingsGeneral();
  await initSettingsDatabase();
  await initSettingsAbout();
  // await initSettingsExtensions();
}

const page: SinglePageOptions = {
  name: 'settings',
  single: true,
  onCreate(element, option) {
    pageListElement = element.querySelector('.settings-p-list') as HTMLDivElement;
    pageBodysElement = element.querySelector('.settings-p-bodys') as HTMLDivElement;
    pageListIndicator = element.querySelector('.settings-indicator') as HTMLDivElement;
    initSettingsPages();
  },
  onBack(element, option) {
  },
  onOpen(element, option) {
  },
};

export default page;
