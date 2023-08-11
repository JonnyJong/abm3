export function encode(str: string) {
  let div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
