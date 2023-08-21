import { wash } from "../helper/wash";
import { getLang } from "../script/locale";

export type LangOption = {
  key: string,
  namespace?: string,
};
export type LangTemplateMap = { [key: string]: string };

export class LocaleAuto{
  private _key!: string;
  private _namespace: string = '';
  private _templates: LangTemplateMap = {};
  private _setter!: (str: string)=>any;
  constructor(option: LangOption, setter: (str: string)=>any) {
    this.key = option.key;
    this.setter = setter;
    window.addEventListener('locale', this.update);
  }
  update = ()=>{
    if (typeof this._setter !== 'function') return;
    let str = getLang(this.key, this._namespace) as string;
    if (str === undefined) {
      this._setter(this._key);
      return;
    }
    for (const key of Object.keys(this._templates)) {
      str = str.replaceAll(key, this._templates[key]);
    }
    this._setter(str);
  }
  setTemplate(templates: LangTemplateMap): void {
    if (!Array.isArray(templates)) return;
    for (const key of Object.keys(templates)) {
      if (typeof templates[key] !== 'string') continue;
      this._templates[key] = templates[key];
    }
    this.update();
  }
  removeTemplate(...keys: string[]): void {
    if (!Array.isArray(keys)) return;
    for (const key of keys) {
      delete this._templates[key];
    }
    this.update();
  }
  getTemplate(): LangTemplateMap {
    return wash<LangTemplateMap>(this._templates);
  }
  get key(): string {
    return this._key;
  }
  set key(key: string) {
    if (typeof key !== 'string') throw new Error('LocaleAuto key require a string');
    this._key = key;
    this.update();
  }
  get namespace(): string {
    return this._namespace;
  }
  set namespace(value: string | undefined) {
    if (typeof value !== 'string') {
      this._namespace = '';
    } else {
      this._namespace = value;
    }
    this.update();
  }
  get setter(): (str: string)=>any {
    return this._setter;
  }
  set setter(setter: (str: string)=>any) {
    if (typeof setter !== 'function') throw new Error('LocaleAuto setter require a function');
    this._setter = setter;
    this.update();
  }
  close() {
    window.removeEventListener('locale', this.update);
  }
}

export class UILang extends HTMLElement{
  private _inited: boolean = false;
  private _key: string = '';
  private _namespace: string = '';
  private _templates: LangTemplateMap = {};
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    if (this.key === '') {
      this.key = this.textContent as string;
    }
    this.update();
  }
  update() {
    if (!this._inited) return;
    let str = getLang(this.key, this._namespace) as string;
    if (str === undefined) {
      this.textContent = this._key;
      return;
    }
    for (const key of Object.keys(this._templates)) {
      str = str.replaceAll(key, this._templates[key]);
    }
    this.textContent = str;
  }
  get key() {
    return this._key;
  }
  set key(value: string) {
    if (typeof value !== 'string') return;
    let keys = value.split('@');
    this._key = keys[0];
    if (keys[1]) {
      this._namespace = keys[1];
    }
    this.update();
  }
  get namespace() {
    return this._namespace;
  }
  set namespace(value: string) {
    if (typeof value !== 'string') return;
    this._namespace = value;
    this.update();
  }
  setTemplate(templates: LangTemplateMap): void {
    if (!Array.isArray(templates)) return;
    for (const key of Object.keys(templates)) {
      if (typeof templates[key] !== 'string') continue;
      this._templates[key] = templates[key];
    }
    this.update();
  }
  removeTemplate(...keys: string[]): void {
    if (!Array.isArray(keys)) return;
    for (const key of keys) {
      delete this._templates[key];
    }
    this.update();
  }
  getTemplate(): LangTemplateMap {
    return wash<LangTemplateMap>(this._templates);
  }
}
