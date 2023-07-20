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
  constructor(option: SettingItemOption) {
    this.element = document.createElement('div');
    this.element.classList.add('setting-item');
    if (Array.isArray(option.classList)) {
      this.element.classList.add(...option.classList);
    }
    this.element.innerHTML = layout('ui/setting-item', option);
    this.head = (this.element.querySelector('.setting-item-head') as HTMLDivElement);
    this.body = (this.element.querySelector('.setting-item-body') as HTMLDivElement);
    this.element.addEventListener('click',(ev)=>{
      let path = ev.composedPath();
      if (path.includes(this.head)) return;
      this.element.classList.toggle('setting-item-expanded');
this.element.style.setProperty('--height', this.body.getBoundingClientRect().height + 'px');
    });
    this.element.querySelector('.setting-item-confirm')?.addEventListener('click',()=>{
      if (typeof this.onConfirm !== 'function') return;
      this.onConfirm();
    });
    this.element.querySelector('.setting-item-reset')?.addEventListener('click',()=>{
      if (typeof this.onReset !== 'function') return;
      this.onReset();
    });
  };
};
