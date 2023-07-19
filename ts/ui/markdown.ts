/* 
UNFINISHED
*/

import path from "path";
import { renderFile } from "pug";
import { Menu } from "./menu";
import { locale } from "../script/locale";
import { Flyout } from "./flyout";
import { ipcRenderer } from "electron";

const layoutPath = path.join(process.cwd(), 'layout/ui/markdown.pug');

type MarkdownEditorButtonElement = {
  copy: HTMLButtonElement,
  paste: HTMLButtonElement,
  heading: HTMLButtonElement,
  bold: HTMLButtonElement,
  italic: HTMLButtonElement,
  underline: HTMLButtonElement,
  deleteline: HTMLButtonElement,
  table: HTMLButtonElement,
  ol: HTMLButtonElement,
  ul: HTMLButtonElement,
  link: HTMLButtonElement,
  image: HTMLButtonElement,
  quote: HTMLButtonElement,
  hr: HTMLButtonElement,
  bangumi: HTMLButtonElement,
  pin: HTMLButtonElement,
  fit: HTMLButtonElement,
};

function addMarkdownElement(content: HTMLDivElement, div: HTMLElement, focus: HTMLElement) {
  let child = Array.from(content.children);
  let target = content.querySelector(':focus');
  while (target && !child.includes(target)) {
    target = (target?.parentNode as Element);
  }
  if (target) {
    target.after(div);
  } else {
    content.append(div);
  }
  try {
    if (focus.focus) {
      focus.focus();
    } else {
      window.getSelection()?.collapse(focus, 0);
    }
  } catch {}
  if (content.querySelector(':last-child') === div) {
    let p = document.createElement('div');
    p.classList.add('md-p');
    p.contentEditable = 'true';
    content.append(p);
  }
}

function copy(content: HTMLDivElement) {
}
function paste(content: HTMLDivElement) {
}
function createHeading(content: HTMLDivElement, level: string) {
  let div = document.createElement('div');
  div.classList.add('md-h');
  div.setAttribute('heading', level);
  div.innerHTML = '<div class="icon icon-e18a"></div><input>';
  addMarkdownElement(content, div, (div.querySelector('input') as HTMLInputElement));
}
function heading(content: HTMLDivElement, btn: HTMLButtonElement) {
  let menu = new Menu([
    {
      name: locale.markdown.h1,
      action: (ev)=>{
        ev.preventDefault();
        createHeading(content, '1');
        menu.remove();
      },
    },
    {
      name: locale.markdown.h2,
      action: (ev)=>{
        ev.preventDefault();
        createHeading(content, '2');
        menu.remove();
      },
    },
    {
      name: locale.markdown.h3,
      action: (ev)=>{
        ev.preventDefault();
        createHeading(content, '3');
        menu.remove();
      },
    },
    {
      name: locale.markdown.h4,
      action: (ev)=>{
        ev.preventDefault();
        createHeading(content, '4');
        menu.remove();
      },
    },
    {
      name: locale.markdown.h5,
      action: (ev)=>{
        ev.preventDefault();
        createHeading(content, '5');
        menu.remove();
      },
    },
    {
      name: locale.markdown.h6,
      action: (ev)=>{
        ev.preventDefault();
        createHeading(content, '6');
        menu.remove();
      },
    },
  ]);
  let { top, bottom, left } = btn.getBoundingClientRect();
  menu.show({ top, bottom, left, right: left});
}
const imageLayoutPath = path.join(process.cwd(), 'layout/ui/component/markdown-image.pug');
function chooseImage() {
  return ipcRenderer.invoke('dialog:open', {
    title: locale.markdown.img_choose,
    filters: [{
      name: locale.markdown.image,
      extensions: ['apng','avif','bmp','gif','jpg','jpeg','jfif','pjpeg','pjp','png','svg','tif','tiff','webp'],
    }],
    properties: ['openFile','dontAddToRecent'],
  });
}
async function getImageBase64(img: HTMLImageElement) {
  let ext = path.extname(img.src).slice(1);
  let canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  let ctx = (canvas.getContext('2d') as CanvasRenderingContext2D);
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  (img as any).embed = canvas.toDataURL('image/' + ext);
}
async function image(content: HTMLDivElement) {
  let {canceled, filePaths} = await chooseImage();
  if (canceled) return;
  let div = document.createElement('div');
  div.classList.add('md-image');
  div.innerHTML = renderFile(imageLayoutPath, { path: filePaths[0], name: path.basename(filePaths[0]) });
  addMarkdownElement(content, div, (div.querySelector('input') as HTMLInputElement));
  let img = (div.querySelector('img') as HTMLImageElement);
  img.addEventListener('load',()=>{
    if (typeof (img as any).path === 'string') return;
    (img as any).path = img.src;
    getImageBase64(img);
  });
  let btnS = (div.querySelector('.md-imgc-switch') as HTMLButtonElement);
  let btnC = (div.querySelector('.md-imgc-choose') as HTMLButtonElement);
  let btnD = (div.querySelector('.md-imgc-delete') as HTMLButtonElement);
  let icon = (btnS.querySelector('.icon') as HTMLDivElement);
  btnS.addEventListener('pointerdown', (ev)=>{
    ev.preventDefault();
    if (img.getAttribute('type') === 'link') {
      img.setAttribute('type', 'embed');
      img.src = (img as any).embed;
      icon.classList.add('icon-Link');
      icon.classList.remove('icon-Document');
      btnS.setAttribute('tooltip', '<ui-lang>markdown.img_link</ui-lang>');
    } else {
      img.setAttribute('type', 'link');
      img.src = (img as any).path;
      icon.classList.remove('icon-Link');
      icon.classList.add('icon-Document');
      btnS.setAttribute('tooltip', '<ui-lang>markdown.img_embed</ui-lang>');
    }
  });
  btnC.addEventListener('pointerdown', (ev)=>{
    ev.preventDefault();
    chooseImage().then(({filePaths})=>{
      if (typeof filePaths[0] !== 'string') return;
      img.setAttribute('type', 'link');
      icon.classList.remove('icon-Link');
      icon.classList.add('icon-Document');
      btnS.setAttribute('tooltip', '<ui-lang>markdown.img_embed</ui-lang>');
      (img as any).path = null;
      img.src = filePaths[0];
    });
  });
  btnD.addEventListener('pointerdown', (ev)=>{
    ev.preventDefault();
    div.remove();
  });
}
function quote(content: HTMLDivElement) {
}
function hr(content: HTMLDivElement) {
}
function bangumi(content: HTMLDivElement) {
}
function clear(content: HTMLDivElement, btn: HTMLButtonElement) {
  let flyout = new Flyout({
    content: locale.markdown.clear_info,
    buttons: [{
      name: locale.markdown.clear_confirm,
      action: (ev)=>{
        ev.preventDefault();
        content.innerHTML = `<div class="md-p" contenteditable="true"></div>`;
        flyout.close();
        window.getSelection()?.collapse(content.children[0], 0);
      },
    }],
  });
  flyout.show(btn.getBoundingClientRect());
}
function pin(content: HTMLDivElement, btn: HTMLButtonElement) {
  let target: HTMLDivElement | null = document.querySelector('.page-current');
  let icon = btn.querySelector('.icon');
  if (!target) return;
  if (target.style.overflowY !== 'hidden') {
    target.style.overflowY = 'hidden';
    icon?.classList.remove('icon-Pinned');
    icon?.classList.add('icon-Unpin');
  } else {
    target.style.overflowY = 'inherit'
    icon?.classList.add('icon-Pinned');
    icon?.classList.remove('icon-Unpin');
  }
}
function fit(content: HTMLDivElement) {
  let target = document.querySelector('.page-current');
  if (!target) return;
  target.scrollTo({
    top: target.scrollTop + (content.parentNode as Element).getBoundingClientRect().top,
    behavior: 'smooth',
  });
}
const buttonFunctions = {copy, paste, heading, image, quote, hr, bangumi, clear, pin, fit};

