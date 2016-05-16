import {Store} from 'mesosphere-shared-reactjs';

import GetSetMixin from '../mixins/GetSetMixin';
import {NOTIFICATION_CHANGE} from '../constants/EventTypes';

const NotificationStore = Store.createStore({
  storeID: 'notification',

  mixins: [GetSetMixin],

  getSet_data: {
    notificationMap: {}
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  setLocationValue(notificationMap, location, notificationID, value) {
    let locationMap = notificationMap[location];
    if (locationMap == null) {
      notificationMap[location] = {};
    }

    notificationMap[location][notificationID] = value;
    return notificationMap;
  },

  deleteLocation: function (notificationMap, location, notificationID) {
    if (!notificationMap.hasOwnProperty(location)) {
      return notificationMap;
    }

    delete notificationMap[location][notificationID];
    return notificationMap;
  },

  // Public API Below

  /*
    Set the notification value for a specific location.

    @param {Array|String} locations Location or locations to set.
    @param {String} notificationID ID of the specific notification.
    @param {Number} value The number of notifications.
    @access public
  */
  addNotification: function (locations, notificationID, value) {
    let notificationMap = this.get('notificationMap');

    if (Array.isArray(locations)) {
      locations.forEach((location) => {
        this.setLocationValue(notificationMap, location, notificationID, value);
      });
    } else {
      this.setLocationValue(notificationMap, locations, notificationID, value);
    }

    this.set({notificationMap});
    this.emit(NOTIFICATION_CHANGE);
  },

  /*
    Remove all the notifications for a specific location.

    @param {Array|String} locations Location or locations to remove.
    @param {String} notificationID ID of the specific notification.
    @access public
  */
  removeNotification: function (locations, notificationID) {
    let notificationMap = this.get('notificationMap');

    if (Array.isArray(locations)) {
      locations.forEach((location) => {
        this.deleteLocation(notificationMap, location, notificationID);
      });
    } else {
      this.deleteLocation(notificationMap, locations, notificationID);
    }

    this.set({notificationMap});
    this.emit(NOTIFICATION_CHANGE);
  },

  /*
    Get the notification value for a specific location

    @param {String} tabName Location or locations to get the notification count.
    @access public
    @return {Number} value representing the number of notifications.
  */
  getNotificationCount: function (tabName) {
    let notificationMap = this.get('notificationMap');
    if (!notificationMap.hasOwnProperty(tabName)) {
      return 0;
    }

    notificationMap = notificationMap[tabName];

    return Object.values(notificationMap).reduce(function (tally, count) {
      return tally += count;
    }, 0);
  }

});

module.exports = NotificationStore;
