import { UIColor } from "./color";
import { UIImagePicker } from "./image";
import { UIList } from "./list";
import { UINumber } from "./number";
import { UIRange } from "./range";
import { UISelect } from "./select";
import { UISettingItem, UISettingItemChild } from "./settings";
import { UISwitch } from "./switch";
import { UITags } from "./tags";
import { UIText } from "./text";

type SettingMessage = {
  type: 'message',
  level?: 'info' | 'warn' | 'error' | 'success',
  text: string,
  key: string,
  classList?: string[],
};

type SettingButton = {
  type: 'button',
  text: string,
  action: ()=>void,
  key: string,
  classList?: string[],
};
type SettingInput = {
  type: 'input',
  autoComplete?: (value: string)=>string[] | void,
  placeholder?: string,
  buttonsLeft?: {
    icon: string,
    action?: ()=>void,
    clear?: true,
    tooltip?: string,
    tooltipLocaleKey?: string,
  }[],
  buttonsRight?: {
    icon: string,
    action?: ()=>void,
    clear?: true,
    tooltip?: string,
    tooltipLocaleKey?: string,
  }[],
  key: string,
  data: string,
  classList?: string[],
};
type SettingTextArea = {
  type: 'textarea',
  placeholder?: string,
  key: string,
  data: string,
  classList?: string[],
};
type SettingSwitch = {
  type: 'switch',
  key: string,
  data: string,
  classList?: string[],
};
type SettingColor = {
  type: 'color',
  key: string,
  data: string,
  classList?: string[],
};
type SettingImage = {
  type: 'image',
  key: string,
  data: string,
  classList?: string[],
};
type SettingRange = {
  type: 'range',
  max?: number,
  min?: number,
  step?: number,
  key: string,
  data: string,
  classList?: string[],
};
type SettingNumber = {
  type: 'number',
  max?: number,
  min?: number,
  step?: number,
  key: string,
  data: string,
  classList?: string[],
};
type SettingSelect = {
  type: 'select',
  values: Map<any, string>,
  key: string,
  data: string,
  classList?: string[],
};
type SettingTags = {
  type: 'tags',
  autoComplete?: (value: string)=>string[] | void,
  key: string,
  data: string,
  classList?: string[],
};

type SettingList = {
  type: 'list',
  inline?: boolean,
  template: SettingGroup,
  key: string,
  data: string,
  classList?: string[],
};

type SettingText = {
  type: 'text',
  text: string,
  key: string,
  classList?: string[],
};
type SettingGroupFlexbox = {
  type: 'flex',
  key: string,
  classList?: string[],
};

type SettingItems = SettingButton | SettingInput | SettingTextArea | SettingSwitch | SettingColor | SettingImage | SettingRange | SettingNumber | SettingSelect | SettingTags;
type SettingLayouts = SettingText | SettingGroupFlexbox;

export type SettingGroup = {
  type: 'group',
  direction?: 'row' | 'column',
  items: (SettingLayouts | SettingGroup | SettingList | SettingItems)[],
  key: string,
  classList?: string[],
};
type SettingItemChild = {
  type: 'item',
  icon?: string,
  name: string,
  description?: string,
  items: SettingItems[],
  key: string,
  classList?: string[],
};

type SettingItem = {
  type: 'item',
  icon?: string,
  name: string,
  description?: string,
  head: SettingItems[],
  body: (SettingItemChild | SettingGroup | SettingList | SettingItems)[],
  key: string,
  classList?: string[],
};

type SettingTitle = {
  type: 'title',
  text: string,
  key: string,
  classList?: string[],
};

export type SettingOption = SettingTitle | SettingMessage | SettingItem;

type SettingUI = SettingOption | SettingItemChild | SettingGroup | SettingLayouts | SettingItems | SettingList;

type CompiledItem = {
  type: 'item',
  element: UISwitch | UIColor | UIImagePicker | UINumber | UIRange | UISelect | UIText | HTMLTextAreaElement | UIList | UITags,
  data: string,
};
type CompiledLayout = {
  type: 'layout',
  element: HTMLDivElement | HTMLButtonElement,
};
export type CompiledObject = {
  type: 'object',
  items: {[key: string]: CompiledItem | CompiledObject | CompiledLayout},
  element: HTMLDivElement | UISettingItem | UISettingItemChild,
};

