import {Store} from 'mesosphere-shared-reactjs';

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

const UserSettingsStore = Store.createStore({
  storeID: 'userSettings',

  getKey: function (key) {
    let localStorageObject = getLocalStorageObject();
    if (localStorageObject == null) {
      return null;
    }

    return localStorageObject[key];
  },

  setKey: function (key, value) {
    let localStorageObject = getLocalStorageObject();
    if (localStorageObject == null) {
      localStorageObject = {};
    }

    localStorageObject[key] = value;
    LocalStorageUtil.set(LOCAL_STORAGE_KEY, JSON.stringify(localStorageObject));
  }
});

module.exports = UserSettingsStore;
