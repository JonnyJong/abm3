import { clamp } from "../helper/math";

export class UINumber extends HTMLElement{
  private _inited: boolean = false;
  private _max: number = Infinity;
  private _min: number = -Infinity;
  private _step: number = 1;
  private _value: number = 0;
  private _input: HTMLInputElement;
  private _add: HTMLDivElement;
  private _reduce: HTMLDivElement;
  private _addTimer: NodeJS.Timeout | null = null;
  private _reduceTimer: NodeJS.Timeout | null = null;
  constructor() {
    super();
    this._input = document.createElement('input');
    this._input.type = 'number';
    this._input.classList.add('ui-number-input');
    this._add = document.createElement('div');
    this._add.classList.add('ui-number-add');
    this._add.innerHTML = '<div class="icon icon-ChevronUp"></div>';
    this._reduce = document.createElement('div');
    this._reduce.classList.add('ui-number-reduce');
    this._reduce.innerHTML = '<div class="icon icon-ChevronDown"></div>';
  }
  private _addFn = ()=>{
    this.value += this._step;
    this._addTimer = setTimeout(this._addFn, 50);
  }
  private _reduceFn = ()=>{
    this.value -= this._step;
    this._reduceTimer = setTimeout(this._reduceFn, 50);
  }
  private _pointerupHandler = ()=>{
    if (this._addTimer !== null) {
      clearTimeout(this._addTimer);
      this._addTimer = null;
    }
    if (this._reduceTimer !== null) {
      clearTimeout(this._reduceTimer);
      this._reduceTimer = null;
    }
  }
  connectedCallback() {
    window.addEventListener('pointerup', this._pointerupHandler);
    if (this._inited) return;
    this._inited = true;
    this.append(this._input, this._add, this._reduce);
    this._input.value = String(this._value);
    this._add.addEventListener('pointerdown',(ev)=>{
      ev.preventDefault();
      this.value += this._step;
      this._addTimer = setTimeout(this._addFn, 500);
    });
    this._reduce.addEventListener('pointerdown',(ev)=>{
      ev.preventDefault();
      this.value -= this._step;
      this._reduceTimer = setTimeout(this._reduceFn, 500);
    });
    this._input.addEventListener('blur', ()=>{
      this.value = Number(this._input.value);
    });
    this._input.addEventListener('keydown',({key})=>{
      if (key !== 'Enter') return;
      this.value = Number(this._input.value);
    });
  }
  disconnectedCallback() {
    window.removeEventListener('pointerup', this._pointerupHandler);
  }
  get value(): number {
    return this._value;
  }
  set value(value: number) {
    if (typeof value !== 'number' || isNaN(value)) return;
    this._value = clamp(this._min, value, this._max);
    this._input.value = String(this._value);
  }
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    if (typeof value !== 'number' || isNaN(value)) return;
    this._max = value;
  }
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    if (typeof value !== 'number' || isNaN(value)) return;
    this._min = value;
  }
  get step(): number {
    return this._step;
  }
  set step(value: number) {
    if (typeof value !== 'number' || isNaN(value)) return;
    this._step = value;
  }
}
