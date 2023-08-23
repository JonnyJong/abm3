import { ipcRenderer } from "electron";
import { getLocaleList, lang } from "../locale";
import { SinglePageOptions } from "../page";
import { SettingsPage, registerSettingsPage, settings } from "../settings";
import { VColor, VDOM, VDOMTemplate, VDiv, VIcon, VImagePicker, VInput, VSelect, VSettingItemTemplate } from "../../ui/vdom";
import { UIIcon } from "../../ui/icon";
import { UIColor } from "../../ui/color";
import { Dialog } from "../../ui/dialog";
import { timer } from "../../helper/timer";

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
        body: [{
          type: 'list',
          dataKey: 'mark.categories',
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'mark-category',
              classList: ['settings-select'],
            },
            {
              type: 'color',
              dataKey: 'value',
              value: '#888888',
            },
          ],
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
        body: [{
          type: 'list',
          dataKey: 'mark.tags',
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'mark-tags',
              classList: ['settings-select'],
            },
            {
              type: 'color',
              dataKey: 'value',
              value: '#888888',
            },
          ],
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
        body: [{
          type: 'list',
          dataKey: 'recommendation.weights.categories',
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'rcmd-category',
              classList: ['settings-select'],
            },
            {
              type: 'number',
              dataKey: 'value',
              value: 0,
              step: 0.1,
            },
          ],
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
        body: [{
          type: 'list',
          dataKey: 'recommendation.weights.tags',
          template: [
            {
              type: 'select',
              dataKey: 'id',
              group: 'rcmd-tag',
              classList: ['settings-select'],
            },
            {
              type: 'number',
              dataKey: 'value',
              value: 0,
              step: 0.1,
            },
          ],
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
          step: 0.1,
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
          },
          {
            type: 'input',
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.archive.rename.button'
            }],
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
          },
          {
            type: 'input',
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.archive.rename.button'
            }],
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
          },
          {
            type: 'select',
            group: 'merge-category',
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.archive.merge.button'
            }],
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
          },
          {
            type: 'select',
            group: 'merge-tag',
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.archive.merge.button'
            }],
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
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.archive.delete.button'
            }],
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
          },
          {
            type: 'button',
            children: [{
              type: 'lang',
              key: 'settings.archive.delete.button'
            }],
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
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.move_db.button'
          }],
        }],
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
            key: 'settings.backup.button'
          }],
        }],
      },
      {
        type: 'setting',
        name: [{
          type: 'lang',
          key: 'settings.recover.title',
        }],
        icon: {
          type: 'icon',
          key: 'Upload',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.recover.button'
          }],
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
            key: 'settings.reset_db.button'
          }],
        }],
      },
    ],
  };
  createPage(database);
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
          text: await ipcRenderer.invoke('app:version')
        }],
        icon: {
          type: 'icon',
          key: 'ArrowSyncCircle',
        },
        head: [{
          type: 'button',
          children: [{
            type: 'lang',
            key: 'settings.version.check_update',
          }],
        }],
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
          type: 'textarea',
          classList: ['settings-license'],
          value: `MIT License

Copyright (c) 2023 Jonny

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
        }],
      },
      {
        type: 'lang',
        key: 'settings.open_source.third_party',
      },
      {
        type: 'setting',
        icon: {
          type: 'icon',
          key: '../assets/third_party/electron.png',
          image: true,
        },
        name: [{
          type: 'div',
          text: 'Electron',
        }],
        description: [{
          type: 'div',
          text: '25.3.0',
        }],
        head: [
          {
            type: 'link',
            text: `Github`,
            link: 'https://github.com/electron/electron',
          },
        ],
        body: [{
          type: 'textarea',
          classList: ['settings-license'],
          value: `Copyright (c) Electron contributors
Copyright (c) 2013-2020 GitHub Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
        }],
      },
      {
        type: 'lang',
        key: 'settings.about_dev',
      },
      {
        type: 'setting',
        name: [{
          type: 'div',
          text: 'Jonny',
        }],
        icon: {
          type: 'icon',
          key: 'Person',
        },
        body: [{
          type: 'div',
          classList: ['settings-links'],
          children: [
            {
              type: 'link',
              text: `Jonny's blog`,
              link: 'https://jonnys.top',
            },
            {
              type: 'link',
              text: `Github`,
              link: 'https://github.com/JonnyJong',
            },
            {
              type: 'link',
              text: `Npm`,
              link: 'https://www.npmjs.com/~jonnyjonny',
            }
          ],
        }],
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
  await initSettingsExtensions();
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
