import { getLangByKey } from "../script/locale";

export class UILang extends HTMLElement{
  key: string | null;
  constructor(){
    super();
    this.key = this.textContent;
    this.textContent = getLangByKey(this.key);
  }
}
