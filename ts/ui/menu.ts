import { timer } from "../helper/timer";
import { OutlineRect, setPosition } from "../helper/position";

type MenuSeparator = {
  type: 'separator',
  disabled?: boolean
};
type MenuCustomItem = {
  type: 'custom',
  element: HTMLElement,
  disabled?: boolean
};
type MenuNormalItem = {
  type: 'item',
  name: string,
  icon?: string,
  action?: (event: PointerEvent)=>void,
  disabled?: false,
  shortcut?: string,
  // items?: Array<MenuItem>,
}
export type MenuItem = MenuSeparator | MenuCustomItem | MenuNormalItem;
export class Menu{
  shell: HTMLDivElement;
  container: HTMLDivElement;
  hider: HTMLDivElement;
  _removed = false;
  onhided: Function | undefined = ()=>{this.remove()};
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
      switch (item.type) {
        case "separator":
          element.classList.add('menu-separator');
          continue;
        case "custom":
          element.classList.add('menu-custom');
          element.append(item.element);
          continue;
        case "item":
          element.classList.add('menu-normal');
          if (typeof item.icon === 'string') {
            element.innerHTML = `<div class="icon icon-${item.icon}"></div>`;
          }
          element.innerHTML += `<div class="menu-item-name">${item.name}</div>`;
          if (item.shortcut) {
            element.innerHTML += `<div class="menu-item-short">${item.shortcut}</div>`;
          }
          if (typeof item.action === 'function') {
            element.addEventListener('pointerdown', ()=>this.hide());
            element.addEventListener('pointerdown', item.action);
          }
          break;
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
  async hide() {
    if (this._removed) return;
    this.shell.classList.add('menu-hide');
    this.hider.classList.remove('ui-hider-show');
    await timer(100);
    this.shell.classList.remove('menu-show-top', 'menu-show-bottom', 'menu-hide');
    if (typeof this.onhided === 'function') {
      this.onhided();
    }
  }
  async remove() {
    if (this._removed) return;
    await this.hide();
    this._removed = true;
    this.shell.remove();
    this.hider.remove();
  }
}
