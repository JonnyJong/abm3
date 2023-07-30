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
};

type SettingButton = {
  type: 'button',
  text: string,
  action: ()=>void,
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
};
type SettingTextArea = {
  type: 'textarea',
  placeholder?: string,
};
type SettingSwitch = {
  type: 'switch',
};
type SettingColor = {
  type: 'color',
};
type SettingImage = {
  type: 'image',
};
type SettingRange = {
  type: 'range',
  max?: number,
  min?: number,
  step?: number,
};
type SettingNumber = {
  type: 'number',
  max?: number,
  min?: number,
  step?: number,
};
type SettingSelect = {
  type: 'select',
  values: Map<any, string>,
};
type SettingTags = {
  type: 'tags',
  autoComplete?: (value: string)=>string[] | void,
};

type SettingList = {
  type: 'list',
  inline?: boolean,
  template: SettingGroup,
};

type SettingText = {
  type: 'text',
  text: string,
};
type SettingGroupFlexbox = {
  type: 'flex',
};

type SettingItems = SettingButton | SettingInput | SettingTextArea | SettingSwitch | SettingColor | SettingImage | SettingRange | SettingNumber | SettingSelect | SettingTags;
type SettingLayouts = SettingText | SettingGroupFlexbox;

export type SettingGroup = {
  type: 'group',
  direction?: 'row' | 'column',
  items: {[key: string]: SettingLayouts | SettingItems | SettingList},
};
type SettingItemChild = {
  type: 'item',
  icon?: string,
  name: string,
  description?: string,
  items: {[key: string]: SettingItems},
};

type SettingItem = {
  type: 'item',
  icon?: string,
  name: string,
  description?: string,
  head: {[key: string]: SettingItems},
  body: {[key: string]: SettingItemChild | SettingGroup | SettingList},
};

type SettingPart = {
  title?: string,
  items: {[key: string]: SettingMessage | SettingItem},
};

type SettingOption = {
  [key: string]: SettingPart,
};

type SettingUI = SettingItem | SettingItemChild | SettingGroup | SettingLayouts | SettingItems | SettingMessage | SettingList;

