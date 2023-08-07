export class UILoader extends HTMLElement{
  private _inited: boolean = false;
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = '<svg viewBox="0 0 60 60" height="60" width="60"><g fill="none"><path d="M3 30a27 27 0 1 0 54 0a27 27 0 1 0 -54 0z"></path></g></svg>';
  }
}
