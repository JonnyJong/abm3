import { db } from "../script/db";
import { layout } from "../helper/layout";
import { UISelect } from "./select";
import { Dialog } from "./dialog";
import { UIBangumi } from "./bangumi";
import { locale } from "../script/locale";

export type RackType = {type: 'none' | 'all' | 'category' | 'tag' | 'custom', value: string};

const ITEM_WIDTH = 276;
const ITEM_HEIGHT = 428;

function getRackTypeList(current: RackType): {name: string, value: RackType}[] {
  let list: {name: string, value: RackType}[] = [
    {name: '<ui-lang>rack.all_bangumi</ui-lang>', value: {type: 'all', value: ''}},
  ];
  for (const name in db.categories) {
    if (!Object.prototype.hasOwnProperty.call(db.categories, name)) continue;
    list.push({name: '<ui-lang>rack.category</ui-lang>' + name, value: {type: 'category', value: name}});
  }
  for (const name in db.tags) {
    if (!Object.prototype.hasOwnProperty.call(db.tags, name)) continue;
    list.push({name: '<ui-lang>rack.tag</ui-lang>' + name, value: {type: 'tag', value: name}});
  }
  switch (current.type) {
    case 'all':
      list[0].value = current;
      break;
    case 'category':
    case 'tag':
      let target = list.find((item)=>item.value.type === current.type && item.value.value === current.value);
      if (!target) break;
      target.value = current;
  }
  return list;
}

export function createSetRackTypeDialog(current: RackType = {type: 'none', value: ''}, title: string = '<ui-lang>rack.edit_rack</ui-lang>') {
  return new Promise<{isCanceled: boolean, value: RackType}>((resolve)=>{
    let selecter = (document.createElement('ui-select') as UISelect);
    selecter.classList.add('rack-edit-select');
    selecter.values = getRackTypeList(current);
    selecter.placeholder = '<ui-lang>rack.select_type</ui-lang>';
    selecter.value = current;
    
    let dialog = new Dialog({
      title,
      content: selecter,
      buttons: [
        {
          text: '<ui-lang>dialog.confirm</ui-lang>',
          action: ()=>{
            resolve({isCanceled: false, value: selecter.value || {type: 'none', value: ''}});
            dialog.close();
          },
          level: 'confirm',
        },
        {
          text: '<ui-lang>dialog.cancel</ui-lang>',
          action: ()=>{
            resolve({isCanceled: true, value: {type: 'none', value: ''}});
            dialog.close();
          },
        },
      ],
    });
    dialog.show();
  });
}

export class UIRack extends HTMLElement{
  private _inited: boolean = false;
  private _type: RackType = {type: 'none', value: ''};
  private _titleContent: string = '';
  private _title!: HTMLDivElement;
  private _body!: HTMLDivElement;
  private _btnEdit!: HTMLButtonElement;
  private _btnExpand!: HTMLButtonElement;
  private _list: string[] = [];
  connectedCallback() {
    window.addEventListener('resize', this._resizeHandler);
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/rack');
    this._title = this.querySelector('.rack-title') as HTMLDivElement;
    this._body = this.querySelector('.rack-body') as HTMLDivElement;
    this._btnEdit = this.querySelector('.rack-edit') as HTMLButtonElement;
    this._btnExpand = this.querySelector('.rack-expand') as HTMLButtonElement;
    this._btnEdit.addEventListener('click',async ()=>{
      let { isCanceled, value } = await createSetRackTypeDialog(this._type);
      if (isCanceled) return;
      this.type = value;
    });
    this._btnExpand.addEventListener('click',()=>{
      let folded = this.classList.toggle('rack-fold');
      this.classList.toggle('rack-folded', folded && this._list.length > 0);
    });
    this.title = this._titleContent;
    this.update();
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this._resizeHandler);
  }
  updateVList() {
    this._resizeHandler();
  }
  private _resizeHandler = ()=>{
    let width = this.getBoundingClientRect().width;
    let countInLine = Math.floor(width / ITEM_WIDTH);
    let offsetLeft = (width - countInLine * ITEM_WIDTH) / (countInLine + 1);
    let count = 0;
    let line = 0;
    for (const item of (this._body.children as unknown as HTMLElement[])) {
      item.style.left = count * ITEM_WIDTH + (count + 1) * offsetLeft + 'px';
      item.style.top = line * ITEM_HEIGHT + 'px';
      (item as any).line = line * ITEM_HEIGHT;
      count++;
      if (count >= countInLine) {
        count = 0;
        line++;
      }
    }
    this._body.style.setProperty('--height', Math.ceil(this._list.length / countInLine) * ITEM_HEIGHT + 'px');
    this.vListHandler();
  }
  get title() {
    return this._titleContent;
  }
  set title(title: string) {
    if (typeof title !== 'string') return;
    this._titleContent = title;
    if (!this._inited) return;
    this._title.innerHTML = this._titleContent;
  }
  get type() {
    return {type: this._type.type, value: this._type.value};
  }
  set type(value: RackType) {
    this._type = value;
    if (!this._inited) return;
    this.update();
    this.dispatchEvent(new Event('change'));
  }
  get list() {
    return this._list;
  }
  set list(value: string[]){
    if (this._type.type !== 'custom') return;
    this._list = value;
    this._renderList();
  }
  vListHandler() {
    let rect = this.getBoundingClientRect();
    let startH = Math.max(-rect.top, 0) - ITEM_HEIGHT;
    let endH = window.innerHeight - rect.top;
    for (const item of (this._body.children as unknown as HTMLElement[])) {
      if ((item as any).line >= startH && (item as any).line <= endH) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    }
  }
  update() {
    switch (this._type.type) {
      case "none":
        this.title = '';
        this._list = [];
        break;
      case "all":
        this.title = '<ui-lang>rack.all_bangumi</ui-lang>';
        this._list = Object.keys(db.items);
        break;
      case "category":
        this.title = '<ui-lang>rack.category</ui-lang>' + this._type.value;
        if (db.categories[this._type.value]) {
          this._list = Array.from(db.categories[this._type.value]);
        } else {
          (this._list as any) = undefined;
        }
        break;
      case "tag":
        this.title = `<ui-lang>rack.tag</ui-lang>` + this._type.value;
        if (db.tags[this._type.value]) {
          this._list = Array.from(db.tags[this._type.value]);
        } else {
          (this._list as any) = undefined;
        }
        break;
    }
    this._renderList();
  }
  private _renderList() {
    this._body.innerHTML = '';
    if (this._list === undefined) {
      this.title = [locale.rack.category_miss, locale.rack.tag_miss][['category', 'tag'].indexOf(this._type.type)].replace('%s', this._type.value);
      return this._resizeHandler();
    }
    this._list.sort((a, b)=>db.items[b].date.getTime() - db.items[a].date.getTime());
    for (const item of this._list) {
      let element = (document.createElement('ui-bangumi') as UIBangumi);
      element.id = item;
      this._body.append(element);
    }
    this._resizeHandler();
  }
}