type CompiledItem = {
  type: 'item',
  element: UISwitch | UIColor | UIImagePicker | UINumber | UIRange | UISelect | UIText | HTMLTextAreaElement | UIList | UITags,
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

export class SettingTemplate{
  _template: SettingOption;
  _compiled: {[key: string]: CompiledObject} = {};
  _element: HTMLElement;
  constructor(options: SettingOption, value: any) {
    this._template = options;
    this._element = document.createElement('div');
    this._element.className = 'settings';
    for (const key in options) {
      if (!Object.prototype.hasOwnProperty.call(options, key)) continue;
      // element
      let div = document.createElement('div');
      div.className = 'setting-part';
      // compiled
      this._compiled[key] = {
        type: 'object',
        element: div,
        items: {},
      };
      // title
      let title = document.createElement('div');
      title.className = 'setting-part-title';
      if (typeof options[key].title === 'string') {
        title.innerHTML = (options[key].title as string);
      }
      div.append(title);
      // items
      for (const i in options[key].items) {
        if (!Object.prototype.hasOwnProperty.call(options[key].items, i)) continue;
        let compiled = SettingTemplate.compile(options[key].items[i], value?.[key]?.[i]);
        this._compiled[key].items[i] = compiled;
        div.append(compiled.element);
      }
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
  static _getValue(obj: CompiledItem | CompiledLayout | CompiledObject) {
    switch (obj.type) {
      case "object":
        let value: {[key: string]: any} = {};
        for (const key in obj.items) {
          if (!Object.prototype.hasOwnProperty.call(obj.items, key)) continue;
          if (obj.items[key].type === 'layout') continue;
          value[key] = SettingTemplate._getValue(obj.items[key]);
        }
        return value;
      case "item":
        return obj.element.value;
    }
  }
  get value() {
    let value: {[key: string]: any} = {};
    for (const key in this._compiled) {
      if (!Object.prototype.hasOwnProperty.call(this._compiled, key)) continue;
      value[key] = SettingTemplate._getValue(this._compiled[key]);
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
      return{
        type: 'layout',
        element: div,
      };
    }
  };
  static numberCompile(objs: SettingNumber, value: any): CompiledItem {
    let element = (document.createElement('ui-number') as UINumber);
    element.value = value;
    if (typeof objs.max === 'number') {
      element.max = objs.max;
    }
    if (typeof objs.min === 'number') {
      element.min = objs.min;
    }
    if (typeof objs.step === 'number') {
      element.step = objs.step;
    }
    return{
      type: 'item',
      element,
    };
  }
  static itemCompile(objs: SettingItem | SettingItemChild, value: any): CompiledObject {
    let items: {[key: string]: CompiledItem | CompiledLayout | CompiledObject} = {};
    let element;
    if ('items' in objs) {
      element = (document.createElement('ui-setting-item-child') as UISettingItemChild);
      for (const key in objs.items) {
        if (!Object.prototype.hasOwnProperty.call(objs.items, key)) continue;
        let compiled = SettingTemplate.compile(objs.items[key], value?.[key]);
        items[key] = compiled;
        element.head.append(compiled.element);
      }
    } else {
      element = (document.createElement('ui-setting-item') as UISettingItem);
      for (const key in objs.head) {
        if (!Object.prototype.hasOwnProperty.call(objs.head, key)) continue;
        let compiled = SettingTemplate.compile(objs.head[key], value?.[key]);
        items[key] = compiled;
        element.head.append(compiled.element);
      }
      for (const key in objs.body) {
        if (!Object.prototype.hasOwnProperty.call(objs.body, key)) continue;
        let compiled = SettingTemplate.compile(objs.body[key], value?.[key]);
        items[key] = compiled;
        element.body.append(compiled.element);
      }
    }
    element.icon = objs.icon;
    element.name = objs.name;
    if (typeof objs.description === 'string') {
      element.description = objs.description;
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
    for (const key in objs.items) {
      if (!Object.prototype.hasOwnProperty.call(objs.items, key)) continue;
      let item = SettingTemplate.compile(objs.items[key], value?.[key]);
      compiled.items[key] = item;
      element.append(item.element);
    }
    return compiled;
  }
  static textCompile(objs: SettingText, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-text');
    element.innerHTML = objs.text;
    return{
      type: 'layout',
      element,
    };
  }
  static flexCompile(objs: SettingGroupFlexbox, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-group-flex');
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
    if (value !== undefined) {
      element.value = value;
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
    return{
      type: 'item',
      element,
    };
  }
  static textareaCompile(objs: SettingTextArea, value: any): CompiledItem {
    let element = document.createElement('textarea');
    if (typeof objs.placeholder === 'string') {
      element.placeholder = objs.placeholder;
    }
    if (value !== undefined) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
    };
  }
  static switchCompile(objs: SettingSwitch, value: any): CompiledItem {
    let element = (document.createElement('ui-switch') as UISwitch);
    if (value !== undefined) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
    };
  }
  static colorCompile(objs: SettingColor, value: any): CompiledItem {
    let element = (document.createElement('ui-color') as UIColor);
    if (value !== undefined) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
    };
  }
  static imageCompile(objs: SettingImage, value: any): CompiledItem {
    let element = (document.createElement('ui-image-picker') as UIImagePicker);
    if (value !== undefined) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
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
    if (value !== undefined) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
    };
  }
  static selectCompile(objs: SettingSelect, value: any): CompiledItem {
    let element = (document.createElement('ui-select') as UISelect);
    element.values = objs.values;
    element.value = value;
    return{
      type: 'item',
      element,
    };
  }
  static tagsCompile(objs: SettingTags, value: any): CompiledItem {
    let element = (document.createElement('ui-tags') as UITags);
    element.autoComplete = objs.autoComplete;
    if (Array.isArray(value)) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
    };
  }
  static messageCompile(objs: SettingMessage, value: any): CompiledLayout {
    let element = document.createElement('div');
    element.classList.add('setting-msg');
    if (['warn', 'error', 'success'].includes((objs.level as any))) {
      element.classList.add('setting-msg-' + objs.level);
    }
    element.innerHTML = objs.text;
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
    if (Array.isArray(value)) {
      element.value = value;
    }
    return{
      type: 'item',
      element,
    };
  }
};