function getValueByKey(value: any, key: string): any {
  let keys = key.split('.');
  let target = value;
  for (const key of keys) {
    target = target?.[key];
  }
  return target;
}

function setValueByKey(obj: any, key: string, value: any) {
  let keys = key.split('.');
  let final = (keys.pop() as string);
  let target = obj;
  for (const key of keys) {
    if (target[key] !== undefined) continue;
    target[key] = {};
    target = target[key];
  }
  target[final] = value;
}

export class SettingTemplate{
  _template: SettingOption[];
  _compiled: {[key: string]: CompiledObject | CompiledLayout} = {};
  _element: HTMLElement;
  constructor(options: SettingOption[], value?: any) {
    this._template = options;
    this._element = document.createElement('div');
    this._element.className = 'settings';
    for (const item of options) {
      let compiled = (SettingTemplate.compile(item, value) as CompiledObject | CompiledLayout);
      this._compiled[item.key] = compiled;
      this._element.append(compiled.element);
    }
  };
  set(part: string, keys: string, type: string, value: any): boolean {
    let target: CompiledItem | CompiledLayout | CompiledObject = this._compiled[part];
    if (!target) return false;
    for (const key of keys.split('.')) {
      if (target.type !== 'object') return false;
      target = target.items[key];
    }
    (target.element as any)[type] = value;
    return true;
  };
  get(part: string, keys: string): any {
    let target: CompiledItem | CompiledLayout | CompiledObject = this._compiled[part];
    if (!target) return undefined;
    for (const key of keys.split('.')) {
      if (target.type !== 'object') return undefined;
      target = target.items[key];
    }
    if (target.type !== 'item') return undefined;
    return target.element.value;
  }
  static _getValue(obj: CompiledItem | CompiledLayout | CompiledObject, value: any) {
    switch (obj.type) {
      case "object":
        for (const key in obj.items) {
          if (!Object.prototype.hasOwnProperty.call(obj.items, key)) continue;
          if (obj.items[key].type === 'layout') continue;
          SettingTemplate._getValue(obj.items[key], value);
        }
        break;
      case "item":
        setValueByKey(value, obj.data, obj.element.value);
        break;
    }
  }
  get value() {
    let value: {[key: string]: any} = {};
    for (const key in this._compiled) {
      if (!Object.prototype.hasOwnProperty.call(this._compiled, key)) continue;
      SettingTemplate._getValue(this._compiled[key], value);
    }
    return value;
  };
  get element() {
    return this._element;
  };
  static compile(objs: SettingUI, value: any): CompiledObject | CompiledItem | CompiledLayout {
    if (objs.type + 'Compile' in SettingTemplate) {
      return (SettingTemplate as any)[objs.type + 'Compile'](objs, value);
    } else {
      let div = document.createElement('div');
      div.className = 'setting-group-flex';
      if (Array.isArray(objs.classList)) {
        div.classList.add(...objs.classList);
      }
      return{
        type: 'layout',
        element: div,
      };
    }
  };
  static numberCompile(objs: SettingNumber, value: any): CompiledItem {
    let element = (document.createElement('ui-number') as UINumber);
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (typeof objs.max === 'number') {
      element.max = objs.max;
    }
    if (typeof objs.min === 'number') {
      element.min = objs.min;
    }
    if (typeof objs.step === 'number') {
      element.step = objs.step;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static itemCompile(objs: SettingItem | SettingItemChild, value: any): CompiledObject {
    let items: {[key: string]: CompiledItem | CompiledLayout | CompiledObject} = {};
    let element;
    if ('items' in objs) {
      element = (document.createElement('ui-setting-item-child') as UISettingItemChild);
      for (const item of objs.items) {
        let compile = SettingTemplate.compile(item, value);
        items[item.key] = compile;
        element.head.append(compile.element);
      }
    } else {
      element = (document.createElement('ui-setting-item') as UISettingItem);
      for (const item of objs.head) {
        let compile = SettingTemplate.compile(item, value);
        items[item.key] = compile;
        element.head.append(compile.element);
      }
      for (const item of objs.body) {
        let compile = SettingTemplate.compile(item, value);
        items[item.key] = compile;
        element.body.append(compile.element);
      }
    }
    element.icon = objs.icon;
    element.name = objs.name;
    if (typeof objs.description === 'string') {
      element.description = objs.description;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'object',
      element,
      items,
    };
  }
  static groupCompile(objs: SettingGroup, value: any): CompiledObject {
    let element = document.createElement('div');
    element.classList.add('setting-group');
    element.classList.toggle('setting-group-column', objs.direction === 'column');
    let compiled: CompiledObject = {
      type: 'object',
      element,
      items: {},
    };
    for (const item of objs.items) {
      let compiledItem = SettingTemplate.compile(item, value);
      compiled.items[item.key] = compiledItem;
      element.append(compiledItem.element);
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return compiled;
  }
  static textCompile(objs: SettingText, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-text');
    element.innerHTML = objs.text;
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'layout',
      element,
    };
  }
  static flexCompile(objs: SettingGroupFlexbox, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-group-flex');
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'layout',
      element,
    };
  }
  static buttonCompile(objs: SettingButton, value: any): CompiledLayout {
    let element = document.createElement('button');
    element.classList.add('setting-button');
    element.innerHTML = objs.text;
    element.addEventListener('click', ()=>objs.action());
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'layout',
      element,
    };
  }
  static inputCompile(objs: SettingInput, value: any): CompiledItem {
    let element = (document.createElement('ui-text') as UIText);
    if (typeof objs.placeholder === 'string') {
      element.placeholder = objs.placeholder;
    }
    if (Array.isArray(objs.buttonsLeft)) {
      element.buttonsLeft = objs.buttonsLeft;
    }
    if (Array.isArray(objs.buttonsRight)) {
      element.buttonsRight = objs.buttonsRight;
    }
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (typeof objs.autoComplete === 'function') {
      element.addEventListener('input',()=>{
        let result = (objs.autoComplete as (value: string) => void | string[])(element.value);
        if (!Array.isArray(result)) {
          element.list = [];
          return;
        }
        let list: {autoComplete: string}[] = [];
        for (const item of result) {
          list.push({autoComplete: item});
        }
        element.list = list;
      });
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static textareaCompile(objs: SettingTextArea, value: any): CompiledItem {
    let element = document.createElement('textarea');
    if (typeof objs.placeholder === 'string') {
      element.placeholder = objs.placeholder;
    }
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static titleCompile(objs: SettingTitle, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-title');
    element.innerHTML = objs.text;
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'layout',
      element,
    };
  }
  static switchCompile(objs: SettingSwitch, value: any): CompiledItem {
    let element = (document.createElement('ui-switch') as UISwitch);
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static colorCompile(objs: SettingColor, value: any): CompiledItem {
    let element = (document.createElement('ui-color') as UIColor);
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static imageCompile(objs: SettingImage, value: any): CompiledItem {
    let element = (document.createElement('ui-image-picker') as UIImagePicker);
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static rangeCompile(objs: SettingRange, value: any): CompiledItem {
    let element = (document.createElement('ui-range') as UIRange);
    if (typeof objs.max === 'number') {
      element.max = objs.max;
    }
    if (typeof objs.min === 'number') {
      element.min = objs.min;
    }
    if (typeof objs.step === 'number') {
      element.step = objs.step;
    }
    let v = getValueByKey(value, objs.data);
    if (v !== undefined) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static selectCompile(objs: SettingSelect, value: any): CompiledItem {
    let element = (document.createElement('ui-select') as UISelect);
    element.values = objs.values;
    element.value = getValueByKey(value, objs.data);
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static tagsCompile(objs: SettingTags, value: any): CompiledItem {
    let element = (document.createElement('ui-tags') as UITags);
    element.autoComplete = objs.autoComplete;
    let v = getValueByKey(value, objs.data);
    if (Array.isArray(v)) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
  static messageCompile(objs: SettingMessage, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-msg');
    if (['warn', 'error', 'success'].includes((objs.level as any))) {
      element.classList.add('setting-msg-' + objs.level);
    }
    element.innerHTML = objs.text;
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'layout',
      element,
    };
  }
  static listCompile(objs: SettingList, value: any): CompiledItem {
    let element = (document.createElement('ui-list') as UIList);
    element.init(objs.template);
    if (typeof objs.inline === 'boolean') {
      element.inline = objs.inline;
    }
    let v = getValueByKey(value, objs.data);
    if (Array.isArray(v)) {
      element.value = v;
    }
    if (Array.isArray(objs.classList)) {
      element.classList.add(...objs.classList);
    }
    return{
      type: 'item',
      element,
      data: objs.data,
    };
  }
};
