import { timer } from "../helper/timer";
import { layout } from "../helper/layout";
import { VDOM, VDiv, VIcon } from "./vdom";
import { wash } from "../helper/wash";

export class UISettingItem extends HTMLElement{
  private _inited: boolean = false;
  private _icon: VIcon;
  private _name: VDiv;
  private _desc: VDiv;
  private _head: VDiv;
  private _headShell!: HTMLDivElement;
  private _body: VDiv;
  constructor() {
    super();
    this._icon = VDOM.create<VIcon>({type: 'icon', classList: ['ui-setting-item-icon']});
    this._icon.remove = ()=>{};
    this._name = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-name']});
    this._name.remove = ()=>{};
    this._desc = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-desc']});
    this._desc.remove = ()=>{};
    this._head = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-head']});
    this._head.remove = ()=>{};
    this._body = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-body']});
    this._body.remove = ()=>{};
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/setting-item', {body: true});
    this._headShell = this.querySelector('.ui-setting-item-head-shell') as HTMLDivElement;
    this._headShell.prepend(this._icon._element);
    this.querySelector('.ui-setting-item-info')?.append(this._name._element, this._desc._element);
    this.querySelector('.ui-setting-item-info')?.after(this._head._element);
    this.querySelector('.ui-setting-item-body-shell')?.append(this._body._element);
    this._headShell.addEventListener('click',async (ev)=>{
      let path = ev.composedPath();
      if (path.includes(this._head._element)) return;
      this.classList.toggle('ui-setting-item-expanded');
      this.classList.add('ui-setting-item-expanding');
      this.style.setProperty('--height', this._body.getBoundingClientRect().height + 'px');
      await timer(200);
      this.classList.remove('ui-setting-item-expanding');
    });
  }
  get icon(): VIcon {
    return this._icon;
  }
  get name(): VDiv {
    return this._name;
  }
  get description(): VDiv {
    return this._desc;
  }
  get head(): VDiv {
    return this._head;
  }
  get body(): VDiv {
    return this._body;
  }
  get value(): any {
    return Object.assign(this._head.data, this._body.data);
  }
  set value(value: string) {
    this._head.data = value;
    this._body.data = value;
  }
}
export class UISettingItemChild extends HTMLElement{
  private _inited: boolean = false;
  private _icon: VIcon;
  private _name: VDiv;
  private _desc: VDiv;
  private _head: VDiv;
  constructor() {
    super();
    this._icon = VDOM.create<VIcon>({type: 'icon', classList: ['ui-setting-item-icon']});
    this._icon.remove = ()=>{};
    this._name = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-name']});
    this._name.remove = ()=>{};
    this._desc = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-desc']});
    this._desc.remove = ()=>{};
    this._head = VDOM.create<VDiv>({type: 'div', classList: ['ui-setting-item-head']});
    this._head.remove = ()=>{};
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/setting-item', {body: false});
    (this.querySelector('.ui-setting-item-head-shell') as HTMLDivElement).prepend(this._icon._element);
    this.querySelector('.ui-setting-item-info')?.append(this._name._element, this._desc._element);
    this.querySelector('.ui-setting-item-info')?.after(this._head._element);
  }
  get icon(): VIcon {
    return this._icon;
  }
  get name(): VDiv {
    return this._name;
  }
  get description(): VDiv {
    return this._desc;
  }
  get head(): VDiv {
    return this._head;
  }
  get value(): any {
    return wash(this._head.data);
  }
  set value(value: string) {
    this._head.data = value;
  }
}
