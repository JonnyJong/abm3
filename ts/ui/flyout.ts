import { OutlineRect, setPosition } from "../helper/position";
import { layout } from "../helper/layout";
import { timer } from "../helper/timer";

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
    this.container.innerHTML = layout('ui/flyout', options);
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
  async close(){
    this.container.classList.add('flyout-hide');
    if (typeof this.onclose === 'function') {
      this.onclose();
    }
    await timer(100);
    this.container.remove();
    this.hider.remove();
  }
}
