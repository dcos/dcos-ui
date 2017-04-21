import Config from "../config/Config";
import UserSettingsStore from "../stores/UserSettingsStore";
import { SAVED_STATE_KEY } from "../constants/UserSettings";

const SaveStateMixin = {
  componentWillMount() {
    const key = this.saveState_key;
    if (!key) {
      return;
    }

    const savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY);
    if (savedStates == null || savedStates[key] == null) {
      return;
    }

    this.setState(savedStates[key]);
  },

  componentWillUnmount() {
    this.saveState_save();
  },

  saveState_save() {
    const { saveState_key, saveState_properties, state } = this;
    let savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY);
    if (savedStates == null) {
      savedStates = {};
    }

    let stateToSave = {};
    if (saveState_properties) {
      stateToSave = saveState_properties.reduce(function(newState, property) {
        newState[property] = state[property];

        return newState;
      }, {});
    }

    if (Object.keys(stateToSave).length) {
      savedStates[saveState_key] = stateToSave;
      UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
    } else if (Config.environment === "development") {
      console.warn("No state saved. Please set saveState_properties.");
    }
  }
};

module.exports = SaveStateMixin;
