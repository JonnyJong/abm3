import { UIColor, UIColorPicker } from "./color";
import { initDrag } from "./drag";
import { UIImagePicker } from "./image";
import { UILang } from "./lang";
import { UIList } from "./list";
import { UILoader } from "./loader";
import { UINumber } from "./number";
import { UIRange } from "./range";
import { UISelect } from "./select";
import { UISettingItem, UISettingItemChild } from "./settings";
import { UISwitch } from "./switch";
import { UITags } from "./tags";
import { UIText } from "./text";
// import { UIMarkdown } from "./markdown";
import { initTooltip } from "./tooltip";

export function initUI() {
  customElements.define('ui-lang', UILang);
  customElements.define('ui-text', UIText);
  customElements.define('ui-switch', UISwitch);
  customElements.define('ui-range', UIRange);
  customElements.define('ui-color', UIColor);
  customElements.define('ui-color-picker', UIColorPicker);
  customElements.define('ui-image-picker', UIImagePicker);
  customElements.define('ui-number', UINumber);
  customElements.define('ui-select', UISelect);
  customElements.define('ui-tags', UITags);
  customElements.define('ui-list', UIList);
  customElements.define('ui-setting-item', UISettingItem),
  customElements.define('ui-setting-item-child', UISettingItemChild);
  customElements.define('ui-loader', UILoader);
  // customElements.define('ui-markdown', UIMarkdown);
  initTooltip();

  initDrag();
}
