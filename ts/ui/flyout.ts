import path from "path";
import { OutlineRect, setPosition } from "../helper/position";
import { renderFile } from "pug";

const layoutPath = path.join(process.cwd(), 'layout/ui/flyout.pug');

type FlyoutOptions = {
  content: string,
  buttons: {
    icon?: string,
    name?: string,
    action: (event: PointerEvent)=>void,
  }[],
};
export class Flyout{
  container: HTMLDivElement;
  hider: HTMLDivElement;
  onclose: Function | undefined;
  constructor(options: FlyoutOptions){
    this.hider = document.createElement('div');
    this.hider.classList.add('ui-hider');
    this.container = document.createElement('div');
    this.container.classList.add('flyout');
    this.container.innerHTML = renderFile(layoutPath, options);
    let buttons = this.container.querySelectorAll('button');
    for (let i = 0; i < options.buttons.length; i++) {
      buttons[i].addEventListener('pointerdown', options.buttons[i].action);
    }
    this.hider.addEventListener('pointerdown', (ev)=>{
      ev.preventDefault();
      this.close();
    });
    document.body.append(this.hider, this.container);
  }
  show(rect: OutlineRect){
    let { v } = setPosition(this.container, this.container.getBoundingClientRect(), rect, 'v-center');
    if ( v === 'bottom' ) {
      this.container.classList.add('flyout-show-bottom');
    } else {
      this.container.classList.add('flyout-show-top');
    }
    this.hider.classList.add('ui-hider-show');
  }
  close(){
    this.container.classList.add('flyout-hide');
    setTimeout(() => {
      this.container.remove();
      this.hider.remove();
    }, 100);
    if (typeof this.onclose === 'function') {
      this.onclose();
    }
  }
}
