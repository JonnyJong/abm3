import { clamp } from "../helper/math";

export class UIRange extends HTMLElement{
  private _inited: boolean = false;
  private _value: number = 0;
  private _min: number = 0;
  private _max: number = 100;
  private _step: number = 1;
  private _disabled: boolean = false;
  private _shell: HTMLDivElement;
  private _track: HTMLDivElement;
  private _slider: HTMLDivElement;
  private _sliderIndicator: HTMLDivElement;
  private _indicator: HTMLDivElement;
  private _thumb: HTMLDivElement;
  private _draging: boolean = false;
  private _x: number = 0;
  private _sliderX: number = 0;
  constructor() {
    super();
    this._shell = document.createElement('div');
    this._shell.classList.add('ui-range-shell');
    this._track = document.createElement('div');
    this._track.classList.add('ui-range-track');
    this._shell.append(this._track);
    this._thumb = document.createElement('div');
    this._thumb.classList.add('ui-range-thumb');
    this._track.append(this._thumb);
    this._slider = document.createElement('div');
    this._slider.classList.add('ui-range-slider');
    this._shell.append(this._slider)
    this._sliderIndicator = document.createElement('div');
    this._sliderIndicator.classList.add('ui-range-slider-indicator');
    this._slider.append(this._sliderIndicator);
    this._indicator = document.createElement('div');
    this._indicator.classList.add('ui-range-indicator');
    this._slider.append(this._indicator);
  }
  private _setValue(value: number) {
    if (typeof value !== 'number' || isNaN(value)) return;
    value = (value - this._min);
    value = value - (value % this._step) + this._min;
    this._value = clamp(this._min, value, this._max);
    this._shell.style.setProperty('--progress', (this._value - this._min) / (this._max - this._min) * 100 + '%');
    this._indicator.textContent = String(this._value);
  }
  private _pointerupHandler = (ev: PointerEvent)=>{
    if (!this._draging) return;
    this._draging = false;
    this._indicator.classList.remove('ui-range-indicator-show');
    this.dispatchEvent(new Event('change'));
  }
  private _pointermoveHandler = (ev: PointerEvent)=>{
    if (!this._draging) return;
    let progress = clamp(0, (this._sliderX + ev.x - this._x) / this._shell.getBoundingClientRect().width, 1);
    this._setValue((this._max - this._min) * progress + this._min);
    this._shell.style.setProperty('--progress', progress * 100 + '%');
    this.dispatchEvent(new InputEvent('input'));
  }
  connectedCallback() {
    window.addEventListener('pointermove', this._pointermoveHandler);
    window.addEventListener('pointerup', this._pointerupHandler);
    if (this._inited) return;
    this._inited = true;
    this.append(this._shell);
    this._shell.addEventListener('pointerdown', (ev)=>{
      if (this._disabled) return;
      this._draging = true;
      this._x = ev.x;
      let path = ev.composedPath();
      if (path.includes(this._slider)) {
        this._sliderX = this._slider.offsetLeft;
      } else {
        this._sliderX = ev.x - this._shell.getBoundingClientRect().x;
        this._pointermoveHandler(ev);
      }
      this._indicator.classList.add('ui-range-indicator-show');
    });
  }
  disconnectedCallback() {}
  get value(): number {
    return this._value;
  }
  set value(value: number) {
    this._setValue(value);
  }
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    if (typeof value !== 'number' || value === Infinity || value === -Infinity || isNaN(value)) return;
    this._min = value;
    this._setValue(this.value);
  }
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    if (typeof value !== 'number' || value === Infinity || value === -Infinity || isNaN(value)) return;
    this._max = value;
    this._setValue(this.value);
  }
  get step(): number {
    return this._step;
  }
  set step(value: number) {
    if (typeof value !== 'number' || value === Infinity || value === -Infinity || isNaN(value)) return;
    this._step = value;
    this._setValue(this.value);
  }
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = !!value;
  }
}
