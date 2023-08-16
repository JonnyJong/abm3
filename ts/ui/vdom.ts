import { UIColor } from "./color";
import { UIImagePicker } from "./image";
import { LangTemplateMap, UILang } from "./lang";
import { UIList } from "./list";
import { UILoader } from "./loader";
import { UINumber } from "./number";
import { UIRange } from "./range";
import { UISelect } from "./select";
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

type VDOMEvents = {
  "fullscreenchange"?: (this: VDOM, ev: Event)=>any,
  "fullscreenerror"?: (this: VDOM, ev: Event)=>any,
  "abort"?: (this: VDOM, ev: UIEvent)=>any,
  "animationcancel"?: (this: VDOM, ev: AnimationEvent)=>any,
  "animationend"?: (this: VDOM, ev: AnimationEvent)=>any,
  "animationiteration"?: (this: VDOM, ev: AnimationEvent)=>any,
  "animationstart"?: (this: VDOM, ev: AnimationEvent)=>any,
  "auxclick"?: (this: VDOM, ev: MouseEvent)=>any,
  "beforeinput"?: (this: VDOM, ev: InputEvent)=>any,
  "blur"?: (this: VDOM, ev: FocusEvent)=>any,
  "cancel"?: (this: VDOM, ev: Event)=>any,
  "canplay"?: (this: VDOM, ev: Event)=>any,
  "canplaythrough"?: (this: VDOM, ev: Event)=>any,
  "change"?: (this: VDOM, ev: Event)=>any,
  "click"?: (this: VDOM, ev: MouseEvent)=>any,
  "close"?: (this: VDOM, ev: Event)=>any,
  "compositionend"?: (this: VDOM, ev: CompositionEvent)=>any,
  "compositionstart"?: (this: VDOM, ev: CompositionEvent)=>any,
  "compositionupdate"?: (this: VDOM, ev: CompositionEvent)=>any,
  "contextmenu"?: (this: VDOM, ev: MouseEvent)=>any,
  "copy"?: (this: VDOM, ev: ClipboardEvent)=>any,
  "cuechange"?: (this: VDOM, ev: Event)=>any,
  "cut"?: (this: VDOM, ev: ClipboardEvent)=>any,
  "dblclick"?: (this: VDOM, ev: MouseEvent)=>any,
  "drag"?: (this: VDOM, ev: DragEvent)=>any,
  "dragend"?: (this: VDOM, ev: DragEvent)=>any,
  "dragenter"?: (this: VDOM, ev: DragEvent)=>any,
  "dragleave"?: (this: VDOM, ev: DragEvent)=>any,
  "dragover"?: (this: VDOM, ev: DragEvent)=>any,
  "dragstart"?: (this: VDOM, ev: DragEvent)=>any,
  "drop"?: (this: VDOM, ev: DragEvent)=>any,
  "durationchange"?: (this: VDOM, ev: Event)=>any,
  "emptied"?: (this: VDOM, ev: Event)=>any,
  "ended"?: (this: VDOM, ev: Event)=>any,
  "error"?: (this: VDOM, ev: ErrorEvent)=>any,
  "focus"?: (this: VDOM, ev: FocusEvent)=>any,
  "focusin"?: (this: VDOM, ev: FocusEvent)=>any,
  "focusout"?: (this: VDOM, ev: FocusEvent)=>any,
  "formdata"?: (this: VDOM, ev: FormDataEvent)=>any,
  "gotpointercapture"?: (this: VDOM, ev: PointerEvent)=>any,
  "input"?: (this: VDOM, ev: Event)=>any,
  "invalid"?: (this: VDOM, ev: Event)=>any,
  "keydown"?: (this: VDOM, ev: KeyboardEvent)=>any,
  "keypress"?: (this: VDOM, ev: KeyboardEvent)=>any,
  "keyup"?: (this: VDOM, ev: KeyboardEvent)=>any,
  "load"?: (this: VDOM, ev: Event)=>any,
  "loadeddata"?: (this: VDOM, ev: Event)=>any,
  "loadedmetadata"?: (this: VDOM, ev: Event)=>any,
  "loadstart"?: (this: VDOM, ev: Event)=>any,
  "lostpointercapture"?: (this: VDOM, ev: PointerEvent)=>any,
  "mousedown"?: (this: VDOM, ev: MouseEvent)=>any,
  "mouseenter"?: (this: VDOM, ev: MouseEvent)=>any,
  "mouseleave"?: (this: VDOM, ev: MouseEvent)=>any,
  "mousemove"?: (this: VDOM, ev: MouseEvent)=>any,
  "mouseout"?: (this: VDOM, ev: MouseEvent)=>any,
  "mouseover"?: (this: VDOM, ev: MouseEvent)=>any,
  "mouseup"?: (this: VDOM, ev: MouseEvent)=>any,
  "paste"?: (this: VDOM, ev: ClipboardEvent)=>any,
  "pause"?: (this: VDOM, ev: Event)=>any,
  "play"?: (this: VDOM, ev: Event)=>any,
  "playing"?: (this: VDOM, ev: Event)=>any,
  "pointercancel"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointerdown"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointerenter"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointerleave"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointermove"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointerout"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointerover"?: (this: VDOM, ev: PointerEvent)=>any,
  "pointerup"?: (this: VDOM, ev: PointerEvent)=>any,
  "progress"?: (this: VDOM, ev: ProgressEvent)=>any,
  "ratechange"?: (this: VDOM, ev: Event)=>any,
  "reset"?: (this: VDOM, ev: Event)=>any,
  "resize"?: (this: VDOM, ev: UIEvent)=>any,
  "scroll"?: (this: VDOM, ev: Event)=>any,
  "securitypolicyviolation"?: (this: VDOM, ev: SecurityPolicyViolationEvent)=>any,
  "seeked"?: (this: VDOM, ev: Event)=>any,
  "seeking"?: (this: VDOM, ev: Event)=>any,
  "select"?: (this: VDOM, ev: Event)=>any,
  "selectionchange"?: (this: VDOM, ev: Event)=>any,
  "selectstart"?: (this: VDOM, ev: Event)=>any,
  "slotchange"?: (this: VDOM, ev: Event)=>any,
  "stalled"?: (this: VDOM, ev: Event)=>any,
  "submit"?: (this: VDOM, ev: SubmitEvent)=>any,
  "suspend"?: (this: VDOM, ev: Event)=>any,
  "timeupdate"?: (this: VDOM, ev: Event)=>any,
  "toggle"?: (this: VDOM, ev: Event)=>any,
  "touchcancel"?: (this: VDOM, ev: TouchEvent)=>any,
  "touchend"?: (this: VDOM, ev: TouchEvent)=>any,
  "touchmove"?: (this: VDOM, ev: TouchEvent)=>any,
  "touchstart"?: (this: VDOM, ev: TouchEvent)=>any,
  "transitioncancel"?: (this: VDOM, ev: TransitionEvent)=>any,
  "transitionend"?: (this: VDOM, ev: TransitionEvent)=>any,
  "transitionrun"?: (this: VDOM, ev: TransitionEvent)=>any,
  "transitionstart"?: (this: VDOM, ev: TransitionEvent)=>any,
  "volumechange"?: (this: VDOM, ev: Event)=>any,
  "waiting"?: (this: VDOM, ev: Event)=>any,
  "webkitanimationend"?: (this: VDOM, ev: Event)=>any,
  "webkitanimationiteration"?: (this: VDOM, ev: Event)=>any,
  "webkitanimationstart"?: (this: VDOM, ev: Event)=>any,
  "webkittransitionend"?: (this: VDOM, ev: Event)=>any,
  "wheel"?: (this: VDOM, ev: WheelEvent)=>any,
  [type: string]: ((this: VDOM, ev: Event | any)=>any) | undefined,
};

