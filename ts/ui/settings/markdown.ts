/* 
UNFINISHED
*/
/* export type Options = {
  key: string,
  default: string,
  icon?: string,
  name?: string,
  nameLocalekey: string,
  description?: string,
  descriptionLocalekey: string,
  handler?: (input: string, key: string)=>void,
  reset?: boolean,
  layoutClass?: string[],
  disabled?: boolean,
};
export class MarkdownSettings{
  options: Options;
  constructor(options: Options) {
    this.options = options;
  }
  get value(): string{}
  get default(): string{
    return this.options.default;
  }
  set default(value: string) {
    if (typeof value === 'string') {
      this.options.default = value;
    }
  }
  get disabled(): boolean{
    return this.element.hasAttribute('disabled');
  }
  set disabled(value: boolean) {
    if (value) {
      this.element.setAttribute('disabled', '');
    }else{
      this.element.removeAttribute('disabled');
    }
  }
  reset(){}
} */
