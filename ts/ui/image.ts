import { ipcRenderer } from "electron";
import { getImage } from "../helper/get-file";
import { Dialog } from "./dialog";
import { UIText } from "./text";
import path from "path";

export class UIImagePicker extends HTMLElement{
  private _inited: boolean = false;
  private _img: HTMLImageElement;
  private _info: HTMLDivElement;
  private _clean: HTMLButtonElement;
  private _default: HTMLButtonElement;
  private _web: HTMLButtonElement;
  private _local: HTMLButtonElement;
  private _value: string = '';
  private _defaultValue: string = '';
  private _error: boolean = true;
  constructor() {
    super();
    this._img = document.createElement('img');
    this._img.classList.add('ui-image-img');
    this._info = document.createElement('div');
    this._info.classList.add('ui-image-info');
    this._info.innerHTML = '<i class="icon icon-Info"></i><ui-lang>image.empty</ui-lang>';
    this._clean = document.createElement('button');
    this._clean.classList.add('ui-image-clean', 'btn-clear');
    this._clean.innerHTML = '<div class="icon icon-Clear"></div>';
    this._default = document.createElement('button');
    this._default.classList.add('ui-image-default', 'btn-clear');
    this._default.innerHTML = '<div class="icon icon-Undo"></div>';
    this._web = document.createElement('button');
    this._web.classList.add('ui-image-web', 'btn-clear');
    this._web.innerHTML = '<div class="icon icon-WebSearch"></div>';
    this._local = document.createElement('button');
    this._local.classList.add('ui-image-local', 'btn-clear');
    this._local.innerHTML = '<div class="icon icon-OpenFile"></div>';
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.append(this._img, this._info, this._clean, this._default, this._web, this._local);
    this._clean.addEventListener('click',()=>{
      this.value = '';
      setTimeout(() => {
        this._info.innerHTML = '<i class="icon icon-Info"></i><ui-lang>image.empty</ui-lang>';
      }, 10);
    });
    this._default.addEventListener('click',()=>{
      this.reset();
    });
    this._web.addEventListener('click', ()=>{
      let input = (document.createElement('ui-text') as UIText);
      input.style.width = '500px';
      input.style.display = 'block';
      let dialog = new Dialog({
        title: '<ui-lang>image.input_url</ui-lang>',
        content: input,
        buttons: [{
          text: '<ui-lang>dialog.confirm</ui-lang>',
          level: 'confirm',
          action: ()=>{
            this.value = input.value;
            dialog.close();
          },
        },{
          text: '<ui-lang>dialog.cancel</ui-lang>',
          action: ()=>{
            dialog.close();
          },
        }],
      });
      input.buttonsRight = [{
        icon: 'Clear',
        clear: true,
      }];
      dialog.show();
    });
    this._local.addEventListener('click',async ()=>{
      let { filePaths } = await getImage();
      if (filePaths.length === 0) return;
      this.value = filePaths[0];
    });
    this._img.addEventListener('error',()=>{
      this._img.classList.add('ui-image-img-hide');
      this._error = true;
      this._info.innerHTML = '<i class="icon icon-Warning"></i><ui-lang>image.error</ui-lang>';
    });
    this._img.addEventListener('loadstart', ()=>{
      this._img.classList.add('ui-image-img-hide');
      this._error = true;
      this._info.innerHTML = '<i class="icon icon-Info"></i><ui-lang>image.loading</ui-lang>';
    });
    this._img.addEventListener('load',()=>{
      this._img.classList.remove('ui-image-img-hide');
      this._error = false;
      this._info.innerHTML = '';
    });
    if (this.hasAttribute('value')) {
      this.value = (this.getAttribute('value') as string);
    }
    if (this.hasAttribute('default')) {
      this.default = (this.getAttribute('default') as string);
    }
    this.addEventListener('dragstart',(ev)=>{
      if (this._error) return;
      ev.preventDefault();
      ipcRenderer.send('drag', this._value);
    });
  }
  get value(): string {
    return this._value;
  }
  set value(value: string) {
    this._value = value;
    this._img.src = this._value;
  }
  get default(): string {
    return this._defaultValue;
  }
  set default(value: string) {
    this._defaultValue = value;
  }
  async reset() {
    this._value = this._defaultValue;
    if (this._defaultValue !== '') return;
    this._img.src = path.join(await ipcRenderer.invoke('getAppData'), 'images', this._defaultValue);
    setTimeout(() => {
      this._info.innerHTML = '<i class="icon icon-Info"></i><ui-lang>image.empty</ui-lang>';
    }, 10);
  }
  get error(): boolean {
    return this._error;
  }
  dropHandler(data: DataTransfer){
    if (data.files[0].type.split('/')[0] !== 'image') return;
    this.value = data.files[0].path;
  }
}
