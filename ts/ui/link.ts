import { ipcRenderer } from "electron";
import { filterHTML } from "../helper/html";

export class UILink extends HTMLElement{
  private _inited: boolean = false;
  private _link: string = '';
  private _text: string = '';
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    let text = this.textContent;
    if (this._text === '' && text) {
      this._text = text;
    }
    this.text = this._text;
    let link = this.getAttribute('link');
    if (this._link === '' && link) {
      this._link = link;
    }
    this.addEventListener('click', ()=>{
      if (this._link === '') return;
      ipcRenderer.send('url', this._link);
    });
  }
  get text(): string {
    return this._text;
  }
  set text(value: string) {
    if (typeof value !== 'string') return;
    this._text = value;
    if (!this._inited) return;
    this.innerHTML = `<button class="btn-link">${filterHTML(this._text)}</button>`;
  }
  get link(): string {
    return this._link;
  }
  set link(value: string) {
    if (typeof value !== 'string') return;
    this._link = value;
  }
}
