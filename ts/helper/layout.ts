import path from "path";
import { renderFile } from "pug";

export function layout(name: string, options?: any) {
  return renderFile(path.join(process.cwd(), 'layout', name + '.pug'), options);
}

export function element(layoutName: string, classList?: string[], options?: any) {
  let div = document.createElement('div');
  if (Array.isArray(classList)) {
    div.classList.add(...classList);
  }
  div.innerHTML = layout(layoutName, options);
  return div;
}
