import { ipcRenderer } from "electron";
import { Dialog, ErrorDialog } from "../ui/dialog";
import { UISettingItem } from "../ui/settings";
import { UIProgress } from "../ui/progress";
import { writeFile } from "fs/promises";
import path from "path";

const GITHUB_RELEASE_API = 'https://api.github.com/repos/JonnyJong/abm3/releases/latest';
const GITHUB_RELEASE = 'https://github.com/JonnyJong/abm3/releases/latest';

let updateUrl: string = '';
let nowVersion: [number, number, number] = [0,0,0];
let newVersion: [number, number, number] = [0,0,0];
let fullUpdate: boolean = false;
export let updateReadyed: boolean = false;

function setDesc(value: string) {
  let settingItem = document.querySelector('[settings-update="setting"]') as UISettingItem;
  if (!settingItem) return;
  settingItem.description._element.innerHTML = value;
}

function setButton(value: string, disabled?: boolean) {
  let btn = document.querySelector('[settings-update="button"]') as HTMLButtonElement;
  if (!btn) return;
  btn.innerHTML = value;
  if (typeof disabled === 'boolean') {
    btn.disabled = disabled;
  }
}

function setProg(value: number, hide?: boolean) {
  let prog = document.querySelector('[settings-update="progress"]') as UIProgress;
  if (!prog) return;
  prog.value = value;
  if (typeof hide === 'boolean') {
    prog.style.display = hide ? 'none' : '';
  }
}

function stringToVersion(str: string): [number, number, number] {
  let v = str.split('.');
  let result: [number, number, number] = [0,0,0];
  for (let i = 0; i < v.length; i++) {
    result[i] = Number(v[i]);
    if (isNaN(result[i])) {
      result[i] = 0;
    }
    if (i === 2) break;
  }
  return result;
}

export async function checkUpdate(userCheck?: boolean) {
  if (updateReadyed) {
    return installUpdate();
  }
  if (updateUrl) {
    return download();
  }
  setButton('<ui-lang>settings.version.checking</ui-lang>', true);
  setProg(NaN, false);
  if (!navigator.onLine) {
    setButton('<ui-lang>settings.version.check_update</ui-lang>', false);
    setProg(NaN, true);
    if (userCheck) {
      new ErrorDialog('<ui-lang>settings.update.error_offline</ui-lang>');
    }
    return;
  }
  nowVersion = stringToVersion(await ipcRenderer.invoke('app:version'));
  let data: Response = await fetch(GITHUB_RELEASE_API, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (data.status !== 200) {
    setButton('<ui-lang>settings.version.check_update</ui-lang>', false);
    setDesc('<ui-lang>settings.version.description.error_fetch</ui-lang>' + data.status);
    setProg(NaN, true);
    if (userCheck) {
      new ErrorDialog('<ui-lang>settings.update.error_fetch</ui-lang>' + data.status);
    }
    return;
  }
  let json = await data.json();
  newVersion = stringToVersion(json.tag_name);
  let needUpdate = false;
  for (let i = 0; i < 3; i++) {
    if (nowVersion[i] >= newVersion[i]) continue;
    needUpdate = true;
    break;
  }
  if (!needUpdate) {
    setButton('<ui-lang>settings.version.check_update<ui-lang>', false);
    setDesc('<ui-lang>settings.version.description.no_update<ui-lang>');
    setProg(NaN, true);
    return;
  }
  if (nowVersion[1] < newVersion[1]) {
    fullUpdate = true;
  }
  updateUrl = json.assets.find((item: any)=>item.name === `abm-${process.platform}-update${fullUpdate ? '-full' : ''}.zip`).browser_download_url;
  setButton('<ui-lang>settings.version.download<ui-lang>', false);
  setDesc('<ui-lang>settings.version.description.wait_download<ui-lang>');
  setProg(NaN, true);
  showUpdateDialog(json.body);
}

async function showUpdateDialog(info: string) {
  let content = document.createElement('div');
  content.textContent = info;
  content.style.whiteSpace = 'pre';
  let dialog = new Dialog({
    title: '<ui-lang>settings.update.found</ui-lang>' + newVersion.join('.'),
    content,
    buttons: [
      {
        text: '<ui-lang>settings.version.download</ui-lang>',
        action: ()=>{
          download();
          dialog.close();
        },
        level: 'confirm',
      },
      {
        text: '<ui-lang>settings.update.browser</ui-lang>',
        action: ()=>{
          ipcRenderer.send('open:url', GITHUB_RELEASE);
          dialog.close();
        },
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
}

async function download() {
  if (updateUrl === '') {
    setButton('<ui-lang>settings.version.check_update</ui-lang>', false);
    return;
  }
  setButton('<ui-lang>settings.version.downloading</ui-lang>0%', true);
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'arraybuffer';
  xhr.onprogress = (ev)=>{
    setButton(`<ui-lang>settings.version.downloading</ui-lang>${(ev.loaded / ev.total * 100).toFixed(2)}%`, true);
    setProg(ev.loaded / ev.total * 100, false);
  };
  xhr.onerror = (ev)=>{
    setButton('<ui-lang>settings.version.check_update</ui-lang>', false);
    setDesc('<ui-lang>settings.update.error_download</ui-lang>' + xhr.status);
  };
  xhr.open('GET', updateUrl);
  xhr.send();
  xhr.onload = (ev)=>{
    if (xhr.readyState !== 4 || xhr.status !== 200) return;
    saveUpdatePackage(xhr.response);
  };
}

async function saveUpdatePackage(data: any) {
  let root = await ipcRenderer.invoke('path:root');
  let pkg = path.join(root, 'update.zip');
  await writeFile(pkg, Buffer.from(data));
  readyUpdate();
}

async function readyUpdate() {
  setButton('<ui-lang>settings.version.install</ui-lang>', false);
  setDesc('<ui-lang>settings.update.ready</ui-lang>');
  updateReadyed = true;
}

async function installUpdate() {
  ipcRenderer.send('update:install');
}
