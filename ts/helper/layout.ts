import path from "path";
import { compileFile, compileTemplate } from "pug";

let cache: Map<string, compileTemplate> = new Map();

export function layout(name: string, options?: any) {
  let layoutPath = path.join(process.cwd(), 'layout', name + '.pug');
  let template = cache.get(layoutPath);
  if (!template) {
    template = compileFile(layoutPath);
    cache.set(layoutPath, template);
  }
  return template(options);
}

export function element(layoutName: string, classList?: string[], options?: any) {
  let div = document.createElement('div');
  if (Array.isArray(classList)) {
    div.classList.add(...classList);
  }
  div.innerHTML = layout(layoutName, options);
  return div;
}
