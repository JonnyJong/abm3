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
  private _leftBtn: HTMLDivElement;
  private _input: HTMLInputElement;
  private _rightBtn: HTMLDivElement;
  private _list: HTMLDivElement;
  private _style: HTMLStyleElement;
  constructor(){
    super();
    this._leftBtn = document.createElement('div');
    this._leftBtn.classList.add('ui-text-btns', 'ui-text-btns-left');
    this._input = document.createElement('input');
    this._rightBtn = document.createElement('div');
    this._rightBtn.classList.add('ui-text-btns', 'ui-text-btns-right');
    this._list = document.createElement('div');
    this._style = document.createElement('style');
    this.append(this._leftBtn, this._input, this._rightBtn, this._list, this._style);
    try {
      if ((this as any).placeholderText) {
        this._input.placeholder = (this as any).placeholderText;
      }
    } catch {}
    this._input.addEventListener('input', ()=>{
      this.classList.toggle('ui-text-filled', this._input.value !== '')
    });
  }
  get value(): string {
    return this._input.value;
  }
  set value(value: string) {
    this._input.value = value;
    this.classList.toggle('ui-text-filled', this._input.value !== '')
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
  set list(list: (ListAutoCompleteOption | ListItemOption)[]) {}
  get placeholder(): string {
    return this._input.placeholder;
  }
  set placeholder(value: string) {
    this._input.placeholder = value;
  }
  clear() {
    this._input.value = '';
    this.classList.toggle('ui-text-filled', this._input.value !== '')
  }
  focus() {
    this._input.focus();
  }
  blur() {
    this._input.blur();
  }
}
