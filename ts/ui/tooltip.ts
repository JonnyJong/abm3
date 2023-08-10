import { timer } from "../helper/timer";

async function removeTooltip(tooltip: HTMLElement | null) {
  if (!tooltip) return;
  tooltip.classList.remove('tooltip-show');
  await timer(100);
  tooltip.remove();
}
function setPosition(tooltip: HTMLElement | null, ev: PointerEvent) {
  if (!tooltip) return;
  let rect = tooltip.getBoundingClientRect();
  if (ev.y - rect.height - 16 > 50) {
    tooltip.style.top = ev.y - rect.height - 16 + 'px';
  } else {
    tooltip.style.top = ev.y + 24 + 'px';
  }
  tooltip.style.left = Math.max(16, Math.min(window.innerWidth - 16, ev.x - rect.width / 2)) + 'px';
  tooltip.classList.add('tooltip-show');
}
export function initTooltip() {
  let showing: HTMLElement | null = null;
  let tooltip: HTMLElement | null = null;
  let timer: NodeJS.Timeout | null = null;
  let ev: PointerEvent;
  window.addEventListener('pointermove', (event)=>{
    ev = event;
    let path = ev.composedPath();
    let target: HTMLElement | null = null;
    for (const el of path) {
      if (!(el instanceof HTMLElement)) break;
      if (!el.hasAttribute('tooltip')) continue;
      target = el;
      break;
    }
    if (target === showing) {
      setPosition(tooltip, ev);
      return;
    }
    removeTooltip(tooltip);
    showing = target;
    if (timer) clearTimeout(timer);
    if (!target) return;
    let html = target.getAttribute('tooltip');
    timer = setTimeout(() => {
      if (timer) clearTimeout(timer);
      timer = null;
      tooltip = document.createElement('div');
      tooltip.classList.add('tooltip');
      if (html) {
        tooltip.innerHTML = html;
      }
      document.body.append(tooltip);
      setPosition(tooltip, ev);
    }, 500);
  });
  window.addEventListener('pointerdown', ()=>{
    removeTooltip(tooltip);
    if (timer) clearTimeout(timer);
    timer = null;
  });
}
