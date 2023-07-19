const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const nine = '9'.charCodeAt(0);
export function nextId(id: string): string {
  if (typeof id !== 'string') {
    throw new TypeError('Require a string type id.');
  }
  let chars = id.split('');
  let i0 = chars[0].charCodeAt(0);
  if (i0 < z) {
    chars[0] = String.fromCharCode(i0 + 1);
    id = chars.join('');
    if (id === 'constructor') {
      return nextId(chars.join(''));
    }
    return id;
  }
  chars[0] = 'a';
  for (let i = 1; i < chars.length + 1; i++) {
    if (typeof chars[i] !== 'string') {
      chars[i] = '0';
      break;
    }
    let j = chars[i].charCodeAt(0);
    if (j < nine) {
      chars[i] = String.fromCharCode(j + 1);
      break;
    } else if (j === nine) {
      chars[i] = String.fromCharCode(a);
      break;
    } else if (j < z) {
      chars[i] = String.fromCharCode(j + 1);
      break;
    }
    chars[i] = '0';
  }
  return chars.join('');
}
