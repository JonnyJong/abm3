import { layout } from "../helper/layout";

type SettingItemOption = {
  icon?: string,
  name: string,
  description?: string,
  classList?: string[],
  confirm?: boolean,
  reset?: boolean,
};
export class SettingItem {
  element: HTMLDivElement;
  head: HTMLDivElement;
  body: HTMLDivElement;
  onConfirm: Function | undefined;
  onReset: Function | undefined;
  private _confrimBtn: any;
  private _resetBtn: any;
  constructor(option: SettingItemOption) {
    this.element = document.createElement('div');
    this.element.classList.add('setting-item');
    if (Array.isArray(option.classList)) {
      this.element.classList.add(...option.classList);
    }
    this.element.innerHTML = layout('ui/setting-item', { option });
    this._confrimBtn = this.element.querySelector('.setting-item-confirm');
    this._resetBtn = this.element.querySelector('.setting-item-reset');
    this.head = (this.element.querySelector('.setting-item-head') as HTMLDivElement);
    this.body = (this.element.querySelector('.setting-item-body') as HTMLDivElement);
    this.element.addEventListener('click',(ev)=>{
      let path = ev.composedPath();
      if (path.includes(this.head) || path.includes(this._confrimBtn) || path.includes(this._resetBtn)) return;
      this.element.classList.toggle('setting-item-expanded');
      this.element.style.setProperty('--height', this.body.getBoundingClientRect().height + 'px');
    });
    this._confrimBtn?.addEventListener('click',()=>{
      if (typeof this.onConfirm !== 'function') return;
      this.onConfirm();
    });
    this._resetBtn?.addEventListener('click',()=>{
      if (typeof this.onReset !== 'function') return;
      this.onReset();
    });
  };
};
