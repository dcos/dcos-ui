import { setupI18n } from "@lingui/core";

import UserLanguageStore from "./stores/UserLanguageStore";

import en from "#LOCALE/en/messages";
import zh from "#LOCALE/zh/messages";

const catalogs = { en, zh };
const language = UserLanguageStore.get();
const i18n = setupI18n({ language, catalogs });

export { catalogs, i18n };
