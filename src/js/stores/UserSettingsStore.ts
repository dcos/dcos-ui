import EventEmitter from "events";

import LocalStorageUtil from "../utils/LocalStorageUtil";

const LOCAL_STORAGE_KEY = "dcosUserSettings";
const REFRESH_RATE_SETTING = "RefreshRate";

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

  get RefreshRateSetting(): number | null {
    const settings = this.getKey(REFRESH_RATE_SETTING);

    return typeof settings === "number" ? settings : null;
  }

  setRefreshRateSetting(refreshRate: number) {
    this.setKey(REFRESH_RATE_SETTING, refreshRate);
  }
}

export default new UserSettingsStore();
