import GetSetBaseStore from './GetSetBaseStore';
import {HashLocation} from 'react-router';

import {HISTORY_CHANGE} from '../constants/EventTypes';

class HistoryStore extends GetSetBaseStore {
  init() {
    this.set({
      history: [HashLocation.getCurrentPath()]
    });

    HashLocation.addChangeListener(change => {
      // The router will call the callback with a different context
      // this is why this is here
      this.onHashChange(change);
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
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
