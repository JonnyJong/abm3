import { wash } from "../helper/wash";
import { UIColor } from "./color";
import { UIIcon } from "./icon";
import { UIImagePicker } from "./image";
import { LangTemplateMap, LocaleAuto, UILang } from "./lang";
import { UIList } from "./list";
import { UILoader } from "./loader";
import { UINumber } from "./number";
import { UIProgress } from "./progress";
import { UIRange } from "./range";
import { UISelect } from "./select";
import { UISettingItem, UISettingItemChild } from "./settings";
import { UISwitch } from "./switch";
import { UITags } from "./tags";
import { UIText } from "./text";

type VTextButtons = {
  icon: string,
  action?: Function,
  clear?: true,
  tooltip?: string,
  tooltipLocaleKey?: string,
}[];

export interface VDOMEvent{
  /** This is not used in Node.js and is provided purely for completeness. */
  readonly bubbles: boolean;
  /** Alias for event.stopPropagation(). This is not used in Node.js and is provided purely for completeness. */
  cancelBubble: () => void;
  /** True if the event was created with the cancelable option */
  readonly cancelable: boolean;
  /** This is not used in Node.js and is provided purely for completeness. */
  readonly composed: boolean;
  /** Returns an array containing the current EventTarget as the only entry or empty if the event is not being dispatched. This is not used in Node.js and is provided purely for completeness. */
  composedPath(): [VDOM?]
  /** Alias for event.target. */
  readonly currentTarget: VDOM | null;
  /** Is true if cancelable is true and event.preventDefault() has been called. */
  readonly defaultPrevented: boolean;
  /** This is not used in Node.js and is provided purely for completeness. */
  readonly eventPhase: 0 | 2;
  /** The `AbortSignal` "abort" event is emitted with `isTrusted` set to `true`. The value is `false` in all other cases. */
  readonly isTrusted: boolean;
  /** Sets the `defaultPrevented` property to `true` if `cancelable` is `true`. */
  preventDefault(): void;
  /** This is not used in Node.js and is provided purely for completeness. */
  returnValue: boolean;
  /** Alias for event.target. */
  readonly srcElement: VDOM | null;
  /** Stops the invocation of event listeners after the current one completes. */
  stopImmediatePropagation(): void;
  /** This is not used in Node.js and is provided purely for completeness. */
  stopPropagation(): void;
  /** The `EventTarget` dispatching the event */
  readonly target: VDOM | null;
  /** The millisecond timestamp when the Event object was created. */
  readonly timeStamp: number;
  /** Returns the type of event, e.g. "click", "hashchange", or "submit". */
  readonly type: string;
}

type VDOMEventHandler = (event: VDOMEvent)=>any;

type VDOMEvents = {
  "fullscreenchange"?: VDOMEventHandler,
  "fullscreenerror"?: VDOMEventHandler,
  "abort"?: VDOMEventHandler,
  "animationcancel"?: VDOMEventHandler,
  "animationend"?: VDOMEventHandler,
  "animationiteration"?: VDOMEventHandler,
  "animationstart"?: VDOMEventHandler,
  "auxclick"?: VDOMEventHandler,
  "beforeinput"?: VDOMEventHandler,
  "blur"?: VDOMEventHandler,
  "cancel"?: VDOMEventHandler,
  "canplay"?: VDOMEventHandler,
  "canplaythrough"?: VDOMEventHandler,
  "change"?: VDOMEventHandler,
  "click"?: VDOMEventHandler,
  "close"?: VDOMEventHandler,
  "compositionend"?: VDOMEventHandler,
  "compositionstart"?: VDOMEventHandler,
  "compositionupdate"?: VDOMEventHandler,
  "contextmenu"?: VDOMEventHandler,
  "copy"?: VDOMEventHandler,
  "cuechange"?: VDOMEventHandler,
  "cut"?: VDOMEventHandler,
  "dblclick"?: VDOMEventHandler,
  "drag"?: VDOMEventHandler,
  "dragend"?: VDOMEventHandler,
  "dragenter"?: VDOMEventHandler,
  "dragleave"?: VDOMEventHandler,
  "dragover"?: VDOMEventHandler,
  "dragstart"?: VDOMEventHandler,
  "drop"?: VDOMEventHandler,
  "durationchange"?: VDOMEventHandler,
  "emptied"?: VDOMEventHandler,
  "ended"?: VDOMEventHandler,
  "error"?: VDOMEventHandler,
  "focus"?: VDOMEventHandler,
  "focusin"?: VDOMEventHandler,
  "focusout"?: VDOMEventHandler,
  "formdata"?: VDOMEventHandler,
  "gotpointercapture"?: VDOMEventHandler,
  "input"?: VDOMEventHandler,
  "invalid"?: VDOMEventHandler,
  "keydown"?: VDOMEventHandler,
  "keypress"?: VDOMEventHandler,
  "keyup"?: VDOMEventHandler,
  "load"?: VDOMEventHandler,
  "loadeddata"?: VDOMEventHandler,
  "loadedmetadata"?: VDOMEventHandler,
  "loadstart"?: VDOMEventHandler,
  "lostpointercapture"?: VDOMEventHandler,
  "mousedown"?: VDOMEventHandler,
  "mouseenter"?: VDOMEventHandler,
  "mouseleave"?: VDOMEventHandler,
  "mousemove"?: VDOMEventHandler,
  "mouseout"?: VDOMEventHandler,
  "mouseover"?: VDOMEventHandler,
  "mouseup"?: VDOMEventHandler,
  "paste"?: VDOMEventHandler,
  "pause"?: VDOMEventHandler,
  "play"?: VDOMEventHandler,
  "playing"?: VDOMEventHandler,
  "pointercancel"?: VDOMEventHandler,
  "pointerdown"?: VDOMEventHandler,
  "pointerenter"?: VDOMEventHandler,
  "pointerleave"?: VDOMEventHandler,
  "pointermove"?: VDOMEventHandler,
  "pointerout"?: VDOMEventHandler,
  "pointerover"?: VDOMEventHandler,
  "pointerup"?: VDOMEventHandler,
  "progress"?: VDOMEventHandler,
  "ratechange"?: VDOMEventHandler,
  "reset"?: VDOMEventHandler,
  "resize"?: VDOMEventHandler,
  "scroll"?: VDOMEventHandler,
  "securitypolicyviolation"?: VDOMEventHandler,
  "seeked"?: VDOMEventHandler,
  "seeking"?: VDOMEventHandler,
  "select"?: VDOMEventHandler,
  "selectionchange"?: VDOMEventHandler,
  "selectstart"?: VDOMEventHandler,
  "slotchange"?: VDOMEventHandler,
  "stalled"?: VDOMEventHandler,
  "submit"?: VDOMEventHandler,
  "suspend"?: VDOMEventHandler,
  "timeupdate"?: VDOMEventHandler,
  "toggle"?: VDOMEventHandler,
  "touchcancel"?: VDOMEventHandler,
  "touchend"?: VDOMEventHandler,
  "touchmove"?: VDOMEventHandler,
  "touchstart"?: VDOMEventHandler,
  "transitioncancel"?: VDOMEventHandler,
  "transitionend"?: VDOMEventHandler,
  "transitionrun"?: VDOMEventHandler,
  "transitionstart"?: VDOMEventHandler,
  "volumechange"?: VDOMEventHandler,
  "waiting"?: VDOMEventHandler,
  "webkitanimationend"?: VDOMEventHandler,
  "webkitanimationiteration"?: VDOMEventHandler,
  "webkitanimationstart"?: VDOMEventHandler,
  "webkittransitionend"?: VDOMEventHandler,
  "wheel"?: VDOMEventHandler,
  [type: string]: VDOMEventHandler | undefined,
};

