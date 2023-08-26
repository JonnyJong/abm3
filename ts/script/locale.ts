import { UILang } from "../ui/lang";
const locales: string[] = require('../../locales/manifest.json');

// TODO: fallback function
export let locale: any = {};

async function loadLocale(id: string) {
  let target;
  for (const item of locales) {
    if (item.split('.')[0] !== id) continue;
    target = item;
    break;
  }
  if (!target) {
    EACH_LANG: for (const lang of navigator.languages) {
      for (const item of locales) {
        if (item.split('.')[0] !== lang) continue;
        target = item;
        break EACH_LANG;
      }
    }
  }
  if (!target) {
    target = 'en';
  }
  let result: any = require(`../../locales/${target}.json`);
  result.id = target;
  return result;
}

/* export async function initLocale(id: string) {
  locale = await loadLocale(id);
  return;
} */

function updateUILang() {
  document.querySelectorAll('ui-lang').forEach((el)=>(el as UILang).update());
  window.dispatchEvent(new Event('locale'));
}

export async function updateLocale(id: string) {
  locale = await loadLocale(id);
  updateUILang();
  return;
}

// TODO: namespace, localeName
export function getLang(key: string, namespace?: string, localeName?: string) {
  if (typeof key !== 'string') return undefined;
  let keys = key.split('.');
  let target = locale;
  for (const k of keys) {
    target = target[k];
    if (target === undefined) return undefined;
  }
  if (typeof target !== 'string') return undefined;
  return target;
}

export function lang(key: string, namespace?: string, locale?: string){
  return`<ui-lang${locale ? ` locale="${locale}"` : ''}>${key}${namespace ? `@${namespace}` : ''}</ui-lang>`;
}

export async function getLocaleList() {
  let list: {name: string, value: string}[] = [{
    name: '<ui-lang>settings.language_auto</ui-lang>',
    value: 'auto',
  }];
  for (const locale of locales) {
    let name: string = require(`../../locales/${locale}.json`).name;
    if (!name) continue;
    list.push({ name, value: locale.split('.')[0]});
  }
  return list;
}
