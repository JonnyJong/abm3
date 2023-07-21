import { getLangByKey } from "../script/locale";

export class UILang extends HTMLElement{
  private _inited: boolean = false;
  key: string | null = null;
  constructor(){
    super();
  }
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.key = this.textContent;
    this.textContent = getLangByKey(this.key);
  }
}
