import { layout } from "../helper/layout";

export class UISettingItem extends HTMLElement{
  private _inited: boolean = false;
  private _icon: HTMLDivElement;
  private _name: HTMLDivElement;
  private _desc: HTMLDivElement;
  private _head: HTMLDivElement;
  private _headShell!: HTMLDivElement;
  private _body: HTMLDivElement;
  constructor() {
    super();
    this._icon = document.createElement('div');
    this._icon.className = 'ui-setting-item-icon';
    this._name = document.createElement('div');
    this._name.className = 'ui-setting-item-name';
    this._desc = document.createElement('div');
    this._desc.className = 'ui-setting-item-desc';
    this._head = document.createElement('div');
    this._head.className = 'ui-setting-item-head';
    this._body = document.createElement('div');
    this._body.className = 'ui-setting-item-body';
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/setting-item', {body: true});
    this._headShell = (this.querySelector('.ui-setting-item-head-shell') as HTMLDivElement);
    this._headShell.prepend(this._icon);
    this.querySelector('.ui-setting-item-info')?.append(this._name, this._desc);
    this.querySelector('.ui-setting-item-info')?.after(this._head);
    this.querySelector('.ui-setting-item-body-shell')?.append(this._body);
    this._headShell.addEventListener('click',(ev)=>{
      let path = ev.composedPath();
      if (path.includes(this._head)) return;
      this.classList.toggle('ui-setting-item-expanded');
      this.classList.add('ui-setting-item-expanding');
      setTimeout(() => {
        this.classList.remove('ui-setting-item-expanding');
      }, 200);
      this.style.setProperty('--height', this._body.getBoundingClientRect().height + 'px');
    });
  }
  set icon(value: string | undefined){
    if (typeof value === 'string' && value !== '') {
      this._icon.innerHTML = `<div class="icon icon-${value}"></div>`;
    } else {
      this._icon.innerHTML = '';
    }
  }
  get name(): string {
    return this._name.innerHTML;
  }
  set name(value: string) {
    this._name.innerHTML = String(value);
  }
  get description(): string {
    return this._desc.innerHTML;
  }
  set description(value: string) {
    this._desc.innerHTML = String(value);
  }
  get head() {
    return this._head;
  }
  get body() {
    return this._body;
  }
}
export class UISettingItemChild extends HTMLElement{
  private _inited: boolean = false;
  private _icon: HTMLDivElement;
  private _name: HTMLDivElement;
  private _desc: HTMLDivElement;
  private _head: HTMLDivElement;
  constructor() {
    super();
    this._icon = document.createElement('div');
    this._icon.className = 'ui-setting-item-icon';
    this._name = document.createElement('div');
    this._name.className = 'ui-setting-item-name';
    this._desc = document.createElement('div');
    this._desc.className = 'ui-setting-item-desc';
    this._head = document.createElement('div');
    this._head.className = 'ui-setting-item-head';
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/setting-item', {body: false});
    (this.querySelector('.ui-setting-item-head-shell') as HTMLDivElement).prepend(this._icon);
    this.querySelector('.ui-setting-item-info')?.append(this._name, this._desc);
    this.querySelector('.ui-setting-item-info')?.after(this._head);
  }
  set icon(value: string | undefined){
    if (typeof value === 'string' && value !== '') {
      this._icon.innerHTML = `<div class="icon icon-${value}"></div>`;
    } else {
      this._icon.innerHTML = '';
    }
  }
  get name(): string {
    return this._name.innerHTML;
  }
  set name(value: string) {
    this._name.innerHTML = String(value);
  }
  get description(): string {
    return this._desc.innerHTML;
  }
  set description(value: string) {
    this._desc.innerHTML = String(value);
  }
  get head() {
    return this._head;
  }
}
