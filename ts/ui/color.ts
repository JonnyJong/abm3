import Color from "color";
import { layout } from "../helper/layout";
import { clamp } from "../helper/math";
import { Dialog } from "./dialog";

export class UIColor extends HTMLElement{
  private _inited: boolean = false;
  private _value = '#ffffff';
  constructor() {
    super();
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    if (this.hasAttribute('value')) {
      this.value = (this.getAttribute('value') as string);
    }
    this.style.background = this._value;
    this.addEventListener('click', ()=>{
      let picker = (document.createElement('ui-color-picker') as UIColorPicker);
      let dialog = new Dialog({
        title: '<ui-lang>color.choose</ui-lang>',
        content: picker,
        buttons: [{
          text: '<ui-lang>dialog.confirm</ui-lang>',
          level: 'confirm',
          action: ()=>{
            this.value = picker.color;
            dialog.close();
            this.dispatchEvent(new Event('change'));
          },
        },{
          text: '<ui-lang>dialog.cancel</ui-lang>',
          level: 'normal',
          action: ()=>{
            dialog.close();
          },
        }],
      });
      picker.color = this.value;
      dialog.show();
    });
  }
  get value(): string {
    return this._value;
  }
  set value(value: string) {
    value = (value.match(/#?[0-9a-fA-F]{0,6}/)?.[0] as string);
    if (value) {
      value = value.toUpperCase();
    } else {
      value = '';
    }
    this._value = UIColorPicker.fillHex(value);
    this.style.background = this._value;
  }
}

export class UIColorPicker extends HTMLElement{
  private _color: Color = Color('#ffffff');
  private _inited: boolean = false;
  private _spectrum!: HTMLDivElement;
  private _preview!: HTMLDivElement;
  private _brightness!: HTMLDivElement;
  private _hex!: HTMLInputElement;
  private _red!: HTMLInputElement;
  private _green!: HTMLInputElement;
  private _blue!: HTMLInputElement;
  private _hue!: HTMLInputElement;
  private _saturation!: HTMLInputElement;
  private _value!: HTMLInputElement;
  private _draging: number = 0;
  constructor() {
    super();
  }
  private _pointerupHandler = (ev: PointerEvent)=>{
    if (this._draging === 0) return;
    this._draging = 0;
  }
  private _pointermoveHandler = (ev: PointerEvent)=>{
    if (this._draging === 0) return;
    if (this._draging === 1) {
      let { left, top } = this._spectrum.getBoundingClientRect();
      this._color = this._color.hue(clamp(0, ev.x - left, 256) / 256 * 359.8);
      this._color = this._color.saturationv(100 - clamp(0, ev.y - top, 256) / 2.56)
    } else if (this._draging === 2) {
      this._color = this._color.value(clamp(0, ev.x - this._brightness.getBoundingClientRect().left - 8, 296) / 2.96);
    }
    this._setColor();
  }
  private _inputHandler = (ev: Event)=>{
    let target = (ev.target as HTMLInputElement);
    let value = Number(target.value);
    if (isNaN(value) || value < Number(target.min)) {
      target.value = '0';
    } else if (value > Number(target.max)) {
      target.value = target.max;
    }
    let type = target.getAttribute('t');
    if (!type) return;
    switch (type) {
      case 'saturation':
        this._color = this._color.saturationv(value);
        break;
      default:
        this._color = ((this._color as any)[type] as (value: number)=>Color)(value);
        break;
    }
    this._setColor(type);
  }
  private _focusHandler = (ev: Event)=>{
    let target = (ev.target as HTMLInputElement);
    (target as any).oldValue = target.value;
  }
  private _blurHandler = (ev: Event)=>{
    let target = (ev.target as HTMLInputElement);
    if (target.value === '') {
      target.value = (target as any).oldValue;
    } else {
      target.value = String(Number(target.value));
    }
    this._setColor();
  }
  static fillHex(value: string) {
    if (!value.match('#')) {
      value = '#' + value;
    }
    switch (value.length) {
      case 1:
        value = '#000000';
        break;
      case 4:
        let splited = value.split('');
        value = '#' + splited[1].repeat(2) + splited[2].repeat(2) + splited[3].repeat(2);
      case 7:
        break;
      default:
        value = '#' + value.split('#')[1].repeat(6).slice(0,6);
        break;
    }
    return value;
  }
  private _setColor(exclude?: string) {
    this._preview.style.background = this._color.hex();
    if (exclude !== 'spectrum') {
      this._spectrum.style.setProperty('--saturation', 100 - this._color.saturationv() + '%');
      this._spectrum.style.setProperty('--hue', this._color.hue() / 3.59 + '%');
    }
    if (exclude !== 'brightness') {
      this._brightness.style.setProperty('--value', String(this._color.value() / 100));
      this._brightness.style.backgroundColor = this._color.value(100).hex();
    }
    if (exclude !== 'hex') {
      this._hex.value = this._color.hex();
    }
    if (exclude !== 'red') {
      this._red.value = String(Math.ceil(this._color.red()));
    }
    if (exclude !== 'green') {
      this._green.value = String(Math.ceil(this._color.green()));
    }
    if (exclude !== 'blue') {
      this._blue.value = String(Math.ceil(this._color.blue()));
    }
    if (exclude !== 'hue') {
      this._hue.value = String(Math.ceil(this._color.hue()));
    }
    if (exclude !== 'saturation') {
      this._saturation.value = String(Math.ceil(this._color.saturationv()));
    }
    if (exclude !== 'value') {
      this._value.value = String(Math.ceil(this._color.value()));
    }
  }
  connectedCallback() {
    window.addEventListener('pointermove', this._pointermoveHandler);
    window.addEventListener('pointerup', this._pointerupHandler);
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/color');
    this._spectrum = (this.querySelector('.ui-color-spectrum') as HTMLDivElement);
    this._preview = (this.querySelector('.ui-color-preview') as HTMLDivElement);
    this._brightness = (this.querySelector('.ui-color-brightness') as HTMLDivElement);
    this._hex = (this.querySelector('.ui-color-hex') as HTMLInputElement);
    this._red = (this.querySelector('.ui-color-red') as HTMLInputElement);
    this._green = (this.querySelector('.ui-color-green') as HTMLInputElement);
    this._blue = (this.querySelector('.ui-color-blue') as HTMLInputElement);
    this._hue = (this.querySelector('.ui-color-hue') as HTMLInputElement);
    this._saturation = (this.querySelector('.ui-color-saturation') as HTMLInputElement);
    this._value = (this.querySelector('.ui-color-value') as HTMLInputElement);
    this._spectrum.addEventListener('pointerdown',(ev)=>{
      this._draging = 1;
      this._pointermoveHandler(ev);
    });
    this._brightness.addEventListener('pointerdown',(ev)=>{
      this._draging = 2;
      this._pointermoveHandler(ev);
    });
    this._hex.addEventListener('input',()=>{
      let value = this._hex.value.match(/#?[0-9a-fA-F]{0,6}/)?.[0];
      if (value) {
        this._hex.value = value.toUpperCase();
      } else {
        this._hex.value = '';
      }
      this._color = Color(UIColorPicker.fillHex(this._hex.value));
      this._setColor('hex');
    });
    this._hex.addEventListener('blur',()=>{
      this._hex.value = UIColorPicker.fillHex(this._hex.value);
      this._setColor();
    });
    this.querySelectorAll('.ui-color-container input').forEach((e)=>{
      e.addEventListener('input', this._inputHandler);
      e.addEventListener('focus', this._focusHandler);
      e.addEventListener('blur', this._blurHandler);
    });
  }
  disconnectedCallback() {
    window.removeEventListener('pointermove', this._pointermoveHandler);
    window.removeEventListener('pointerup', this._pointerupHandler);
  }
  get color(): string {
    return this._color.hex();
  }
  set color(value: string) {
    this._color = Color(value);
    this._setColor();
  }
}
