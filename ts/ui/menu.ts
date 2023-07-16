type MenuItem = {
  separator?: boolean,
  HTML?: string,
  name?: string,
  icon?: string,
  items?: Array<MenuItem>,
  action?: Function,
  disabled?: false,
};
export class Menu{
  shell: HTMLDivElement;
  container: HTMLDivElement;
  hider: HTMLDivElement;
  _removed = false;
  onhided: Function | undefined;
  constructor(items: Array<MenuItem>) {
    this.shell = document.createElement('div');
    this.shell.classList.add('menu-shell');
    this.container = document.createElement('div');
    this.container.classList.add('menu');
    this.shell.append(this.container);
    this.hider = document.createElement('div');
    this.hider.classList.add('menu-hider');
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
      }
      /* if (Array.isArray(item.items)) {
        element.innerHTML += '<div class="icon icon-ChevronRight"></div>';
        let subMenu = new Menu(item.items);
        element.append(subMenu.shell);
        element.addEventListener('pointerenter', ()=>{
          subMenu.show();
        });
        element.addEventListener('pointerleave', ()=>{
          subMenu.hide();
        });
      } */
      if (typeof item.action === 'function') {
        // @ts-ignore
        element.addEventListener('click', item.action);
      }
    }
    this.hider.addEventListener('pointerdown', ()=>this.hide());
    document.body.append(this.hider);
    document.body.append(this.shell);
  }
  show(y?: number, r?: number, l?: number) {
    if (this._removed) return;
    let rect = this.container.getBoundingClientRect();
    this.shell.style.setProperty('--h', rect.height + 'px');
    this.shell.style.setProperty('--w', rect.width + 'px');
    if (typeof r === 'number' && r + rect.width <= window.innerWidth) {
      this.shell.style.left = r + 'px';
    }else if (typeof l === 'number') {
      this.shell.style.left = Math.max(l - rect.width, 0) + 'px';
    }
    if (typeof y === 'number') {
      if (y + rect.height <= window.innerHeight) {
        this.shell.style.top = y + 'px';
        this.shell.classList.add('menu-show-top');
      }else{
        this.shell.style.bottom = Math.min(y + rect.height, window.innerHeight) + 'px';
        this.shell.classList.add('menu-show-bottom');
      }
    }
    this.hider.classList.add('menu-hider-show');
  }
  hide() {
    if (this._removed) return;
    this.shell.classList.add('menu-hide');
    this.hider.classList.remove('menu-hider-show');
    setTimeout(() => {
      this.shell.classList.remove('menu-show-top', 'menu-show-bottom', 'menu-hide');
      if (typeof this.onhided === 'function') {
        this.onhided();
      }
    }, 100);
  }
  remove() {
    this.hide();
    this.shell.remove();
    this.hider.remove();
  }
}
