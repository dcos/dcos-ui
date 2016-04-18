import {HISTORY_CHANGE} from '../constants/EventTypes';
import {HashLocation} from 'react-router';
import {Store} from 'mesosphere-shared-reactjs';

import GetSetMixin from '../mixins/GetSetMixin';

var HistoryStore = Store.createStore({
  storeID: 'history',

  mixins: [GetSetMixin],

  init: function () {
    this.set({
      history: [HashLocation.getCurrentPath()]
    });

    HashLocation.addChangeListener(change => {
      // The router will call the callback with a different context
      // this is why this is here
      this.onHashChange(change);
    });
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  onHashChange: function (change) {
    let history = this.get('history');

    if (change.type === 'pop') {
      history.pop();
    } else if (change.type === 'push') {
      history.push(change.path);
    }

    this.set({history});
    this.emit(HISTORY_CHANGE);
  },

  /**
   * Returns the history at an offset
   * Passing 0 to the method will return current position
   *
   * @param  {Number} offset Should always be 0 or a negative number
   * @return {String|undefined} Path in history location if found
   */
  getHistoryAt: function (offset) {
    let history = this.get('history');
    return history[history.length - 1 + offset];
  },

  goBack: function (router) {
    let prevPath = HistoryStore.getHistoryAt(-1);
    if (prevPath) {
      router.transitionTo(prevPath);
      HistoryStore.get('history').pop();
      HistoryStore.get('history').pop();
      return;
    }

    HistoryStore.goBackToPage(router);
  },

  goBackToPage: function (router) {
    let routes = router.getCurrentRoutes();
    let pageBefore = routes[routes.length - 2];
    router.transitionTo(pageBefore.name, router.getCurrentParams());
  }
});

module.exports = HistoryStore;
