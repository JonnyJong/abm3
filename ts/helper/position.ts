export type OutlineRect = {
  top: number,
  right: number,
  bottom: number,
  left: number,
};
export type Rect = {
  width: number,
  height: number,
};
export type Side = {
  v: 'top' | 'bottom',
  h: 'left' | 'right'
}
export type Align = 'corner' | 'h-corner' | 'v-corner' | 'h-center' | 'v-center';
export function setPosition(target: HTMLElement, rect: Rect, around: OutlineRect, align: Align = 'v-corner'): Side {
  let side: Side = {
    v: 'bottom',
    h: 'right',
  };
  switch (align) {
    case 'corner':
      if (around.right + rect.width <= window.innerWidth) {
        target.style.left = around.right + 'px';
      } else {
        side.h = 'left';
        target.style.right = Math.max(rect.width, window.innerWidth - around.left) + 'px';
      }
      if (around.bottom + rect.height <= window.innerHeight) {
        target.style.top = around.bottom + 'px';
      } else {
        side.v = 'top';
        target.style.bottom = Math.min(rect.height, window.innerHeight - around.top) + 'px';
      }
      break;
    case 'h-corner':
      if (around.right + rect.width <= window.innerWidth) {
        target.style.left = around.right + 'px';
      } else {
        side.h = 'left';
        target.style.right = Math.max(rect.width, window.innerWidth - around.left) + 'px';
      }
      if (around.top + rect.height <= window.innerHeight) {
        target.style.top = around.top + 'px';
      } else {
        side.v = 'top';
        target.style.bottom = Math.min(rect.height, window.innerHeight - around.bottom) + 'px';
      }
      break;
    case 'v-corner':
      if (around.left + rect.width <= window.innerWidth) {
        target.style.left = around.left + 'px';
      } else {
        side.h = 'left';
        target.style.right = Math.min(rect.width, window.innerWidth - around.right) + 'px';
      }
      if (around.bottom + rect.height <= window.innerHeight) {
        target.style.top = around.bottom + 'px';
      } else {
        side.v = 'top';
        target.style.bottom = Math.min(rect.height, window.innerHeight - around.top) + 'px';
      }
      break;
    case 'h-center':
      if (around.right + rect.width <= window.innerWidth) {
        target.style.left = around.right + 'px';
      } else {
        side.h = 'left';
        target.style.right = Math.max(rect.width, window.innerWidth - around.left) + 'px';
      }
      target.style.top = Math.max(0, Math.min(window.innerHeight - rect.height, (around.bottom + around.top - rect.height) / 2)) + 'px';
      break;
    case 'v-center':
      target.style.left = Math.max(0, Math.min(window.innerWidth - rect.width, (around.right + around.left - rect.width) / 2)) + 'px';
      if (around.bottom + rect.height <= window.innerHeight) {
        target.style.top = around.bottom + 'px';
      } else {
        side.v = 'top';
        target.style.bottom = Math.min(rect.height, window.innerHeight - around.top) + 'px';
      }
      break;
  }
  return side;
}
