import { getLangByKey } from "../script/locale";

export type LangOption = {
  key: string,
  namespace?: string,
};
export type LangTemplateMap = { [key: string]: string };

export class LangAuto{
  private _key!: string;
  private _namespace: string = '';
  private _templates: LangTemplateMap = {};
  private _setter!: (str: string)=>any;
  constructor(option: LangOption, setter: (str: string)=>any) {
    this.key = option.key;
    this.setter = setter;
  }
  setTemplate(templates: LangTemplateMap): void {
    if (!Array.isArray(templates)) return;
    for (const key of Object.keys(templates)) {
      if (typeof templates[key] !== 'string') continue;
      this._templates[key] = templates[key];
    }
  }
  removeTemplate(...keys: string[]): void {
    if (!Array.isArray(keys)) return;
    for (const key of keys) {
      delete this._templates[key];
    }
  }
  getTemplate(): LangTemplateMap {
    return Object.assign(this._templates);
  }
  get key() {
    return this._key;
  }
  set key(key: string) {
    if (typeof key !== 'string') throw new Error('Lang key require a string');
    this._key = key;
  }
  get namespace() {
    return this._namespace;
  }
  set namespace(value: string | undefined) {
    if (typeof value !== 'string') {
      this._namespace = '';
      return;
    };
    this._namespace = value;
  }
  get setter() {
    return this._setter;
  }
  set setter(setter: (str: string)=>any) {
    if (typeof setter !== 'function') throw new Error('Lang setter require a function');
    this._setter = setter;
  }
}

export class UILang extends HTMLElement{
  private _inited: boolean = false;
  key: string | null = null;
  constructor(){
    super();
  }
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.key = this.textContent;
    this.textContent = getLangByKey(this.key);
  }
}
