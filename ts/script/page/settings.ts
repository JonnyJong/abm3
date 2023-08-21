// import { SettingTemplate } from "../../ui/template";
import { lang } from "../locale";
import { SinglePageOptions } from "../page";
import { SettingsPage, registerSettingsPage } from "../settings";

// function registerSettingsPages() {
//   const general: SettingsPage = {
//     name: lang('settings.general'),
//     template: new SettingTemplate([
//       {
//         type: 'title',
//         text: lang('settings.personalized'),
//         key: 'general_title',
//       },
//       /* {
//         type: 'item',
//         name: 'TODO: avatar',
//         head: [],
//         body: [],
//         key: 'avatar',
//       },
//       {
//         type: 'item',
//         name: lang('settings.nickname'),
//         head: [],
//         body: [],
//         key: 'nickname',
//       }, */
//       {
//         type: 'item',
//         name: lang('settings.theme.title'),
//         head: [{
//           type: 'select',
//           values: [
//             {
//               name: lang('settings.theme.system'),
//               value: 'system',
//             },
//             {
//               name: lang('settings.theme.light'),
//               value: 'light',
//             },
//             {
//               name: lang('settings.theme.dark'),
//               value: 'dark',
//             },
//           ],
//           key: 'theme',
//           data: 'theme',
//         }],
//         body: [],
//         key: 'theme',
//       },
//       {
//         type: 'item',
//         name: lang('settings.theme_color'),
//         head: [
//           {
//             type: 'button',
//             text: lang('settings.use_system_color'),
//             key: 'use_system_color',
//             action: ()=>{},
//           },
//           {
//             type: 'color',
//             key: 'theme_color',
//             data: 'themeColor',
//           },
//         ],
//         body: [],
//         key: 'theme_color',
//       },
//       {
//         type: 'title',
//         text: lang('settings.application'),
//         key: 'general_title',
//       },
//     ]),
//   };
//   const database: SettingsPage = {
//     name: lang('settings.database'),
//     template: new SettingTemplate([]),
//   };
//   const about: SettingsPage = {
//     name: lang('settings.about'),
//     template: new SettingTemplate([]),
//   };
//   const extensions: SettingsPage = {
//     name: lang('settings.extensions'),
//     template: new SettingTemplate([]),
//   };
// }

const page: SinglePageOptions = {
  name: 'settings',
  single: true,
  onCreate(element, option) {
    // registerSettingsPages();
  },
  onBack(element, option) {
  },
  onOpen(element, option) {
  },
};

export default page;
