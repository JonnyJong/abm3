import path from "path";
import Config, { getDefaultConfigDir } from "../modules/config";
import { download } from "../helper/image";
import { access, constants, mkdir, readdir, rename, unlink } from "fs/promises";
import { ipcRenderer } from "electron";
import stylus from "stylus";
import { VDOMTemplate, VDivTemplate, VIconTemplate, VImageTemplate, VLangTemplate, VSettingItemTemplate } from "../ui/vdom";
import { updateLocale } from "./locale";
import archiver from "archiver";
import { sha256 } from "../helper/hash";
import { createWriteStream, existsSync } from "fs";
import { ErrorDialog } from "../ui/dialog";

const DEFAULT_AVATAR = '../assets/defaultAvatar.bmp';

let systemThemeColor: string = '#f837be';

class DBMover{
  status: 'checking' | 'failed' | 'scaning' | 'moving' | 'saving' | 'successed' = 'checking';
  msg: string = '';
  finished: number = 0;
  total: number = 0;
  constructor(origin: string, target: string, movedHandler: Function) {
    this._processer(origin, target, movedHandler).catch((error)=>{
      new ErrorDialog(`<div style="word-break:break-word;white-space:nowrap;">${JSON.stringify(error)}</div>`);
      console.error(error);
    });
  }
  onProgress: (dbMover: DBMover)=>void = ()=>{};
  private async _processer(origin: string, target: string, movedHandler: Function) {
    try {
      await access(target, constants.O_DIRECTORY);
    } catch {
      this.status = 'failed';
      this.msg = 'DIR_FAILED';
      this.onProgress(this);
      return;
    }
    this.status = 'scaning';
    this.onProgress(this);
    let files: string[] = ['db.json'];
    let images = path.join(origin, 'images')
    let avatar = settings.getAvatar();
    if (avatar !== DEFAULT_AVATAR) {
      files.push(avatar.replace(origin, ''));
    }
    for (const file of await readdir(images)) {
      files.push(path.join(images, file).replace(origin, ''));
    }
    this.total = files.length; 
    this.status = 'moving';
    this.onProgress(this);
    if (!existsSync(path.join(target, 'images'))) {
      await mkdir(path.join(target, 'images'));
    }
    for (const file of files) {
      this.msg = file;
      this.onProgress(this);
      if (existsSync(path.join(target, file))) {
        unlink(path.join(target, file));
      }
      await rename(path.join(origin, file), path.join(target, file));
      this.finished++;
    }
    this.status = 'saving';
    this.msg = '';
    this.onProgress(this);
    await movedHandler();
    this.status = 'successed';
    this.onProgress(this);
  }
}

