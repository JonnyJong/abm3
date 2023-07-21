type ButtonOption = {
  icon: string,
  action?: Function,
  clear?: true,
  tooltip?: string,
  tooltipLocaleKey?: string,
};
type ListAutoCompleteOption = {
  autoComplete: string,
};
type ListItemOption = {
  html: string,
  action: Function,
};
export class UIText extends HTMLElement{
  private _inited: boolean = false;
  private _leftBtn: HTMLDivElement;
  private _input: HTMLInputElement;
  private _rightBtn: HTMLDivElement;
  private _list: HTMLDivElement;
  onconfirmed: ((this: UIText)=>void) | undefined;
  private _inputed(event?: boolean) {
    this.classList.toggle('ui-text-filled', this._input.value !== '');
    if (!event) return;
    this.dispatchEvent(new InputEvent('input'));
  }
  constructor(){
    super();
    this._leftBtn = document.createElement('div');
    this._leftBtn.classList.add('ui-text-btns', 'ui-text-btns-left');
    this._input = document.createElement('input');
    this._rightBtn = document.createElement('div');
    this._rightBtn.classList.add('ui-text-btns', 'ui-text-btns-right');
    this._list = document.createElement('div');
    this._list.classList.add('ui-text-list');
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.append(this._leftBtn, this._input, this._rightBtn, this._list);
    try {
      if ((this as any).placeholderText) {
        this._input.placeholder = (this as any).placeholderText;
      }
    } catch {}
    this._input.addEventListener('input', ()=>{
      this._inputed();
      delete (this._input as any).origin;
    });
    this._input.addEventListener('focus', ()=>{
      this.classList.toggle('ui-text-focus', true);
    });
    this._input.addEventListener('blur',()=>{
      this.classList.toggle('ui-text-focus', false);
    });
    this._input.addEventListener('keydown', ({key})=>{
      if (!['Enter','ArrowUp','ArrowDown'].includes(key)) return;
      let current = this.querySelector('.ui-text-item-current');
      if (current) {
        switch (key) {
          case 'Enter':
            if (typeof (current as any).action !== 'function') return;
            return (current as any).action();
          case 'ArrowUp':
            current.classList.remove('ui-text-item-current');
            current = (current.previousSibling as Element);
            this._list.classList.remove('ui-text-list-point');
            break;
          case 'ArrowDown':
            current.classList.remove('ui-text-item-current');
            current = (current.nextSibling as Element);
            this._list.classList.remove('ui-text-list-point');
            break;
        }
      } else {
        switch (key) {
          case 'ArrowUp':
            if (this._list.lastChild) {
              current = (this._list.lastChild as Element);
            }
            this._list.classList.remove('ui-text-list-point');
            break;
          case 'ArrowDown':
            if (this._list.firstChild) {
              current = (this._list.firstChild as Element);
            }
            this._list.classList.remove('ui-text-list-point');
            break;
        }
      }
      if (!current) {
        this._input.value = (this._input as any).origin;
        delete (this._input as any).origin;
        this._inputed();
        return;
      };
      if (typeof (this._input as any).origin !== 'string') {
        (this._input as any).origin = this._input.value;
      }
      current.classList.add('ui-text-item-current');
      if (current.classList.contains('ui-text-auto')) {
        this._input.value = (current.textContent as string);
      } else {
        this._input.value = (this._input as any).origin;
      }
      this._inputed();
    });
    this._list.addEventListener('pointermove',()=>{
      this._list.classList.add('ui-text-list-point');
    });
  }
  get value(): string {
    return this._input.value;
  }
  set value(value: string) {
    this._input.value = value;
    delete (this._input as any).origin;
    this._inputed(true);
  }
  private _setButtons(container: HTMLDivElement ,buttons: ButtonOption[]) {
    container.innerHTML = '';
    for (const item of buttons) {
      let btn = document.createElement('div');
      btn.classList.add('ui-text-btn');
      btn.innerHTML = `<div class="icon icon-${item.icon}"></div>`;
      if (item.tooltipLocaleKey) {
        btn.setAttribute('tooltip', `<ui-lang>${item.tooltipLocaleKey}</ui-lang>`);
      } else if (item.tooltip) {
        btn.setAttribute('tooltip', item.tooltip);
      }
      if (item.clear) {
        btn.classList.add('ui-text-clear');
        btn.addEventListener('pointerdown', (ev)=>{
          ev.preventDefault();
          this.clear();
        });
      } else if (typeof item.action === 'function') {
        btn.addEventListener('pointerdown', (ev)=>{
          ev.preventDefault();
          (item.action as Function)();
        });
      }
      container.append(btn);
    }
    return container.getBoundingClientRect().width;
  }
  set buttonsLeft(buttons: ButtonOption[]) {
    let width = this._setButtons(this._leftBtn, buttons);
    this._input.style.paddingLeft = 12 + width + 'px'; 
  }
  set buttonsRight(buttons: ButtonOption[]) {
    let width = this._setButtons(this._rightBtn, buttons);
    this._input.style.paddingRight = 12 + width + 'px'; 
  }
  set list(list: (ListAutoCompleteOption | ListItemOption)[]) {
    this._list.classList.remove('ui-text-list-point');
    this._list.innerHTML = '';
    for (const item of list) {
      let div = document.createElement('div');
      div.classList.add('ui-text-item');
      if (typeof (item as ListAutoCompleteOption).autoComplete === 'string') {
        div.classList.add('ui-text-auto');
        div.textContent = (item as ListAutoCompleteOption).autoComplete;
        div.addEventListener('pointerdown', (ev)=>{
          ev.preventDefault();
          this._input.value = (div.textContent as string);
          this._inputed(true);
        });
        this._list.append(div);
        continue;
      }
      div.innerHTML = (item as ListItemOption).html;
      (div as any).action = (item as ListItemOption).action;
      div.addEventListener('pointerdown', (ev)=>{
        ev.preventDefault();
        (div as any).action();
      });
      this._list.append(div);
    }
  }
  get placeholder(): string {
    return this._input.placeholder;
  }
  set placeholder(value: string) {
    this._input.placeholder = value;
  }
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(value: any) {
    this.toggleAttribute('disabled', !!value);
  }
  get invalid(): boolean {
    return this.hasAttribute('invalid');
  }
  set invalid(value: any) {
    this.toggleAttribute('invalid', !!value);
  }
  clear() {
    this._input.value = '';
    this._inputed(true);
  }
  focus() {
    this._input.focus();
  }
  blur() {
    this._input.blur();
  }
}
