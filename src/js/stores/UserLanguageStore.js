import { EventEmitter } from "events";
import Util from "../utils/Util";
import UserSettingsStore from "./UserSettingsStore";
import { SAVED_STATE_KEY } from "../constants/UserSettings";
import Languages from "../constants/Languages";

const getLanguagePreference = () => {
  // TODO: use the full string from `navigator.language` when we support regional dialects
  const langWithoutRegion = navigator.language.split("-")[0];
  const fallbackLang = Languages[navigator.language] ? langWithoutRegion : "en";

  return (
    Util.findNestedPropertyInObject(
      UserSettingsStore.getKey(SAVED_STATE_KEY),
      "language"
    ) || fallbackLang
  );
};

class UserLanguageStore extends EventEmitter {
  get() {
    return getLanguagePreference();
  }

  set(language) {
    const savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY) || {};

    savedStates.language = language;

    UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
  }
}

export default new UserLanguageStore();