class Settings{
  private _config: Config;
  constructor() {
    this._config = new Config('config');
  }
  private _setTheme() {
    ipcRenderer.send('theme', this._config.store.theme);
  }
  private async _setColor() {
    systemThemeColor = await ipcRenderer.invoke('theme:color');
    let theme = this._config.store.themeColor;
    if (theme === 'system') {
      theme = await ipcRenderer.invoke('theme:color');
    }
    let css = stylus.render(`$theme = ${theme}
:root
  --theme $theme
  --theme-hover lighten($theme, 5%)
  --theme-active lighten($theme, 10%)
  --select dark($theme) ? #fff : #000
  --theme-color dark($theme) ? #fff : #000
  --theme-color-active dark($theme) ? #cecece : #5d5d5d
  --theme-color-disabled dark($theme) ? #787878 : #9d9d9d
  --theme-weight-factor dark($theme) ? 0.75 : 1
  @media (prefers-color-scheme: dark)
    --theme-hover lighten($theme, -15%)
    --theme-active lighten($theme, -20%)`);
    let style = document.createElement('style');
    style.className = 'style-theme';
    style.innerHTML = css;
    document.querySelectorAll('.style-theme').forEach((e)=>e.remove());
    document.head.append(style);
  }
  async init() {
    await this._config.load();
    this._setTheme();
    this._setColor();
    if (this._config.store.db === null) {
      this._config.store.db = getDefaultConfigDir();
    }
  }
  getDB(): string {
    return this._config.store.db;
  }
  setDB(path: string) {
    if (typeof path !== 'string') throw new Error('path must be a string.');
    return new DBMover(this._config.store.db, path, async ()=>{
      this._config.store.db = path;
      await this._config.save();
    });
  }
  getLocale(): string {
    return this._config.store.locale;
  }
  async setLocale(name: string) {
    if (typeof name !== 'string') return;
    this._config.store.locale = name;
    await this._config.save();
    await updateLocale(this._config.store.locale);
  }
  getAvatar(): string {
    if (this._config.store.avatar === '' || this._config.store.avatar === DEFAULT_AVATAR) {
      return DEFAULT_AVATAR;
    }
    return path.join(this.getDB(), this._config.store.avatar);
  }
  async setAvatar(value: string) {
    if (typeof value !== 'string' || value === this.getAvatar()) return;
    let path: string;
    if (value !== '' && value !== DEFAULT_AVATAR) {
      path = await download(value, this.getDB());
    } else {
      path = '';
    }
    if (this.getAvatar() !== DEFAULT_AVATAR) {
      await unlink(this.getAvatar());
    }
    this._config.store.avatar = path;
    await this._config.save();
  }
  getUsername(): string {
    return this._config.store.username;
  }
  async setUsername(value: string) {
    if (typeof value !== 'string') return;
    this._config.store.username = value;
    await this._config.save();
  }
  getTheme(): 'system' | 'light' | 'dark' {
    return this._config.store.theme;
  }
  async setTheme(value: 'system' | 'light' | 'dark') {
    if (!['system', 'light', 'dark'].includes(value)) return;
    this._config.store.theme = value;
    await this._config.save();
    this._setTheme();
  }
  getThemeColor(): string {
    let value: string = this._config.store.themeColor;
    if (value === 'system') {
      value = systemThemeColor;
    }
    return value;
  }
  async setThemeColor(value: string) {
    if (typeof value !== 'string') return;
    let color = value.match(/system|#[0-9A-Fa-f]{6}/)?.[0];
    if (!color) return;
    this._config.store.themeColor = color;
    await this._config.save();
    await this._setColor();
  }
  getRack(): {type: 'none' | 'all' | 'category' | 'tag' | 'custom', value: string, fold: boolean}[] {
    return this._config.store.rack;
  }
  async setRack(racks: {type: 'none' | 'all' | 'category' | 'tag' | 'custom', value: string, fold: boolean}[]) {
    this._config.store.rack = racks;
    await this._config.save();
  }
  getAutoUpdate(): boolean{
    return this._config.store.autoUpdate;
  }
  async setAutoUpdate(value: boolean) {
    if (typeof value !== 'boolean') return;
    this._config.store.autoUpdate = value;
    await this._config.save();
  }
  async reset() {
    await this.setAvatar('');
    let db = this._config.store.db;
    await this._config.reset();
    this._config.store.db = db;
    await this._config.save();
  }
}

export let settings = new Settings();

export type SettingsPage = {
  name: VLangTemplate,
  template: (VDivTemplate | VSettingItemTemplate | VLangTemplate)[],
  icon?: VIconTemplate,
  screenshot?: VImageTemplate,
  description?: VDOMTemplate,
  shortcuts?: {
    name: VDOMTemplate,
    link: string,
  }[],
};

let settingsPages: SettingsPage[] = [];
export function registerSettingsPage(page: SettingsPage) {
  settingsPages.push(page);
}
export function getSettingsPages() {
  return settingsPages;
}

export async function backup(filePath: string) {
  if (typeof filePath !== 'string') return;
  let dbPath = settings.getDB();
  let hash = await sha256(path.join(dbPath, 'db.json'));
  let output = createWriteStream(filePath);
  let archive = archiver('zip', {
    comment: hash,
    zlib: {
      level: 9,
    },
  });

  archive.pipe(output);
  archive.file(path.join(dbPath, 'db.json'), { name: 'db.json' });
  archive.directory(path.join(dbPath, 'images'), 'images');

  await archive.finalize();
}
export async function restore() {}
