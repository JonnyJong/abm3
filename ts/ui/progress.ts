import { clamp } from "../helper/math";

export class UIProgress extends HTMLElement{
  private _inited: boolean = false;
  private _value: number = NaN;
  private _thumb!: HTMLDivElement;
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = '</div><div class="ui-progress-track"></div><div class="ui-progress-thumb ui-progress-loading">';
    this._thumb = this.querySelector('.ui-progress-thumb') as HTMLDivElement;
    let attrValue = Number(this.getAttribute('value'));
    if (isNaN(this._value) && !isNaN(attrValue)) {
      this.value = attrValue;
    } else {
      this.value = this._value;
    }
  }
  get value(): number {
    return this._value;
  }
  set value(value: number) {
    if (isNaN(value)) {
      this._value = NaN;
      if (!this._inited) return;
      this._thumb.classList.add('ui-progress-loading');
      return;
    }
    this._value = clamp(0, value, 100);
    if (!this._inited) return;
    this._thumb.classList.remove('ui-progress-loading');
    this._thumb.style.width = this._value + '%';
  }
}
