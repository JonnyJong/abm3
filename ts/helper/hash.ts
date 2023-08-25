import { existsSync } from "fs";
import { readFile } from "fs/promises";
import crypto from "crypto"

export async function sha256(file: string | Buffer) {
  let hash = crypto.createHash('sha256');
  switch (typeof file) {
    case 'string':
      if (!existsSync(file)) throw new Error('File does not exist');
      let buffer = await readFile(file);
      hash.update(buffer);
      return hash.digest('hex');
    case 'object':
      if (!Buffer.isBuffer(file)) break;
      hash.update(file);
      return hash.digest('hex');
  }
  throw new TypeError('Require file path string or buffer');
}
