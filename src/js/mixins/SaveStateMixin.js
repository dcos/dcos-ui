import UserSettingsStore from '../stores/UserSettingsStore';

const SAVED_STATE_KEY = 'savedStates';

const SaveStateMixin = {
  componentWillMount() {
    let key = this.saveState_key;
    if (!key) {
      return;
    }

    let savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY);
    if (savedStates == null || savedStates[key] == null) {
      return;
    }

    this.setState(savedStates[key]);
  },

  componentWillUnmount() {
    let {saveState_key, state} = this;
    let savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY);
    if (savedStates == null) {
      savedStates = {};
    }

    savedStates[saveState_key] = state;
    UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
  }
};

module.exports = SaveStateMixin;
