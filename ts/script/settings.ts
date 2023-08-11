import path from "path";
import Config, { getDefaultConfigDir } from "../modules/config";
import { download } from "../helper/image";
import { access, constants, readdir, rename, unlink } from "fs/promises";
import { ipcRenderer } from "electron";
import stylus from "stylus";

const DEFAULT_AVATAR = '../assets/defaultAvatar.bmp';

class DBMover{
  status: 'checking' | 'failed' | 'scaning' | 'moveing' | 'saving' | 'successed' = 'checking';
  msg: string = '';
  finished: number = 0;
  total: number = 0;
  constructor(origin: string, target: string, movedHandler: Function) {
    this._processer(origin, target, movedHandler);
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
    this.status = 'moveing';
    this.onProgress(this);
    for (const file of files) {
      this.msg = file;
      this.onProgress(this);
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
    let theme = this._config.store.themeColor;
    if (theme === 'system') {
      theme = await ipcRenderer.invoke('theme:color');
    }
    let css = stylus.render(`$theme = ${theme}
:root
  --theme $theme
  --theme-hover lighten($theme, 15%)
  --theme-active lighten($theme, 30%)
  --select isDark($theme) ? #fff : #000
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
  getDB() {
    return this._config.store.db;
  }
  setDB(path: string) {
    if (typeof path !== 'string') throw new Error('path must be a string.');
    return new DBMover(this._config.store.db, path, async ()=>{
      this._config.store.db = path;
      await this._config.save();
    });
  }
  getLocale() {
    return this._config.store.locale;
  }
  async setLocale(name: string) {
    if (typeof name !== 'string') return;
    this._config.store.locale = name;
    await this._config.save();
  }
  getAvatar() {
    if (this._config.store.avatar === '' || this._config.store.avatar === DEFAULT_AVATAR) {
      return DEFAULT_AVATAR;
    }
    return path.join(this.getDB(), this._config.store.avatar);
  }
  async setAvatar(value: string) {
    if (typeof value !== 'string') return;
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
  getTheme() {
    return this._config.store.theme;
  }
  async setTheme(value: 'system' | 'light' | 'dark') {
    if (!['system', 'light', 'dark'].includes(value)) return;
    this._config.store.theme = value;
    await this._config.save();
    this._setTheme();
  }
  getThemeColor() {
    return this._config.store.themeColor;
  }
  async setThemeColor(value: string) {
    if (typeof value !== 'string') return;
    let color = value.match(/system|#[0-9A-Fa-f]{6}/)?.[0];
    if (!color) return;
    this._config.store.themeColor = color;
    await this._config.save();
    await this._setColor();
  }
  getRack(): {type: 'all' | 'category' | 'tag', value: string}[] {
    return this._config.store.rack;
  }
  async setRack(racks: {type: 'all' | 'category' | 'tag', value: string}[]) {
    this._config.store.rack = racks;
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
