jest.dontMock("../NotificationStore");

const NOTIFICATION_CHANGE = require("../../constants/EventTypes")
  .NOTIFICATION_CHANGE;
const NotificationStore = require("../NotificationStore");

describe("NotificationStore", function() {
  describe("updating values", function() {
    beforeEach(function() {
      this.mockFn = jest.genMockFunction();
      NotificationStore.addChangeListener(NOTIFICATION_CHANGE, this.mockFn);
      NotificationStore.addNotification("foo", "bar", 1);
    });

    describe("#addNotification", function() {
      it("emits the correct event on visibilityChange", function() {
        expect(this.mockFn).toBeCalled();
      });

      it("sets the correct number", function() {
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(1);
      });
    });

    describe("#removeNotification", function() {
      it("emits the correct event on visibilityChange", function() {
        expect(this.mockFn).toBeCalled();
      });

      it("sets the correct number", function() {
        NotificationStore.removeNotification("foo", "bar");
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(0);
      });

      it("sets the correct number after adding", function() {
        NotificationStore.addNotification("foo", "bar", 1);
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(1);
        NotificationStore.removeNotification("foo", "bar");
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(0);
      });
    });
  });

  describe("#getNotificationCount", function() {
    it("returns 0 if there are no notifications", function() {
      expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(0);
    });

    it("returns 5 if there is 5 notifications", function() {
      NotificationStore.addNotification("foo", "bar", 5);
      expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(5);
    });
  });
});
