import GetSetBaseStore from './GetSetBaseStore';
import {HashLocation} from 'react-router';

import {HISTORY_CHANGE} from '../constants/EventTypes';
import PluginSDK from 'PluginSDK';

class HistoryStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      history: [HashLocation.getCurrentPath()]
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        change: HISTORY_CHANGE
      },
      unmountWhen: function () {
        return true;
      },
      listenAlways: false
    });

    HashLocation.addChangeListener(change => {
      // The router will call the callback with a different context
      // this is why this is here
      this.onHashChange(change);
    });
  }

  onHashChange(change) {
    let history = this.get('history');

    if (change.type === 'pop') {
      history.pop();
    } else if (change.type === 'push') {
      history.push(change.path);
    }

    this.set({history});
    this.emit(HISTORY_CHANGE);
  }

  /**
   * Returns the history at an offset
   * Passing 0 to the method will return current position
   *
   * @param  {Number} offset Should always be 0 or a negative number
   * @return {String|undefined} Path in history location if found
   */
  getHistoryAt(offset) {
    let history = this.get('history');
    return history[history.length - 1 + offset];
  }

  goBack(router) {
    let prevPath = this.getHistoryAt(-1);
    if (prevPath) {
      router.transitionTo(prevPath);
      this.get('history').pop();
      this.get('history').pop();
      return;
    }

    this.goBackToPage(router);
  }

  goBackToPage(router) {
    let routes = router.getCurrentRoutes();
    let pageBefore = routes[routes.length - 2];
    router.transitionTo(pageBefore.name, router.getCurrentParams());
  }

  get storeID() {
    return 'history';
  }
}

module.exports = new HistoryStore();
