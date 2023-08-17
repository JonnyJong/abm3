import { clamp } from "../helper/math";

export class UILoader extends HTMLElement{
  private _inited: boolean = false;
  private _svg!: SVGSVGElement;
  private _path!: SVGPathElement;
  private _value: number = NaN;
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = '<svg class="ui-loder-loading" viewBox="0 0 60 60" height="60" width="60"><g fill="none"><path d="M3 30a27 27 0 1 0 54 0a27 27 0 1 0 -54 0z"></path></g></svg>';
    this._svg = this.querySelector('svg') as SVGSVGElement;
    this._path = this.querySelector('path') as SVGPathElement;
  }
  get value(): number {
    return this._value;
  }
  set value(value: number) {
    if (isNaN(value)) {
      this._value = NaN;
      this._svg.classList.add('ui-loder-loading');
      return;
    }
    this._svg.classList.remove('ui-loder-loading');
    this._value = clamp(0, value, 100);
    this._path.style.strokeDashoffset = String(this._value * 1.7 - 170);
  }
}