type VDOMAttribute = { [qualifiedName: string]: string };

type VDOMStyle = string | { [name: string]: string };

type VDOMLocale = {
  key: string,
  namespace?: string,
  setter: (vdom: VDOM, str: string)=>any,
  templateMap?: LangTemplateMap,
};

type VDivTemplate = {
  type: 'div',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VSpanTemplate = {
  type: 'span',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VBTemplate = {
  type: 'b',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VITemplate = {
  type: 'i',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VUTemplate = {
  type: 'u',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VDelTemplate = {
  type: 'del',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VBRTemplate = {
  type: 'br',
  events?: VDOMEvents,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
};

type VImageTemplate = {
  type: 'img',
  events?: VDOMEvents,
  src?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VButtonTemplate = {
  type: 'button',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
};

type VInputTemplate = {
  type: 'input',
  events?: VDOMEvents,
  value?: string,
  placeholder?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

type VTextAreaTemplate = {
  type: 'textarea',
  events?: VDOMEvents,
  value?: string,
  placeholder?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

type VColorTemplate = {
  type: 'color',
  events?: VDOMEvents,
  value?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  dataKey?: string,
};

type VImagePickerTemplate = {
  type: 'image-picker',
  events?: VDOMEvents,
  value?: string,
  default?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

type VLangTemplate = {
  type: 'lang',
  events?: VDOMEvents,
  key: string,
  namespace?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  templateMap?: LangTemplateMap,
};

type VIconTemplate = {
  type: 'icon',
  events?: VDOMEvents,
  key?: string,
  namespace?: string,
  image?: boolean,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
};

type VListTemplate = {
  type: 'list',
  events?: VDOMEvents,
  value?: any[],
  inline?: boolean,
  template: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  dataKey?: string,
};

type VLoaderTemplate = {
  type: 'loader',
  events?: VDOMEvents,
  value?: number,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
};

type VProgressTemplate = {
  type: 'progress',
  events?: VDOMEvents,
  value?: number,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
};

type VNumberTemplate = {
  type: 'number',
  events?: VDOMEvents,
  value?: number,
  max?: number,
  min?: number,
  step?: number,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  dataKey?: string,
};

type VRangeTemplate = {
  type: 'range',
  events?: VDOMEvents,
  value?: number,
  max?: number,
  min?: number,
  step?: number,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  dataKey?: string,
};

type VSelectTemplate = {
  type: 'select',
  events?: VDOMEvents,
  value?: any,
  values?: {name: string, value: any}[],
  placeholder?: string,
  group?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

type VSwitchTemplate = {
  type: 'switch',
  events?: VDOMEvents,
  value?: boolean,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  dataKey?: string,
};

type VTagsTemplate = {
  type: 'tags',
  events?: VDOMEvents,
  value?: string[],
  autoComplete?: (value: string)=>string[] | void,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  dataKey?: string,
};

type VTextTemplate = {
  type: 'text',
  events?: VDOMEvents,
  value?: string,
  placeholder?: string,
  buttonsLeft?: VTextButtons,
  buttonsRight?: VTextButtons,
  list?: {autoComplete: string}[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

type VSettingItemTemplate = {
  type: 'setting',
  icon?: VIconTemplate,
  name?: VDOMTemplate[],
  description?: VDOMTemplate[],
  head?: VDOMTemplate[],
  body?: VDOMTemplate[],
  events?: VDOMEvents,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

type VSettingItemChildTemplate = {
  type: 'setting-child',
  icon?: VIconTemplate,
  name?: VDOMTemplate[],
  description?: VDOMTemplate[],
  head?: VDOMTemplate[],
  events?: VDOMEvents,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  locale?: VDOMLocale,
  dataKey?: string,
};

export type VDOMTemplate = VDivTemplate | VSpanTemplate | VITemplate | VBTemplate | VUTemplate | VDelTemplate | VBRTemplate | VImageTemplate | VButtonTemplate | VInputTemplate | VTextAreaTemplate | VColorTemplate | VImagePickerTemplate | VLangTemplate | VIconTemplate | VListTemplate | VLoaderTemplate | VProgressTemplate | VNumberTemplate | VRangeTemplate | VSelectTemplate | VSwitchTemplate | VTagsTemplate | VTextTemplate | VSettingItemTemplate | VSettingItemChildTemplate;

type VDOMObject = VDiv | VSpan | VI | VB | VU | VDel | VBR | VImg | VButton | VInput | VTextArea | VColor | VImagePicker | VLang | VIcon | VList | VLoader | VProgress | VNumber | VRange | VSelect | VSwitch | VTags | VText | VSettingItem | VSettingItemChild;

class VDOMLocaleObject{
  private _vdom: VDOM;
  private _localeAuto: LocaleAuto;
  private _setter: (vdom: VDOM, str: string) => any = ()=>{};
  constructor(vdom: VDOM, option?: VDOMLocale) {
    this._vdom = vdom;
    if (typeof option?.setter === 'function') {
      this._setter = option?.setter;
    }
    this._localeAuto = new LocaleAuto({
      key: option?.key || '',
      namespace: option?.namespace,
    }, (str: string)=>this._setter(this._vdom, str));
  }
  get key(): string {
    return this._localeAuto.key;
  }
  set key(value: string) {
    this._localeAuto.key = value;
  }
  get namespace(): string {
    return this._localeAuto.namespace;
  }
  set namespace(value: string | undefined) {
    this._localeAuto.namespace = value;
  }
  get setter() {
    return this._setter;
  }
  set setter(setter: (vdom: VDOM, str: string) => any) {
    if (typeof setter !== 'function') throw new Error('LocaleAuto setter require a function');
    this._setter = setter;
  }
  get getTemplate(): LocaleAuto["getTemplate"] {
    return this._localeAuto.getTemplate
  }
  get setTemplate(): LocaleAuto["setTemplate"] {
    return this._localeAuto.setTemplate
  }
  get removeTemplate(): LocaleAuto["removeTemplate"] {
    return this._localeAuto.removeTemplate
  }
}

class VDOMEventObject{
  private _vdom: VDOM;
  private _handlers: { [type: string]: Set<VDOMEventHandler> } = {};
  constructor(vdom: VDOM) {
    this._vdom = vdom;
  }
  composedPath = (target: VDOM)=>{
    return ()=>{
      if (!target) return [];
      let path: VDOM[] = [target];
      let current = target;
      while (current.parent) {
        current = current.parent;
        path.push(current);
      }
      return path;
    }
  }
  on(type: string, handler: VDOMEventHandler) {
    if (!(this._handlers[type] instanceof Set)) {
      this._handlers[type] = new Set();
      this._vdom._element.addEventListener(type, this.eventHandler);
    }
    this._handlers[type].add(handler);
  }
  off(type: string, handler: VDOMEventHandler) {
    if (!(this._handlers[type] instanceof Set)) return;
    this._handlers[type].delete(handler);
  }
  static getVDOM(element: Node | null): VDOM | null {
    let current: Node | null = element;
    if (!current) return null;
    do {
      if ((current as any).vdom) {
        return (current as any).vdom;
      }
      current = current.parentNode;
    } while (current && current.parentNode);
    return null;
  }
  eventHandler = (event: Event)=>{
    let newEvent = wash<any>(event);
    newEvent.target = VDOMEventObject.getVDOM(event.target as Node);
    newEvent.currentTarget = VDOMEventObject.getVDOM(event.currentTarget as Node);
    newEvent.srcElement = VDOMEventObject.getVDOM(event.srcElement as Node);
    newEvent.composedPath = this.composedPath(newEvent.target);
    this._handlers[event.type].forEach(async (handler)=>handler(newEvent));
  }
}

function copyVDOMToVDOM(clone: VDOM, origin: VDOM, deep?: boolean) {
  clone.attributes = origin.attributes;
  clone.disabled = origin.disabled;
  clone.inert = origin.inert;
  if ((origin as any).locale instanceof VDOMLocaleObject) {
    (clone as any).locale.key = (origin as any).locale.key;
    (clone as any).locale.namespace = (origin as any).locale.namespace;
    (clone as any).locale.setter = (origin as any).locale.setter;
    (clone as any).locale.setTemplate((origin as any).locale.getTemplate());
  }
  clone.data = origin.data;
  if (deep) {
    for (const child of origin.children) {
      clone.append(child.clone(true));
    }
  }
}

function cloneVDOM<T>(prototype: any, origin: VDOM, deep?: boolean): T {
  let clone = new prototype() as VDOM;
  copyVDOMToVDOM(clone, origin, deep);
  return clone as T;
}

function getData(value: any, keys: string) {
  let target = value;
  for (const key of keys.split('.')) {
    target = target?.[key];
  }
  return target;
}
function setData(value: any, key: string) {
  let result: any = {};
  let target: any = result;
  let keys = key.split('.');
  for (let i = 0; i < keys.length; i++) {
    if (i >= keys.length - 1) {
      target[keys[i]] = value;
      return result;
    }
    target[keys[i]] = {};
    target = target[keys[i]];
  }
}

function initVDOMLocale(vdom: VDOM, locale?: VDOMLocale) {
  if (!((vdom as any).locale instanceof VDOMLocaleObject && locale)) return;
  (vdom as any).locale.key = locale.key;
  (vdom as any).locale.namespace = locale.namespace;
  (vdom as any).locale.setter = locale.setter;
  if (locale.templateMap) {
    (vdom as any).locale.setTemplate(locale.templateMap);
  }
}

function initVIcon(vdom: VIcon, template: VIconTemplate) {
  if (typeof template.key === 'string') {
    vdom.key = template.key;
  }
  if (typeof template.namespace === 'string') {
    vdom.namespace = template.namespace;
  }
  if (typeof template.image === 'boolean') {
    vdom.image = template.image;
  }
}

function initVDOMChildren(vdom: VDiv | VSpan | VI | VB | VU | VDel | VButton, templates: VDOMTemplate[]) {
  for (const child of templates) {
    vdom.append(VDOM.create(child));
  }
}

function initVDOMWithChildren(vdom: VDiv | VSpan | VI | VB | VU | VDel | VButton, template: VDivTemplate | VSpanTemplate | VITemplate | VBTemplate | VUTemplate | VDelTemplate | VButtonTemplate) {
  if (typeof template.text === 'string') {
    vdom.text = template.text;
  }
  if (Array.isArray(template.children)) {
    initVDOMChildren(vdom, template.children)
  }
}

function initVDOM(vdom: VDOM, template: VDOMTemplate) {
  if (template.attribute) {
    vdom.attributes = template.attribute;
  }
  if (template.classList) {
    vdom.classList.add(...template.classList);
  }
  if (template.events) {
    for (const type of Object.keys(template.events)) {
      if (typeof template.events[type] !== 'function') continue;
      vdom.event.on(type, template.events[type] as VDOMEventHandler);
    }
  }
  switch (typeof template.style) {
    case "string":
      vdom.style.cssText = template.style;
      break;
    case "object":
      for (const key of Object.keys(template.style)) {
        if (typeof (vdom.style as unknown as {[name: string]: string})[key] !== 'string') continue;
        (vdom.style as unknown as {[name: string]: string})[key] = template.style[key];
      }
      break;
  }
  initVDOMLocale(vdom, (template as any).locale);
}

export class VDOM{
  static create<T extends VDOMObject>(template: VDOMTemplate): T {
    let vdom;
    switch (template.type) {
      case "number":
        vdom = new VNumber();
        if (typeof template.value === 'number') {
          vdom.value = template.value;
        }
        if (typeof template.max === 'number') {
          vdom.max = template.max;
        }
        if (typeof template.min === 'number') {
          vdom.min = template.min;
        }
        if (typeof template.step === 'number') {
          vdom.step = template.step;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "div":
        vdom = new VDiv();
        initVDOMWithChildren(vdom, template);
        break;
      case "span":
        vdom = new VSpan();
        initVDOMWithChildren(vdom, template);
        break;
      case "i":
        vdom = new VI();
        initVDOMWithChildren(vdom, template);
        break;
      case "b":
        vdom = new VB();
        initVDOMWithChildren(vdom, template);
        break;
      case "u":
        vdom = new VU();
        initVDOMWithChildren(vdom, template);
        break;
      case "del":
        vdom = new VDel();
        initVDOMWithChildren(vdom, template);
        break;
      case "br":
        vdom = new VBR();
        break;
      case "img":
        vdom = new VImg();
        if (typeof template.src === 'string') {
          vdom.src = template.src;
        }
        break;
      case "button":
        vdom = new VButton();
        initVDOMWithChildren(vdom, template);
        break;
      case "input":
        vdom = new VInput();
        if (typeof template.value === 'string') {
          vdom.value = template.value;
        }
        if (typeof template.placeholder === 'string') {
          vdom.placeholder = template.placeholder;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "textarea":
        vdom = new VTextArea();
        if (typeof template.value === 'string') {
          vdom.value = template.value;
        }
        if (typeof template.placeholder === 'string') {
          vdom.placeholder = template.placeholder;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "color":
        vdom = new VColor();
        if (typeof template.value === 'string') {
          vdom.value = template.value;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "image-picker":
        vdom = new VImagePicker();
        if (typeof template.value === 'string') {
          vdom.value = template.value;
        }
        if (typeof template.default === 'string') {
          vdom.default = template.default;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "lang":
        vdom = new VLang();
        if (typeof template.key === 'string') {
          vdom.key = template.key;
        }
        if (typeof template.namespace === 'string') {
          vdom.namespace = template.namespace;
        }
        if (template.templateMap) {
          vdom.setTemplate(template.templateMap);
        }
        break;
      case "icon":
        vdom = new VIcon();
        initVIcon(vdom, template);
        break;
      case "list":
        vdom = new VList();
        vdom.template = VDOM.create({type: 'div', children: template.template});
        if (Array.isArray(template.value)) {
          vdom.value = template.value;
        }
        if (typeof template.inline === 'boolean') {
          vdom.inline = template.inline;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "loader":
        vdom = new VLoader();
        if (typeof template.value === 'number') {
          vdom.value = template.value;
        }
        break;
      case "progress":
        vdom = new VProgress();
        if (typeof template.value === 'number') {
          vdom.value = template.value;
        }
        break;
      case "range":
        vdom = new VRange();
        if (typeof template.value === 'number') {
          vdom.value = template.value;
        }
        if (typeof template.max === 'number') {
          vdom.max = template.max;
        }
        if (typeof template.min === 'number') {
          vdom.min = template.min;
        }
        if (typeof template.step === 'number') {
          vdom.step = template.step;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "select":
        vdom = new VSelect();
        vdom.value = template.value;
        if (Array.isArray(template.values)) {
          vdom.values = template.values;
        }
        if (typeof template.placeholder === 'string') {
          vdom.placeholder = template.placeholder;
        }
        if (typeof template.group === 'string') {
          vdom.group = template.group;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "switch":
        vdom = new VSwitch();
        if (typeof template.value === 'boolean') {
          vdom.value = template.value;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "tags":
        vdom = new VTags();
        if (Array.isArray(template.value)) {
          vdom.value = template.value;
        }
        if (typeof template.autoComplete === 'function') {
          vdom.autoComplete = template.autoComplete;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "text":
        vdom = new VText();
        if (typeof template.value === 'string') {
          vdom.value = template.value;
        }
        if (typeof template.placeholder === 'string') {
          vdom.placeholder = template.placeholder;
        }
        if (template.buttonsLeft) {
          vdom.buttonsLeft = template.buttonsLeft;
        }
        if (template.buttonsRight) {
          vdom.buttonsRight = template.buttonsRight;
        }
        if (Array.isArray(template.list)) {
          vdom.list = template.list;
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "setting":
        vdom = new VSettingItem();
        if (template.icon) {
          initVIcon(vdom.icon, template.icon);
          initVDOM(vdom.icon, template.icon);
        }
        if (template.name) {
          initVDOMChildren(vdom.name, template.name);
        }
        if (template.description) {
          initVDOMChildren(vdom.description, template.description);
        }
        if (template.head) {
          initVDOMChildren(vdom.head, template.head);
        }
        if (template.body) {
          initVDOMChildren(vdom.body, template.body);
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
      case "setting-child":
        vdom = new VSettingItemChild();
        if (template.icon) {
          initVIcon(vdom.icon, template.icon);
          initVDOM(vdom.icon, template.icon);
        }
        if (template.name) {
          initVDOMChildren(vdom.name, template.name);
        }
        if (template.description) {
          initVDOMChildren(vdom.description, template.description);
        }
        if (template.head) {
          initVDOMChildren(vdom.head, template.head);
        }
        if (typeof template.dataKey === 'string') {
          vdom.dataKey = template.dataKey;
        }
        break;
    }
    initVDOM(vdom, template);
    return vdom as T;
  }
  _element!: HTMLElement;
  private _event: VDOMEventObject = new VDOMEventObject(this);
  prepend(...vdoms: VDOM[]): void {
    let nodes = [];
    for (const vdom of vdoms) {
      nodes.push(vdom._element);
    }
    return this._element.prepend(...nodes);
  }
  append(...vdoms: VDOM[]): void {
    let nodes = [];
    for (const vdom of vdoms) {
      nodes.push(vdom._element);
    }
    return this._element.append(...nodes);
  }
  before(...vdoms: VDOM[]): void {
    let nodes = [];
    for (const vdom of vdoms) {
      nodes.push(vdom._element);
    }
    return this._element.before(...nodes);
  }
  after(...vdoms: VDOM[]): void {
    let nodes = [];
    for (const vdom of vdoms) {
      nodes.push(vdom._element);
    }
    return this._element.after(...nodes);
  }
  remove(): void {
    return this._element.remove();
  }
  get nextSibling(): VDOM | null {
    if (!(this._element.nextSibling as any)?.vdom) return null;
    return (this._element.nextSibling as any).vdom;
  }
  get previousSibling(): VDOM | null {
    if (!(this._element.previousSibling as any)?.vdom) return null;
    return (this._element.previousSibling as any).vdom;
  }
  get parent(): VDOM | null {
    if (!(this._element.parentNode as any)?.vdom) return null;
    return (this._element.parentNode as any).vdom;
  }
  get children(): VDOM[] {
    let result: VDOM[] = [];
    for (const element of this._element.children) {
      if (!(element as any).vdom) continue;
      result.push((element as any).vdom);
    }
    return result;
  }
  clone(deep?: boolean): VDOM {
    return new VDOM();
  }
  contains(other: VDOM): boolean {
    return this._element.contains(other._element);
  }
  querySelectorAll(selector: string): VDOM[] {
    let elements = this._element.querySelectorAll(selector);
    let result: VDOM[] = [];
    elements.forEach((element)=>{
      if (!(element as any).vdom) return;
      result.push((element as any).vdom);
    });
    return result;
  }
  get event(): VDOMEventObject {
    return this._event;
  }
  get classList(): DOMTokenList {
    return this._element.classList;
  }
  get className(): string {
    return this._element.className;
  }
  set className(value: string) {
    this._element.className = value;
  }
  get attributes(): VDOMAttribute {
    let result: VDOMAttribute = {};
    for (const item of this._element.attributes) {
      result[item.name] = item.value;
    }
    return result;
  }
  set attributes(values: VDOMAttribute) {
    for (const name of Object.keys(values)) {
      this.setAttribute(name, values[name]);
    }
  }
  setAttribute(qualifiedName: string, value: string): void {
    if (qualifiedName.indexOf('on') === 0) return;
    this._element.setAttribute(qualifiedName, value);
  }
  getAttribute(qualifiedName: string): string | null {
    return this._element.getAttribute(qualifiedName);
  }
  hasAttribute(qualifiedName: string): boolean {
    return this._element.hasAttribute(qualifiedName);
  }
  toggleAttribute(qualifiedName: string, force?: boolean | undefined) {
    if (qualifiedName.indexOf('on') === 0) return;
    this._element.toggleAttribute(qualifiedName, force);
  }
  removeAttribute(qualifiedName: string) {
    if (qualifiedName.indexOf('on') === 0) return;
    this._element.removeAttribute(qualifiedName);
  }
  get dataset(): DOMStringMap {
    return this._element.dataset;
  }
  get disabled(): boolean {
    return !!(this._element as any).disabled;
  }
  set disabled(value: boolean) {
    (this._element as any).disabled = !!value;
  }
  get inert(): boolean {
    return this._element.inert;
  }
  set inert(value: boolean) {
    this._element.inert = value;
  }
  get style(): CSSStyleDeclaration {
    return this._element.style;
  }
  blur(): void {
    return this._element.blur();
  }
  focus(): void {
    return this._element.focus();
  }
  click(): void {
    return this._element.click();
  }
  getClientRects(): DOMRectList {
    return this._element.getClientRects();
  }
  getBoundingClientRect(): DOMRect {
    return this._element.getBoundingClientRect();
  }
  scroll(...options: [option: ScrollToOptions] | [x: number, y: number]): void {
    // NOTICE: Better to use function overload
    // @ts-ignore
    return this._element.scroll(...options);
  }
  scrollBy(...options: [option: ScrollToOptions] | [x: number, y: number]): void {
    // NOTICE: Better to use function overload
    // @ts-ignore
    return this._element.scrollBy(...options);
  }
  scrollTo(...options: [option: ScrollToOptions] | [x: number, y: number]): void {
    // NOTICE: Better to use function overload
    // @ts-ignore
    return this._element.scrollTo(...options);
  }
  scrollIntoView(arg?: boolean | ScrollIntoViewOptions | undefined): void {
    return this._element.scrollIntoView(arg);
  }
  get scrollWidth(): number {
    return this._element.scrollWidth;
  }
  get scrollHeight(): number {
    return this._element.scrollHeight;
  }
  get scrollLeft(): number {
    return this._element.scrollLeft;
  }
  get scrollTop(): number {
    return this._element.scrollTop;
  }
  get data(): any {
    let data = {};
    this.children.forEach((child)=>{
      data = Object.assign(data, child.data);
    });
    return data;
  }
  set data(value: any) {
    if (value === undefined) return;
    this.children.forEach((child)=>{
      child.data = value;
    });
  }
}

class VDOMWithoutChild extends VDOM{
  prepend(...vdoms: VDOM[]): void {}
  append(...vdoms: VDOM[]): void {}
  querySelectorAll(selector: string): VDOM[] {
    return [];
  }
  get children(): VDOM[] {
    return [];
  }
  contains(other: VDOM): boolean {
    return false;
  }
  get data(): any {
    return {};
  }
  set data(value: any) {}
}

class VDOMWithData extends VDOMWithoutChild{
  private _dataKey: string = '';
  get value(): any {
    return;
  }
  set value(value: any) {}
  get dataKey(): string {
    return this._dataKey;
  }
  set dataKey(value: string) {
    if (typeof value !== 'string') return;
    this._dataKey = value;
  }
  get data(): any{
    if (this._dataKey === '') return{};
    return setData(this.value, this._dataKey);
  }
  set data(value: any){
    if (this._dataKey === '') return;
    this.value = getData(value, this._dataKey);
  }
}

export class VDiv extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLDivElement;
  constructor() {
    super();
    this._element = document.createElement('div');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VDiv {
    let clone = cloneVDOM<VDiv>(VDiv, this, deep);
    return clone;
  }
}

export class VSpan extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLSpanElement;
  constructor() {
    super();
    this._element = document.createElement('span');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VSpan {
    let clone = cloneVDOM<VSpan>(VSpan, this, deep);
    return clone;
  }
}

export class VB extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  constructor() {
    super();
    this._element = document.createElement('b');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VB {
    let clone = cloneVDOM<VB>(VB, this, deep);
    return clone;
  }
}

export class VI extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  constructor() {
    super();
    this._element = document.createElement('i');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VI {
    let clone = cloneVDOM<VI>(VI, this, deep);
    return clone;
  }
}

export class VU extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  constructor() {
    super();
    this._element = document.createElement('u');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VU {
    let clone = cloneVDOM<VU>(VU, this, deep);
    return clone;
  }
}

export class VDel extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLModElement;
  constructor() {
    super();
    this._element = document.createElement('del');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VDel {
    let clone = cloneVDOM<VDel>(VDel, this, deep);
    return clone;
  }
}

export class VBR extends VDOMWithoutChild{
  _element: HTMLBRElement;
  constructor() {
    super();
    this._element = document.createElement('br');
    (this._element as any).vdom = this;
  }
  clone(): VBR {
    return cloneVDOM<VBR>(VBR, this);
  }
}

export class VImg extends VDOMWithoutChild{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLImageElement;
  constructor() {
    super();
    this._element = document.createElement('img');
    (this._element as any).vdom = this;
  }
  get src(): string {
    return this._element.src;
  }
  set src(value: string) {
    this._element.src = value;
  }
  clone(): VImg {
    let clone = cloneVDOM<VImg>(VImg, this);
    clone.src = this.src;
    return clone;
  }
}

export class VButton extends VDOM{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLButtonElement;
  constructor() {
    super();
    this._element = document.createElement('button');
    (this._element as any).vdom = this;
  }
  get text(): string {
    return this._element.textContent || '';
  }
  set text(value: string) {
    this._element.textContent = value;
  }
  clone(deep?: boolean): VButton {
    let clone = cloneVDOM<VButton>(VButton, this, deep);
    return clone;
  }
}

export class VInput extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLInputElement;
  constructor() {
    super();
    this._element = document.createElement('input');
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.value;
  }
  set value(value: string) {
    this._element.value = value;
  }
  get placeholder(): string {
    return this._element.placeholder;
  }
  set placeholder(value: string) {
    this._element.placeholder = value;
  }
  clone(): VInput {
    let clone = cloneVDOM<VInput>(VInput, this);
    clone.value = this.value;
    clone.placeholder = this.placeholder;
    clone.dataKey = this.dataKey;
    return clone;
  }
}

export class VTextArea extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: HTMLTextAreaElement;
  constructor() {
    super();
    this._element = document.createElement('textarea');
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.value;
  }
  set value(value: string) {
    this._element.value = value;
  }
  get placeholder(): string {
    return this._element.placeholder;
  }
  set placeholder(value: string) {
    this._element.placeholder = value;
  }
  clone(): VTextArea {
    let clone = cloneVDOM<VTextArea>(VTextArea, this);
    clone.value = this.value;
    clone.placeholder = this.placeholder;
    clone.dataKey = this.dataKey;
    return clone;
  }
}

export class VColor extends VDOMWithData{
  _element: UIColor;
  constructor() {
    super();
    this._element = document.createElement('ui-color') as UIColor;
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.value;
  }
  set value(value: string) {
    this._element.value = value;
  }
  clone(): VColor {
    let clone = cloneVDOM<VColor>(VColor, this);
    clone.value = this.value;
    clone.dataKey = this.dataKey;
    return clone;
  }
}

export class VImagePicker extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: UIImagePicker;
  constructor() {
    super();
    this._element = document.createElement('ui-image-picker') as UIImagePicker;
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.value;
  }
  set value(value: string) {
    this._element.value = value;
  }
  get default(): string {
    return this._element.default;
  }
  set default(value: string) {
    this._element.default = value;
  }
  reset(): void {
    return this._element.reset();
  }
  clone(): VImagePicker {
    let clone = cloneVDOM<VImagePicker>(VImagePicker, this);
    clone.value = this.value;
    clone.default = this.default;
    clone.dataKey = this.dataKey;
    return clone;
  }
}

export class VLang extends VDOMWithoutChild{
  _element: UILang;
  constructor() {
    super();
    this._element = document.createElement('ui-lang') as UILang;
    (this._element as any).vdom = this;
  }
  get key(): string {
    return this._element.key;
  }
  set key(value: string) {
    this._element.key = value;
  }
  get namespace(): string {
    return this._element.namespace;
  }
  set namespace(value: string) {
    this._element.namespace = value;
  }
  get getTemplate(): UILang['getTemplate'] {
    return this._element.getTemplate;
  }
  get setTemplate(): UILang['setTemplate'] {
    return this._element.setTemplate;
  }
  get removeTemplate(): UILang['removeTemplate'] {
    return this._element.removeTemplate;
  }
  clone(): VLang {
    let clone = cloneVDOM<VLang>(VLang, this);
    clone.key = this.key;
    clone.namespace = this.namespace;
    clone.setTemplate(this.getTemplate());
    return clone;
  }
}

export class VIcon extends VDOMWithoutChild{
  _element: UIIcon;
  constructor() {
    super();
    this._element = document.createElement('ui-icon') as UIIcon;
    (this._element as any).vdom = this;
  }
  get key(): string {
    return this._element.key;
  }
  set key(value: string) {
    this._element.key = value;
  }
  get namespace(): string {
    return this._element.namespace;
  }
  set namespace(value: string) {
    this._element.namespace = value;
  }
  get image(): boolean {
    return this._element.image;
  }
  set image(value: boolean) {
    this._element.image = value;
  }
  clone(): VIcon {
    let clone = cloneVDOM<VIcon>(VIcon, this);
    clone.key = this.key;
    clone.namespace = this.namespace;
    clone.image = this.image;
    return clone;
  }
}

export class VList extends VDOMWithData{
  _element: UIList;
  constructor() {
    super();
    this._element = document.createElement('ui-list') as UIList;
    (this._element as any).vdom = this;
  }
  get value(): any[] {
    return this._element.value;
  }
  set value(value: any[]) {
    this._element.value = value;
  }
  get template(): VDOM {
    return this._element.template;
  }
  set template(value: VDOM) {
    this._element.template = value;
  }
  get inline(): boolean {
    return this._element.inline;
  }
  set inline(value: boolean) {
    this._element.inline = value;
  }
  clone(): VList {
    let clone = cloneVDOM<VList>(VList, this);
    clone.value = this.value;
    clone.template = this.template;
    clone.inline = this.inline;
    return clone;
  }
}

export class VLoader extends VDOMWithoutChild{
  _element: UILoader;
  constructor() {
    super();
    this._element = document.createElement('ui-loader') as UILoader;
    (this._element as any).vdom = this;
  }
  get value(): number {
    return this._element.value;
  }
  set value(value: number) {
    this._element.value = value;
  }
  clone(): VLoader {
    let clone = cloneVDOM<VLoader>(VLoader, this);
    clone.value = this.value;
    return clone;
  }
}

export class VProgress extends VDOMWithoutChild{
  _element: UIProgress;
  constructor() {
    super();
    this._element = document.createElement('ui-progress') as UIProgress;
    (this._element as any).vdom = this;
  }
  get value(): number {
    return this._element.value;
  }
  set value(value: number) {
    this._element.value = value;
  }
  clone(): VProgress {
    let clone = cloneVDOM<VProgress>(VProgress, this);
    clone.value = this.value;
    return clone;
  }
}

export class VNumber extends VDOMWithData{
  _element: UINumber;
  constructor() {
    super();
    this._element = document.createElement('ui-number') as UINumber;
    (this._element as any).vdom = this;
  }
  get value(): number {
    return this._element.value;
  }
  set value(value: number) {
    this._element.value = value;
  }
  get max(): number {
    return this._element.max;
  }
  set max(value: number) {
    this._element.max = value;
  }
  get min(): number {
    return this._element.min;
  }
  set min(value: number) {
    this._element.min = value;
  }
  get step(): number {
    return this._element.step;
  }
  set step(value: number) {
    this._element.step = value;
  }
  clone(): VNumber {
    let clone = cloneVDOM<VNumber>(VNumber, this);
    clone.value = this.value;
    clone.max = this.max;
    clone.min = this.min;
    clone.step = this.step;
    return clone;
  }
}

export class VRange extends VDOMWithData{
  _element: UIRange;
  constructor() {
    super();
    this._element = document.createElement('ui-range') as UIRange;
    (this._element as any).vdom = this;
  }
  get value(): number {
    return this._element.value;
  }
  set value(value: number) {
    this._element.value = value;
  }
  get max(): number {
    return this._element.max;
  }
  set max(value: number) {
    this._element.max = value;
  }
  get min(): number {
    return this._element.min;
  }
  set min(value: number) {
    this._element.min = value;
  }
  get step(): number {
    return this._element.step;
  }
  set step(value: number) {
    this._element.step = value;
  }
  clone(): VRange {
    let clone = cloneVDOM<VRange>(VRange, this);
    clone.value = this.value;
    clone.max = this.max;
    clone.min = this.min;
    clone.step = this.step;
    return clone;
  }
}

export class VSelect extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: UISelect;
  constructor() {
    super();
    this._element = document.createElement('ui-select') as UISelect;
    (this._element as any).vdom = this;
  }
  get value(): any {
    return this._element.value;
  }
  set value(value: any) {
    this._element.value = value;
  }
  get values(): {name: string, value: any}[] {
    return this._element.values;
  }
  set values(value: {name: string, value: any}[]) {
    this._element.values = value;
  }
  get placeholder(): string {
    return this._element.placeholder;
  }
  set placeholder(value: string) {
    this._element.placeholder = value;
  }
  get group(): string {
    return this._element.group;
  }
  set group(value: string) {
    this._element.group = value;
  }
  clone(): VSelect {
    let clone = cloneVDOM<VSelect>(VSelect, this);
    clone.value = this.value;
    clone.values = this.values;
    clone.placeholder = this.placeholder;
    clone.group = this.group;
    return clone;
  }
}

export class VSwitch extends VDOMWithData{
  _element: UISwitch;
  constructor() {
    super();
    this._element = document.createElement('ui-switch') as UISwitch;
    (this._element as any).vdom = this;
  }
  get value(): boolean {
    return this._element.value;
  }
  set value(value: boolean) {
    this._element.value = value;
  }
  clone(): VSwitch {
    let clone = cloneVDOM<VSwitch>(VSwitch, this);
    clone.value = this.value;
    return clone;
  }
}

export class VTags extends VDOMWithData{
  _element: UITags;
  constructor() {
    super();
    this._element = document.createElement('ui-tags') as UITags;
    (this._element as any).vdom = this;
  }
  get value(): string[] {
    return this._element.value;
  }
  set value(value: string[]) {
    this._element.value = value;
  }
  get autoComplete(): ((value: string)=>string[] | void) | undefined {
    return this._element.autoComplete;
  }
  set autoComplete(value: (value: string)=>string[] | void) {
    if (typeof value !== 'function') return;
    this._element.autoComplete = value;
  }
  clone(): VTags {
    let clone = cloneVDOM<VTags>(VTags, this);
    clone.value = this.value;
    return clone;
  }
}

export class VText extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: UIText;
  constructor() {
    super();
    this._element = document.createElement('ui-text') as UIText;
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.value;
  }
  set value(value: string) {
    this._element.value = value;
  }
  get placeholder(): string {
    return this._element.placeholder;
  }
  set placeholder(value: string) {
    this._element.placeholder = value;
  }
  get buttonsLeft(): VTextButtons {
    return this._element.buttonsLeft;
  }
  set buttonsLeft(value: VTextButtons) {
    this._element.buttonsLeft = value;
  }
  get buttonsRight(): VTextButtons {
    return this._element.buttonsRight;
  }
  set buttonsRight(value: VTextButtons) {
    this._element.buttonsRight = value;
  }
  get list(): {autoComplete: string}[] {
    return this._element.list as {autoComplete: string}[];
  }
  set list(value: {autoComplete: string}[]) {
    this._element.list = value;
  }
  clone(): VText {
    let clone = cloneVDOM<VText>(VText, this);
    clone.value = this.value;
    clone.placeholder = this.placeholder;
    clone.buttonsLeft = this.buttonsLeft;
    clone.buttonsRight = this.buttonsRight;
    return clone;
  }
}

export class VSettingItem extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: UISettingItem;
  constructor() {
    super();
    this._element = document.createElement('ui-setting-item') as UISettingItem;
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.value;
  }
  set value(value: string) {
    this._element.value = value;
  }
  get dataKey(): string {
    return '';
  }
  set dataKey(value: string) {
    return;
  }
  get icon(): VIcon {
    return this._element.icon;
  }
  get name(): VDiv {
    return this._element.name;
  }
  get description(): VDiv {
    return this._element.description;
  }
  get head(): VDiv {
    return this._element.head;
  }
  get body(): VDiv {
    return this._element.body;
  }
  clone(): VSettingItem {
    let clone = cloneVDOM<VSettingItem>(VSettingItem, this);
    copyVDOMToVDOM(clone.icon, this.icon);
    clone.icon.key = this.icon.key;
    clone.icon.namespace = this.icon.namespace;
    clone.icon.image = this.icon.image;
    copyVDOMToVDOM(clone.name, this.name, true);
    copyVDOMToVDOM(clone.description, this.description, true);
    copyVDOMToVDOM(clone.head, this.head, true);
    copyVDOMToVDOM(clone.body, this.body, true);
    return clone;
  }
  get data(): any{
    return this.value;
  }
  set data(value: any){
    this.value = value;
  }
}

export class VSettingItemChild extends VDOMWithData{
  private _locale: VDOMLocaleObject = new VDOMLocaleObject(this);
  get locale() {
    return this._locale;
  }
  _element: UISettingItemChild;
  constructor() {
    super();
    this._element = document.createElement('ui-setting-item-child') as UISettingItemChild;
    (this._element as any).vdom = this;
  }
  get value(): string {
    return this._element.head.data;
  }
  set value(value: string) {
    this._element.head.data = value;
  }
  get dataKey(): string {
    return '';
  }
  set dataKey(value: string) {
    return;
  }
  get icon(): VIcon {
    return this._element.icon;
  }
  get name(): VDiv {
    return this._element.name;
  }
  get description(): VDiv {
    return this._element.description;
  }
  get head(): VDiv {
    return this._element.head;
  }
  clone(): VSettingItemChild {
    let clone = cloneVDOM<VSettingItemChild>(VSettingItemChild, this);
    copyVDOMToVDOM(clone.icon, this.icon);
    clone.icon.key = this.icon.key;
    clone.icon.namespace = this.icon.namespace;
    clone.icon.image = this.icon.image;
    copyVDOMToVDOM(clone.name, this.name, true);
    copyVDOMToVDOM(clone.description, this.description, true);
    copyVDOMToVDOM(clone.head, this.head, true);
    return clone;
  }
  get data(): any{
    return this.value;
  }
  set data(value: any){
    this.value = value;
  }
}
