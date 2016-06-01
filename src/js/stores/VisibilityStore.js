import GetSetBaseStore from './GetSetBaseStore';
import Config from '../config/Config';
import {VISIBILITY_CHANGE} from '../constants/EventTypes';

// Use visibility API to check if current tab is active or not
const Visibility = (function () {
  let stateKey;
  let keys = {
    hidden: 'visibilitychange',
    webkitHidden: 'webkitvisibilitychange',
    mozHidden: 'mozvisibilitychange',
    msHidden: 'msvisibilitychange'
  };

  // Find first key available on document
  Object.keys(keys).some(function (key) {
    if (key in global.document) {
      stateKey = key;

      return true;
    }

    return false;
  });

  return {
    addChangeListener(callback) {
      global.document.addEventListener(keys[stateKey], callback);
    },

    getVisibility() {
      return !global.document[stateKey];
    }
  };
})();

class VisibilityStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      isTabVisible: true,
      isInactive: false
    };

    this.timeOut = null;

    // Listen for visibility change events
    Visibility.addChangeListener(() => {
      // We need setTimeout because browser hasn't yet given us the execution
      // context.
      setTimeout(this.onVisibilityChange.bind(this), 0);
    });
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  addChangeListener(eventName, callback) {
    return this.on(eventName, callback);
  }

  isTabVisible() {
    return this.get('isTabVisible');
  }

  isInactive() {
    return this.get('isInactive');
  }

  onVisibilityChange() {
    let isTabVisible = Visibility.getVisibility();

    this.set({isTabVisible});
    this.emit(VISIBILITY_CHANGE);

    if (!this.get('isInactive') && !this.timeOut && !this.get('isTabVisible')) {
      this.timeOut = setTimeout(() => {
        this.set({isInactive: true});
        this.emit(VISIBILITY_CHANGE);

      }, Config.setInactiveAfter || 0);
    }

    if (this.get('isInactive') && isTabVisible) {
      if (this.timeOut) {
        clearTimeout(this.timeOut);
        this.timeOut = null;
      }

      this.set({isInactive: false});
      this.emit(VISIBILITY_CHANGE);
    }
  }

  get storeID() {
    return 'visibility';
  }

}

module.exports = new VisibilityStore();
