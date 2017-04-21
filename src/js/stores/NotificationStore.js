import PluginSDK from "PluginSDK";

import GetSetBaseStore from "./GetSetBaseStore";
import { NOTIFICATION_CHANGE } from "../constants/EventTypes";

class NotificationStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      notificationMap: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        change: NOTIFICATION_CHANGE
      },
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });
  }

  setLocationValue(notificationMap, location, notificationID, value) {
    const locationMap = notificationMap[location];
    if (locationMap == null) {
      notificationMap[location] = {};
    }

    notificationMap[location][notificationID] = value;

    return notificationMap;
  }

  deleteLocation(notificationMap, location, notificationID) {
    if (!Object.prototype.hasOwnProperty.call(notificationMap, location)) {
      return notificationMap;
    }

    delete notificationMap[location][notificationID];

    return notificationMap;
  }

  // Public API Below
  // TODO:  DCOS-7431 - Fix documentation style (jsdoc)
  /*
   Set the notification value for a specific location.

   @param {Array|String} locations Location or locations to set.
   @param {String} notificationID ID of the specific notification.
   @param {Number} value The number of notifications.
   @access public
   */
  addNotification(locations, notificationID, value) {
    const notificationMap = this.get("notificationMap");

    if (Array.isArray(locations)) {
      locations.forEach(location => {
        this.setLocationValue(notificationMap, location, notificationID, value);
      });
    } else {
      this.setLocationValue(notificationMap, locations, notificationID, value);
    }

    this.set({ notificationMap });
    this.emit(NOTIFICATION_CHANGE);
  }

  /*
   Remove all the notifications for a specific location.

   @param {Array|String} locations Location or locations to remove.
   @param {String} notificationID ID of the specific notification.
   @access public
   */
  removeNotification(locations, notificationID) {
    const notificationMap = this.get("notificationMap");

    if (Array.isArray(locations)) {
      locations.forEach(location => {
        this.deleteLocation(notificationMap, location, notificationID);
      });
    } else {
      this.deleteLocation(notificationMap, locations, notificationID);
    }

    this.set({ notificationMap });
    this.emit(NOTIFICATION_CHANGE);
  }

  /*
   Get the notification value for a specific location

   @param {String} tabName Location or locations to get the notification count.
   @access public
   @return {Number} value representing the number of notifications.
   */
  getNotificationCount(tabName) {
    let notificationMap = this.get("notificationMap");
    if (!Object.prototype.hasOwnProperty.call(notificationMap, tabName)) {
      return 0;
    }

    notificationMap = notificationMap[tabName];

    return Object.values(notificationMap).reduce(function(tally, count) {
      return (tally += count);
    }, 0);
  }

  get storeID() {
    return "notification";
  }
}

module.exports = new NotificationStore();
