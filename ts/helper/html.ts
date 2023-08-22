export function encode(str: string) {
  let div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function filterHTML(str: string) {
  return str.replace(/<.*?>/g, (a)=>{
    if (['<i>','</i>','<b>','</b>','<u>','</u>','<del>','</del>','<ui-lang>','</ui-lang>'].includes(a)) return a;
    return '';
  });
}
