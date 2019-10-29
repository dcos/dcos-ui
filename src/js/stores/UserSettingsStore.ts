import EventEmitter from "events";

import LocalStorageUtil from "../utils/LocalStorageUtil";

const LOCAL_STORAGE_KEY: string = "dcosUserSettings";
const JSON_EDITOR_SETTING: string = "JSONEditor";
const REFRESH_RATE_SETTING: string = "RefreshRate";
const isObject = (data: unknown): data is Record<string, unknown> =>
  typeof data === "object" && data != null;

function getLocalStorageObject() {
  const localStorageObject = LocalStorageUtil.get(LOCAL_STORAGE_KEY);
  if (localStorageObject != null) {
    try {
      return JSON.parse(localStorageObject);
    } catch (e) {
      return null;
    }
  }
  return null;
}

class UserSettingsStore extends EventEmitter {
  getKey(key: string): unknown {
    const localStorageObject = getLocalStorageObject();
    if (localStorageObject == null) {
      return null;
    }

    return localStorageObject[key];
  }

  setKey(key: string, value: unknown): void {
    let localStorageObject = getLocalStorageObject();
    if (localStorageObject == null) {
      localStorageObject = {};
    }

    localStorageObject[key] = value;
    LocalStorageUtil.set(LOCAL_STORAGE_KEY, JSON.stringify(localStorageObject));
  }

  get storeID() {
    return "userSettings";
  }

  get JSONEditorExpandedSetting(): boolean {
    const settings = this.getKey(JSON_EDITOR_SETTING);

    return isObject(settings) && !!settings.expanded;
  }

  setJSONEditorExpandedSetting(expanded: boolean) {
    const settings = this.getKey(JSON_EDITOR_SETTING);

    this.setKey(
      JSON_EDITOR_SETTING,
      isObject(settings) ? { ...settings, expanded } : { expanded }
    );
  }

  get RefreshRateSetting(): number | null {
    const settings = this.getKey(REFRESH_RATE_SETTING);

    return typeof settings === "number" ? settings : null;
  }

  setRefreshRateSetting(refreshRate: number) {
    this.setKey(REFRESH_RATE_SETTING, refreshRate);
  }
}

export default new UserSettingsStore();
