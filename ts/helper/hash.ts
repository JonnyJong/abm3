import { existsSync } from "fs";
import { readFile } from "fs/promises";
import crypto from "crypto"

export async function sha256(filePath: string) {
  if (typeof filePath !== 'string') throw new TypeError('Require a file path string');
  if (!existsSync(filePath)) throw new Error('File does not exist');
  let buffer = await readFile(filePath);
  let hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
