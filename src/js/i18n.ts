import { setupI18n } from "@lingui/core";

import UserLanguageStore from "./stores/UserLanguageStore";

import en from "#LOCALE/en/messages";
import zh from "#LOCALE/zh/messages";

let enEE: any = { languageData: {}, messages: {} };
let zhEE: any = { languageData: {}, messages: {} };

try {
  enEE = require("#EXTERNAL_PLUGINS/locale/en/messages.js");
  if (enEE.__esModule) {
    enEE = enEE.default;
  }

  zhEE = require("#EXTERNAL_PLUGINS/locale/zh/messages.js");
  if (zhEE.__esModule) {
    zhEE = zhEE.default;
  }
} catch {
  // No enterprise plugins
}

const catalogs = {
  en: {
    languageData: {
      ...en.languageData,
      ...enEE.languageData
    },
    messages: {
      ...en.messages,
      ...enEE.messages
    }
  },
  zh: {
    languageData: {
      ...zh.languageData,
      ...zhEE.languageData
    },
    messages: {
      ...zh.messages,
      ...zhEE.messages
    }
  }
};
const language = UserLanguageStore.get();
const i18n = setupI18n({ language, catalogs });

export { catalogs, i18n };
