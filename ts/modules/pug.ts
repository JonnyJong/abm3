import { ProtocolRequest, ProtocolResponse } from "electron";
import { compileFile } from "pug";

export function render(layout: string, options: any = {}) {
  return compileFile(layout)(options);
}

export function portocolHandler(file: string, request: ProtocolRequest, callback: (response: (Buffer) | (ProtocolResponse)) => void) {
  let compiled = compileFile(file)();
  return callback({data: Buffer.from(compiled), mimeType: 'text/html'});
}

export default {
  render,
  portocolHandler,
};
