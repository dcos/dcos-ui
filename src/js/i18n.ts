import { setupI18n } from "@lingui/core";

import UserLanguageStore from "./stores/UserLanguageStore";

//@ts-ignore
import en from "#LOCALE/en/messages.js";
//@ts-ignore
import zh from "#LOCALE/zh/messages.js";

const catalogs = { en, zh };
const language = UserLanguageStore.get();
const i18n = setupI18n({ language, catalogs });
const I18nType = Symbol("I18n");

export { catalogs, i18n, I18nType };
