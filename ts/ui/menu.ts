import { OutlineRect, setPosition } from "../helper/position";

type MenuItem = {
  separator?: boolean,
  HTML?: string,
  name?: string,
  icon?: string,
  items?: Array<MenuItem>,
  action?: (event: PointerEvent)=>void,
  disabled?: false,
  shortcut?: string,
};
export class Menu{
  shell: HTMLDivElement;
  container: HTMLDivElement;
  hider: HTMLDivElement;
  _removed = false;
  onhided: Function | undefined = ()=>{
    this.shell.remove();
    this.hider.remove();
  };
  constructor(items: Array<MenuItem>) {
    this.shell = document.createElement('div');
    this.shell.classList.add('menu-shell');
    this.container = document.createElement('div');
    this.container.classList.add('menu');
    this.shell.append(this.container);
    this.hider = document.createElement('div');
    this.hider.classList.add('ui-hider');
    for (const item of items) {
      let element = document.createElement('div');
      element.classList.add('menu-item')
      this.container.append(element);
      if (item.disabled) {
        element.setAttribute('disabled', '');
      }
      if (item.separator) {
        element.classList.add('menu-separator');
        continue;
      }
      if (typeof item.HTML === 'string') {
        element.classList.add('menu-html');
        element.innerHTML = item.HTML;
      }else{
        element.classList.add('menu-normal')
        if (typeof item.icon === 'string') {
          element.innerHTML = `<div class="icon icon-${item.icon}"></div>`;
        }
        element.innerHTML += `<div class="menu-item-name">${item.name ? item.name : ''}</div>`;
        if (item.shortcut) {
          element.innerHTML += `<div class="menu-item-short">${item.shortcut}</div>`;
        }
      }
      if (typeof item.action === 'function') {
        // @ts-ignore
        element.addEventListener('pointerdown', item.action);
      }
    }
    this.hider.addEventListener('pointerdown', (ev)=>{
      ev.preventDefault();
      this.hide();
    });
    document.body.append(this.hider);
    document.body.append(this.shell);
  }
  show(around: OutlineRect) {
    let rect = this.container.getBoundingClientRect()
    let side = setPosition(this.shell, rect, around);
    this.shell.style.setProperty('--h', rect.height + 'px');
    this.shell.style.setProperty('--w', rect.width + 'px');
    if (side.v === 'bottom') {
      this.shell.classList.add('menu-show-top');
    } else {
      this.shell.classList.add('menu-show-bottom');
    }
    this.hider.classList.add('ui-hider-show');
  }
  hide() {
    if (this._removed) return;
    this.shell.classList.add('menu-hide');
    this.hider.classList.remove('ui-hider-show');
    setTimeout(() => {
      this.shell.classList.remove('menu-show-top', 'menu-show-bottom', 'menu-hide');
      if (typeof this.onhided === 'function') {
        this.onhided();
      }
    }, 100);
  }
  remove() {
    this.hide();
  }
}
