export class UIIcon extends HTMLElement{
  private _inited: boolean = false;
  private _key: string = '';
  private _namespace: string = '';
  private _image: boolean = false;
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    if (this.key === '') {
      this.key = this.textContent as string;
    }
    if (this.getAttribute('image') === 'true') {
      this._image = true;
    }
    this.update();
  }
  update() {
    if (!this._inited) return;
    // TODO: namespace, support extension's image
    if (this._image) {
      this.innerHTML = '';
      let img = document.createElement('img');
      img.src = this._key;
      img.style.display = 'none';
      img.onload = ()=>{
        img.style.display = '';
      };
      return;
    }
    this.innerHTML = `<div class="icon icon-${this._key}"></div>`;
  }
  get key() {
    return this._key;
  }
  set key(value: string) {
    if (typeof value !== 'string') return;
    let keys = value.split('@');
    this._key = keys[0];
    if (keys[1]) {
      this._namespace = keys[1];
    }
    this.update();
  }
  get namespace() {
    return this._namespace;
  }
  set namespace(value: string) {
    if (typeof value !== 'string') return;
    this._namespace = value;
    this.update();
  }
  get image() {
    return this._image;
  }
  set image(value: boolean) {
    this._image = !!value;
    this.update();
  }
}
