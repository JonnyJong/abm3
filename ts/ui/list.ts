import { CompiledObject, SettingGroup, SettingTemplate } from "./template";

export class UIList extends HTMLElement{
  private _inline: boolean = true;
  private _compiled: CompiledObject[] = [];
  private _template!: SettingGroup;
  private _container: HTMLDivElement;
  private _adder: HTMLButtonElement;
  constructor(){
    super();
    this._container = document.createElement('div');
    this._container.classList.add('ui-list-container');
    this._adder = document.createElement('button');
    this._adder.classList.add('ui-list-add');
    this._adder.innerHTML = '<div class="icon icon-Add"></div>';
    this._adder.addEventListener('click',()=>this.add());
  }
  init(template: SettingGroup){
    if (this._template !== undefined) return;
    this._template = template;
  }
  connectedCallback(){
    this.append(this._container, this._adder);
    this.classList.toggle('ui-list-inline', this._inline);
  }
  get inline(): boolean{
    return this._inline;
  }
  set inline(value: boolean) {
    this._inline = !!value;
    this.classList.toggle('ui-list-inline', this._inline);
  }
  get value() {
    let value: any[] = [];
    for (const item of this._compiled) {
      let obj = {};
      SettingTemplate._getValue(item, obj)
      value.push(obj);
    }
    return value;
  }
  set value(value: any[]) {
    this._compiled = [];
    this._container.innerHTML = '';
    value.forEach((v)=>this.add(v));
  }
  add(v?: any){
    if (this._template === undefined) return;
    let compiled = (SettingTemplate.compile(this._template, v) as CompiledObject);
    this._compiled.push(compiled);
    let item = document.createElement('div');
    item.classList.add('ui-list-item')
    let sorter = document.createElement('div');
    sorter.classList.add('ui-list-item-sort');
    let up = document.createElement('button');
    up.classList.add('ui-list-item-sort-up');
    up.innerHTML = '<div class="icon icon-ChevronUp"></div>';
    let down = document.createElement('button');
    down.classList.add('ui-list-item-sort-down');
    down.innerHTML = '<div class="icon icon-ChevronDown"></div>';
    sorter.append(up, down);
    compiled.element.classList.add('ui-list-item-content');
    let remover = document.createElement('button');
    remover.classList.add('ui-list-item-remove');
    remover.innerHTML = '<div class="icon icon-Remove"></div>';
    item.append(sorter, compiled.element, remover);
    this._container.append(item);
    up.addEventListener('click',()=>{
      let i = this._compiled.findIndex((i)=>i === compiled);
      if (i === 0) return;
      this._compiled[i] = this._compiled[i - 1];
      this._compiled[i - 1] = compiled;
      (item.previousSibling as HTMLDivElement).before(item);
    });
    down.addEventListener('click',()=>{
      let i = this._compiled.findIndex((i)=>i === compiled);
      if (i + 1 === this._compiled.length) return;
      this._compiled[i] = this._compiled[i + 1];
      this._compiled[i + 1] = compiled;
      (item.nextSibling as HTMLDivElement).after(item);
    });
    remover.addEventListener('click',()=>{
      let i = this._compiled.findIndex((i)=>i === compiled);
      this._compiled = this._compiled.slice(0,i).concat(this._compiled.slice(i + 1));
      item.remove();
    });
  }
}
