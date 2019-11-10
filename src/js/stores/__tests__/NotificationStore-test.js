const NOTIFICATION_CHANGE = require("../../constants/EventTypes")
  .NOTIFICATION_CHANGE;
const NotificationStore = require("../NotificationStore");

let thisMockFn;

describe("NotificationStore", () => {
  describe("updating values", () => {
    beforeEach(() => {
      thisMockFn = jest.genMockFunction();
      NotificationStore.addChangeListener(NOTIFICATION_CHANGE, thisMockFn);
      NotificationStore.addNotification("foo", "bar", 1);
    });

    describe("#addNotification", () => {
      it("emits the correct event on visibilityChange", () => {
        expect(thisMockFn).toBeCalled();
      });

      it("sets the correct number", () => {
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(1);
      });
    });

    describe("#removeNotification", () => {
      it("emits the correct event on visibilityChange", () => {
        expect(thisMockFn).toBeCalled();
      });

      it("sets the correct number", () => {
        NotificationStore.removeNotification("foo", "bar");
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(0);
      });

      it("sets the correct number after adding", () => {
        NotificationStore.addNotification("foo", "bar", 1);
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(1);
        NotificationStore.removeNotification("foo", "bar");
        expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(0);
      });
    });
  });

  describe("#getNotificationCount", () => {
    it("returns 0 if there are no notifications", () => {
      expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(0);
    });

    it("returns 5 if there is 5 notifications", () => {
      NotificationStore.addNotification("foo", "bar", 5);
      expect(NotificationStore.getNotificationCount("foo", "bar")).toEqual(5);
    });
  });
});
