jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../NotificationStore');

import {NOTIFICATION_CHANGE} from '../../constants/EventTypes';
var NotificationStore = require('../NotificationStore');

describe('NotificationStore', function () {
  beforeEach(function () {
    this.mockFn = jest.genMockFunction();
    NotificationStore.addChangeListener(NOTIFICATION_CHANGE, this.mockFn);
    NotificationStore.addNotification('foo', 'bar', 1);
  });

  describe('#addNotification', function () {

    it('emits the correct event on visiblityChange', function () {
      expect(this.mockFn).toBeCalled();
    });

    it('sets the correct number', function () {
      expect(NotificationStore.getNotificationCount('foo', 'bar')).toEqual(1);
    });
  });

  describe('#removeNotification', function () {
    it('emits the correct event on visiblityChange', function () {
      expect(this.mockFn).toBeCalled();
    });

    it('sets the correct number', function () {
      NotificationStore.addNotification('foo', 'bar', 1);
      expect(NotificationStore.getNotificationCount('foo', 'bar')).toEqual(1);
      NotificationStore.removeNotification('foo', 'bar');
      expect(NotificationStore.getNotificationCount('foo', 'bar')).toEqual(0);
    });
  });

});
