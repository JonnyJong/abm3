export function render(content: string) {
  content = content.replace(/(^|(?<=\n))#{1,6} (.*)/g, (src)=>{
    let level = (src.match(/#{1,6}/) as string[])[0].length;
    let textOrigin = src.slice(level);
    if (textOrigin.match(new RegExp('#{' + level + '}$'))) {
      textOrigin = textOrigin.slice(0, textOrigin.length - level);
    }
    textOrigin = textOrigin.trim();
    return `<h${level}>${textOrigin}</h${level}>`;
  });
  content = content.replace(/\n/g, '<br>');
  content = content.replace(/\{% b( [0-9a-z]+)+ %\}/g, (src)=>{
    let ids = src.slice(5, src.length - 3).split(' ');
    let text = '<div class="bangumi-list">';
    for (const id of ids) {
      text += `<ui-bangumi id="${id}"></ui-bangumi>`
    }
    text += '</div>';
    return text;
  });
  return content;
}
