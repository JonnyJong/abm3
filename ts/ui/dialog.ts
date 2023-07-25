import { layout } from "../helper/layout";

type DialogOptions = {
  title: string,
  content: HTMLElement,
  buttons: {
    text: string,
    action: (ev: MouseEvent)=>void,
    level?: 'normal' | 'confirm' | 'danger',
  }[]
};
export class Dialog{
  element: HTMLDivElement;
  constructor(options: DialogOptions) {
    this.element = document.createElement('div');
    this.element.classList.add('ui-dialog');
    this.element.innerHTML = layout('ui/dialog', options);
    (this.element.querySelector('.ui-dialog-content') as HTMLDivElement).append(options.content);
    this.element.querySelector('.ui-dialog-buttons')?.querySelectorAll('button').forEach((btn, index)=>{
      btn.addEventListener('click', options.buttons[index].action);
    });
    document.body.append(this.element);
  }
  get title(): string {
    return (this.element.querySelector('ui-dialog-title') as HTMLDivElement).innerHTML;
  }
  set title(value: string) {
    (this.element.querySelector('ui-dialog-title') as HTMLDivElement).innerHTML = value;
  }
  get content(): HTMLDivElement {
    return ((this.element.querySelector('.ui-dialog-content') as HTMLDivElement).children[0] as HTMLDivElement);
  }
  get buttons() {
    return (this.element.querySelector('.ui-dialog-buttons')?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
  }
  show() {
    setTimeout(()=>this.element.classList.add('ui-dialog-show'));
  }
  hide() {
    this.element.classList.remove('ui-dialog-show');
  }
  close() {
    this.element.classList.remove('ui-dialog-show');
    setTimeout(() => {
      this.element.remove();
    }, 100);
  }
}
