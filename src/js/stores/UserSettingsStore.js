import EventEmitter from 'events';

import LocalStorageUtil from '../utils/LocalStorageUtil';

const LOCAL_STORAGE_KEY = 'dcosUserSettings';

function getLocalStorageObject() {
  let localStorageObject = LocalStorageUtil.get(LOCAL_STORAGE_KEY);
  try {
    return JSON.parse(localStorageObject);
  } catch (e) {
    return null;
  }
}

class UserSettingsStore extends EventEmitter {
  constructor() {
    super(...arguments);
  }

  getKey(key) {
    let localStorageObject = getLocalStorageObject();
    if (localStorageObject == null) {
      return null;
    }

    return localStorageObject[key];
  }

  setKey(key, value) {
    let localStorageObject = getLocalStorageObject();
    if (localStorageObject == null) {
      localStorageObject = {};
    }

    localStorageObject[key] = value;
    LocalStorageUtil.set(LOCAL_STORAGE_KEY, JSON.stringify(localStorageObject));
  }

  get storeID() {
    return 'userSettings';
  }
}

module.exports = new UserSettingsStore();
