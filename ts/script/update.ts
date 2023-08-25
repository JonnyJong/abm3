import { ipcRenderer } from "electron";
import { Dialog, ErrorDialog } from "../ui/dialog";
import { UISettingItem } from "../ui/settings";
import { UIProgress } from "../ui/progress";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import { existsSync } from "fs";

const GITHUB_RELEASE = 'https://api.github.com/repos/januwA/flutter_anime_app/releases/latest';
// const GITHUB_RELEASE = 'https://api.github.com/repos/JonnyJong/abm3/releases/latest';

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

export async function checkUpdate(userCheck?: boolean) {
  if (updateReadyed) {
    installUpdate();
    return;
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
  nowVersion = (await ipcRenderer.invoke('app:version')).split('.');
  let data: Response = await fetch(GITHUB_RELEASE, {
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
  newVersion = json.tag_name.split('.');
  // for (let i = 0; i < 3; i++) {
  //   if (nowVersion[i] >= newVersion[i]) {
  //     setButton('<ui-lang>settings.version.check_update<ui-lang>', false);
  //     setDesc('<ui-lang>settings.version.description.no_update<ui-lang>');
  //     setProg(NaN, true);
  //     return;
  //   }
  // }
  if (nowVersion[1] < newVersion[1]) {
    fullUpdate = true;
  }
  // TODO: 根据是否是大更新，选择下载更新包
  // updateUrl = json.assets[0].browser_download_url;
  updateUrl = '../down.zip';
  download();
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
  let dir = path.join(root, 'update');
  await writeFile(pkg, Buffer.from(data));
  let zip = new AdmZip(pkg);
  if (!existsSync(dir)) {
    await mkdir(dir);
  }
  zip.extractAllTo(dir, true, false);
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
