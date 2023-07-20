import { getLangByKey } from "../script/locale";

export class UILang extends HTMLElement{
  key: string | null = null;
  constructor(){
    super();
  }
  connectedCallback(){
    this.key = this.textContent;
    this.textContent = getLangByKey(this.key);
  }
}