export class UIMarkdown extends HTMLElement{
  // private _shadow: ShadowRoot;
  private _button: MarkdownEditorButtonElement;
  private _content: HTMLDivElement;
  constructor() {
    super();
    // this._shadow = this.attachShadow({mode: 'closed'});
    this.innerHTML = renderFile(layoutPath);
    // @ts-ignore
    this._content = this.querySelector('.mdu-edit');
    this._button = {
      // @ts-ignore
      copy: this.querySelector('.mdc-copy'),
      // @ts-ignore
      paste: this.querySelector('.mdc-paste'),
      // @ts-ignore
      heading: this.querySelector('.mdc-heading'),
      // @ts-ignore
      image: this.querySelector('.mdc-image'),
      // @ts-ignore
      quote: this.querySelector('.mdc-quote'),
      // @ts-ignore
      hr: this.querySelector('.mdc-hr'),
      // @ts-ignore
      bangumi: this.querySelector('.mdc-bangumi'),
      // @ts-ignore
      clear: this.querySelector('.mdc-clear'),
      // @ts-ignore
      pin: this.querySelector('.mdc-pin'),
      // @ts-ignore
      fit: this.querySelector('.mdc-fit'),
    };
    // @ts-ignore
    for (const key in this._button) {
      if (!Object.prototype.hasOwnProperty.call(this._button, key)) continue;
      // @ts-ignore
      (this._button[key] as HTMLDivElement).addEventListener('pointerdown', (ev)=>{
        ev.preventDefault();
        if (ev.button !== 0) return;
        // @ts-ignore
        buttonFunctions[key](this._content, this._button[key]);
      });
    }
    this._content.addEventListener('keydown', (ev)=>{
      switch (ev.key) {
        case 'Enter':
          return this._keyEnter(ev);
      }
    });
  }
  get value(): string {
    return '';
  }
  set value(value) {
  }
  private _focus(el: Element | null) {
    if (!el) return;
    if (el.classList.contains('md-p')) {
      window.getSelection()?.collapse(el, 0);
    } else if (el.classList.contains('md-h')) {
      return el.querySelector('input')?.focus();
    }
  }
  private _keyEnter(ev: KeyboardEvent) {
    let path = ev.composedPath();
    let child = Array.from(this._content.children);
    let target: Element | null = null;
    for (const el of path) {
      if (!child.includes(el as Element)) continue;
      target = (el as Element);
      break;
    }
    if (!target) return;
    if (target.classList.contains('md-h')) {
      ev.preventDefault();
      return this._focus(target.nextElementSibling);
    }
  }
  private _heading(ev: KeyboardEvent){
    if (ev.target === this._content) {
      ev.preventDefault();
      let heading = document.createElement('div');
      heading.classList.add('md-heading');
      heading.setAttribute('heading', '1');
      window.getSelection()?.getRangeAt(0).insertNode(heading);
    }
  }
}