type VDOMAttribute = { [qualifiedName: string]: string };

type VDOMStyle = string | { [name: string]: string };

type VDOMLang = {
  key: string,
  namespace?: string,
  setter: (this: VDOM, str: string)=>any,
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
  lang?: VDOMLang,
};

type VSpanTemplate = {
  type: 'span',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
};

type VBTemplate = {
  type: 'b',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
};

type VITemplate = {
  type: 'i',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
};

type VUTemplate = {
  type: 'u',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
};

type VDelTemplate = {
  type: 'del',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
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
  lang?: VDOMLang,
};

type VButtonTemplate = {
  type: 'button',
  events?: VDOMEvents,
  text?: string,
  children?: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
};

type VInputTemplate = {
  type: 'input',
  events?: VDOMEvents,
  value?: string,
  placeholder?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
  lang?: VDOMLang,
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
  lang?: VDOMLang,
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
  lang?: VDOMLang,
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
  setter?: (this: VDOM, str: string) => any,
  templateMap?: LangTemplateMap,
};

type VIconTemplate = {
  type: 'icon',
  events?: VDOMEvents,
  key: string,
  namespace?: string,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
};

type VListTemplate = {
  type: 'list',
  events?: VDOMEvents,
  value?: string,
  template: VDOMTemplate[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
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
  lang?: VDOMLang,
  dataKey?: string,
};

type VSwitchTemplate = {
  type: 'switch',
  events?: VDOMEvents,
  value?: boolean,
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
};

type VTagsTemplate = {
  type: 'tags',
  events?: VDOMEvents,
  value?: string[],
  classList?: string[],
  attribute?: VDOMAttribute,
  style?: VDOMStyle,
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
  lang?: VDOMLang,
  dataKey?: string,
};

type VDOMTemplate = VDivTemplate | VSpanTemplate | VITemplate | VBTemplate | VUTemplate | VDelTemplate | VBRTemplate | VImageTemplate | VButtonTemplate | VInputTemplate | VTextAreaTemplate | VColorTemplate | VImagePickerTemplate | VLangTemplate | VIconTemplate | VListTemplate | VLoaderTemplate | VProgressTemplate | VNumberTemplate | VRangeTemplate | VSelectTemplate | VSwitchTemplate | VTagsTemplate | VTextTemplate;

type VDOMOriginHTMLElements = HTMLElement | HTMLDivElement | HTMLSpanElement | HTMLBRElement | HTMLImageElement | HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | UIColor | UIImagePicker | UILang | UIList | UILoader | UINumber | UIRange | UISelect | UISwitch | UITags | UIText;
type VDOMOriginHTMLElementTags = 'div' | 'span' | 'b' | 'i' | 'u' | 'del' | 'br' | 'button' | 'input' | 'textarea' | 'ui-color' | 'ui-image-picker' | 'ui-lang' | 'ui-list' | 'ui-loader' | 'ui-number' | 'ui-range' | 'ui-select' | 'ui-switch' | 'ui-tags' | 'ui-text';
export class VDOM{
  static create(template: VDOMTemplate): VDOM {}
  private _element!: VDOMOriginHTMLElements;
  constructor() {
    throw new Error('Direct construction of VDOM is not allowed.');
  }
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
  get remove(): HTMLElement['remove'] {
    return this._element.remove;
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
  clone(): VDOM {
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
  get addEventListener(): HTMLElement['addEventListener'] {
    return this._element.addEventListener;
  }
  get removeEventListener(): HTMLElement['removeEventListener'] {
    return this._element.removeEventListener;
  }
  get classList(): DOMTokenList {
    return this._element.classList;
  }
  get setAttribute(): HTMLElement['setAttribute'] {
    return this._element.setAttribute;
  }
  get getAttribute(): HTMLElement['getAttribute'] {
    return this._element.getAttribute;
  }
  get hasAttribute(): HTMLElement['hasAttribute'] {
    return this._element.hasAttribute;
  }
  get toggleAttribute(): HTMLElement['toggleAttribute'] {
    return this._element.toggleAttribute;
  }
  get removeAttribute(): HTMLElement['removeAttribute'] {
    return this._element.removeAttribute;
  }
  get dataset(): HTMLOrSVGElement['dataset'] {
    return this._element.dataset;
  }
  get style(): CSSStyleDeclaration {
    return this._element.style;
  }
  get blur(): HTMLElement['blur'] {
    return this._element.blur;
  }
  get focus(): HTMLElement['focus'] {
    return this._element.focus;
  }
  get click(): HTMLElement['click'] {
    return this._element.click;
  }
  get getClientRects(): HTMLElement['getClientRects'] {
    return this._element.getClientRects;
  }
  get getBoundingClientRect(): HTMLElement['getBoundingClientRect'] {
    return this._element.getBoundingClientRect;
  }
  get scroll(): Element['scroll'] {
    return this._element.scroll;
  }
  get scrollBy(): Element['scrollBy'] {
    return this._element.scrollBy;
  }
  get scrollIntoView(): Element['scrollIntoView'] {
    return this._element.scrollIntoView;
  }
  get scrollTo(): Element['scrollTo'] {
    return this._element.scrollTo;
  }
  get scrollWidth(): Element['scrollWidth'] {
    return this._element.scrollWidth;
  }
  get scrollHeight(): Element['scrollHeight'] {
    return this._element.scrollHeight;
  }
  get scrollLeft(): Element['scrollLeft'] {
    return this._element.scrollLeft;
  }
  get scrollTop(): Element['scrollTop'] {
    return this._element.scrollTop;
  }
}
