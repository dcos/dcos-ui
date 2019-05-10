import { Container } from "inversify";
import { BehaviorSubject, of } from "rxjs";
import { marbles } from "rxjs-marbles/jest";

let mockMetadata$ = of({});
let mockAction$: BehaviorSubject<any>;
jest.mock("../streams", () => ({
  getAction$: () => mockAction$,
  getUiMetadata$: () => mockMetadata$
}));

import { ToastNotification } from "@extension-kid/toast-notifications";

import {
  EMPTY_ACTION,
  UIAction,
  UIActions,
  UIActionType
} from "../types/UIAction";
import { TYPES } from "#SRC/js/types/containerTypes";
import { NotificationServiceType } from "@extension-kid/notification-service";
import {
  loadNotifications,
  UIUpdateNotifications,
  UIUpdateNotificationsType
} from "../notifications";
import { setupI18n } from "@lingui/core";

mockAction$ = new BehaviorSubject<UIAction>(EMPTY_ACTION);
const mockNS = {
  push: jest.fn()
};

describe("Notifications", () => {
  let notifications: UIUpdateNotifications;
  beforeAll(() => {
    const container = new Container();
    const i18n = setupI18n();
    i18n._ = (id: string) => id;
    container.bind(TYPES.I18n).toConstantValue(i18n);
    container.bind(NotificationServiceType).toConstantValue(mockNS);
    loadNotifications(container);

    notifications = container.get<UIUpdateNotifications>(
      UIUpdateNotificationsType
    );
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    notifications._clear();
  });
  describe("UIUpdatedNotification", () => {
    it(
      "pushes notification when client build !== server build",
      marbles(m => {
        mockMetadata$ = m.cold("--j", {
          j: {
            clientBuild: "master+v1.0.1",
            packageVersion: "1.2.0",
            packageVersionIsDefault: false,
            serverBuild: "master+v1.2.0"
          }
        });
        notifications.setupUIUpdatedNotification();
        m.flush();

        expect(mockNS.push).toHaveBeenCalled();
      })
    );
    it(
      "doesn't push a notification if build matches",
      marbles(m => {
        mockMetadata$ = m.cold("--j", {
          j: {
            clientBuild: "master+v1.0.1",
            packageVersion: "1.0.1",
            packageVersionIsDefault: false,
            serverBuild: "master+v1.0.1"
          }
        });
        notifications.setupUIUpdatedNotification();
        m.flush();

        expect(mockNS.push).not.toHaveBeenCalled();
      })
    );
    it(
      "doesn't push a notification for local dev",
      marbles(m => {
        mockMetadata$ = m.cold("--j", {
          j: {
            clientBuild: "0.0.0-dev+semantic-release",
            packageVersion: "1.0.1",
            packageVersionIsDefault: false,
            serverBuild: "master+v1.0.1"
          }
        });
        notifications.setupUIUpdatedNotification();
        m.flush();

        expect(mockNS.push).not.toHaveBeenCalled();
      })
    );
    it(
      "doesn't push second notification if first hasn't been dismissed",
      marbles(m => {
        mockMetadata$ = m.cold("--j--k", {
          j: {
            clientBuild: "master+v1.0.1",
            packageVersion: "1.2.0",
            packageVersionIsDefault: false,
            serverBuild: "master+v1.2.0"
          },
          k: {
            clientBuild: "master+v1.0.1",
            packageVersion: "1.2.0",
            packageVersionIsDefault: false,
            serverBuild: "master+v1.2.0"
          }
        });
        notifications.setupUIUpdatedNotification();
        m.flush();

        expect(mockNS.push).toHaveBeenCalledTimes(1);
      })
    );
    it(
      "calls location.reload for toast primary callback",
      marbles(m => {
        mockMetadata$ = m.cold("--j", {
          j: {
            clientBuild: "master+v1.0.1",
            packageVersion: "1.2.0",
            packageVersionIsDefault: false,
            serverBuild: "master+v1.2.0"
          }
        });
        let notification: ToastNotification | null = null;
        mockNS.push.mockImplementation(tn => (notification = tn));
        const reloadSpy = jest
          .spyOn(window.location, "reload")
          .mockImplementation(() => {
            return;
          });

        notifications.setupUIUpdatedNotification();
        m.flush();

        expect(notification).not.toBeNull();
        if (notification === null) {
          return;
        }
        // @ts-ignore
        notification.primaryAction();
        expect(reloadSpy).toHaveBeenCalledTimes(1);
      })
    );
  });
  describe("UpdateFailedNotification", () => {
    beforeEach(() => {
      mockAction$ = new BehaviorSubject<UIAction>(EMPTY_ACTION);
    });

    it("should push a notification when an update fails", () => {
      notifications.setupUpdateFailedNotification();
      mockAction$.next({
        type: UIActionType.Update,
        action: UIActions.Error,
        value: {
          message: "Something bad happened",
          data: "1.0.0"
        }
      });

      expect(mockNS.push).toHaveBeenCalled();
    });

    it("should not push a notification when an update succeeds", () => {
      notifications.setupUpdateFailedNotification();
      mockAction$.next({
        type: UIActionType.Update,
        action: UIActions.Completed,
        value: {
          message: "Complete",
          data: "1.0.0"
        }
      });

      expect(mockNS.push).not.toHaveBeenCalled();
    });

    it("should have a primaryAction if UIAction has data", () => {
      notifications.setupUpdateFailedNotification();
      mockAction$.next({
        type: UIActionType.Update,
        action: UIActions.Error,
        value: {
          message: "Something bad happened",
          data: "1.0.0"
        }
      });

      expect(
        mockNS.push.mock.calls[0][0].primaryActionText
      ).not.toBeUndefined();
    });

    it("should not have a primaryAction if UIAction is missing data", () => {
      notifications.setupUpdateFailedNotification();
      mockAction$.next({
        type: UIActionType.Update,
        action: UIActions.Error,
        value: {
          message: "Something bad happened"
        }
      });

      expect(mockNS.push.mock.calls[0][0].primaryActionText).toBeUndefined();
    });
  });
  describe("RollbackFailedNotification", () => {
    beforeEach(() => {
      mockAction$ = new BehaviorSubject<UIAction>(EMPTY_ACTION);
    });

    it("should push a notification when a rollback fails", () => {
      notifications.setupRollbackFailedNotification();
      mockAction$.next({
        type: UIActionType.Reset,
        action: UIActions.Error,
        value: {
          message: "Something bad happened"
        }
      });

      expect(mockNS.push).toHaveBeenCalled();
    });

    it("should not push a notification when a rollback succeeds", () => {
      notifications.setupRollbackFailedNotification();
      mockAction$.next({
        type: UIActionType.Reset,
        action: UIActions.Completed,
        value: {
          message: "Complete"
        }
      });

      expect(mockNS.push).not.toHaveBeenCalled();
    });
  });
});
