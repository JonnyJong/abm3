import path from "path";
import { renderFile } from "pug";

export function layout(name: string, options?: any) {
  return renderFile(path.join(process.cwd(), 'layout', name + '.pug'), options);
}
