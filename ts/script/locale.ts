import { readFile, readdir } from "fs/promises";
import path from "path";
import yaml from "yaml";
const locales: string[] = require('../../locales/manifest.json');

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
    target = 'en.yml';
  }
  let file = await readFile(path.join(process.cwd(), 'locales', target), 'utf-8');
  let result: any = {};
  switch (path.extname(target)) {
    case '.yml':
    case '.yaml':
      result = yaml.parse(file);
      break
    case '.json':
      result = JSON.parse(file);
      break;
  }
  result.id = target.split('.')[0];
  return result;
}

/* export async function initLocale(id: string) {
  locale = await loadLocale(id);
  return;
} */

function updateUILang() {
  document.querySelectorAll('ui-lang').forEach((el)=>{
    if (typeof (el as any).key !== 'string') return;
    el.textContent = getLangByKey((el as any).key);
  });
}

function updateLangAttribute(){
  document.querySelectorAll('[lang][lang-key]').forEach((el)=>{
    // @ts-ignore
    el[el.getAttribute('lang')] = getLangByKey(el.getAttribute('lang-key'));
  });
}

export async function updateLocale(id: string) {
  locale = await loadLocale(id);
  updateUILang();
  updateLangAttribute();
  return;
}

export function getLangByKey(key: any) {
  if (typeof key !== 'string') return undefined;
  let keys = key.split('.');
  let target = locale;
  for (const k of keys) {
    target = target[k];
    if (target === undefined) return key;
  }
  return target;
}

// TODO: namespace, locale
export function lang(key: string, namespace?: string, locale?: string){
  return`<ui-lang>${key}</ui-lang>`;
}
