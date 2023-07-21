import { clamp } from "../helper/math";

export class UISwitch extends HTMLElement{
  private _inited: boolean = false;
  private _value: boolean = false;
  private _shell: HTMLDivElement;
  private _toggler: HTMLDivElement;
  private _draging: boolean = false;
  private _disabled: boolean = false;
  private _stamp: number = 0;
  private _moved: boolean = false;
  private _x: number = 0;
  private _togglerX: number = 0;
  constructor(){
    super();
    this._shell = document.createElement('div');
    this._shell.classList.add('ui-switch-shell');
    this._toggler = document.createElement('div');
    this._toggler.classList.add('ui-switch-toggler');
    this._shell.append(this._toggler);
  }
  private _pointerupHandler = (ev: PointerEvent)=>{
    if (!this._draging) return;
    this._draging = false;
    this._toggler.classList.remove('ui-switch-switching');
    if (!this._moved) {
      this.value = !this.value;
      this._toggler.style.left = '';
      return;
    }
    this.value = this._toggler.offsetLeft > 12;
    this._toggler.style.left = '';
    this._moved = false;
  }
  private _pointermoveHandler = (ev: PointerEvent)=>{
    if (!this._draging) return;
    this._toggler.style.left = clamp(3, this._togglerX + ev.x - this._x, 23) + 'px';
    this._moved = true;
  }
  connectedCallback(){
    window.addEventListener('pointerup', this._pointerupHandler);
    window.addEventListener('pointermove', this._pointermoveHandler);
    if (this._inited) return;
    this.value = this.getAttribute('value') === 'true';
    this.disabled = this.hasAttribute('disabled');
    this._inited = true;
    this.append(this._shell);
    this._shell.addEventListener('pointerdown', (ev)=>{
      if (this._disabled) return;
      this._draging = true;
      this._x = ev.x;
      this._togglerX = this._toggler.offsetLeft;
      this._toggler.classList.add('ui-switch-switching');
    });
  }
  disconnectedCallback(){
    window.removeEventListener('pointerup', this._pointerupHandler);
    window.removeEventListener('pointermove', this._pointermoveHandler);
  }
  get value(): boolean {
    return this._value;
  }
  set value(value: boolean) {
    this._value = !!value;
    this._shell.classList.toggle('ui-switch-open', this._value);
  }
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = !!value;
    this._shell.classList.toggle('ui-switch-disabled', this._disabled);
  }
}
