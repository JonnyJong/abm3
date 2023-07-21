import { UILang } from "./lang";
import { UISwitch } from "./switch";
import { UIText } from "./text";
// import { UIMarkdown } from "./markdown";
import { initTooltip } from "./tooltip";

export function initUI() {
  customElements.define('ui-lang', UILang);
  customElements.define('ui-text', UIText);
  customElements.define('ui-switch', UISwitch);
  // customElements.define('ui-markdown', UIMarkdown);
  initTooltip();
}
