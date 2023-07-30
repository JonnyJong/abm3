import { layout } from "../helper/layout";

export class UISettingItem extends HTMLElement{
  private _inited: boolean = false;
  private _icon!: HTMLDivElement;
  private _name!: HTMLDivElement;
  private _desc!: HTMLDivElement;
  private _head!: HTMLDivElement;
  private _headShell!: HTMLDivElement;
  private _body!: HTMLDivElement;
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/setting-item', {body: true});
    this._icon = (this.querySelector('.ui-setting-item-icon') as HTMLDivElement);
    this._name = (this.querySelector('.ui-setting-item-name') as HTMLDivElement);
    this._desc = (this.querySelector('.ui-setting-item-desc') as HTMLDivElement);
    this._head = (this.querySelector('.ui-setting-item-head') as HTMLDivElement);
    this._headShell = (this.querySelector('.ui-setting-item-head-shell') as HTMLDivElement);
    this._body = (this.querySelector('.ui-setting-item-body') as HTMLDivElement);
    this._headShell.addEventListener('click',(ev)=>{
      let path = ev.composedPath();
      if (path.includes(this._head)) return;
      this.classList.toggle('ui-setting-item-expanded');
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
  private _icon!: HTMLDivElement;
  private _name!: HTMLDivElement;
  private _desc!: HTMLDivElement;
  private _head!: HTMLDivElement;
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/setting-item', {body: false});
    this._icon = (this.querySelector('.ui-setting-item-icon') as HTMLDivElement);
    this._name = (this.querySelector('.ui-setting-item-name') as HTMLDivElement);
    this._desc = (this.querySelector('.ui-setting-item-desc') as HTMLDivElement);
    this._head = (this.querySelector('.ui-setting-item-head') as HTMLDivElement);
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
