import { i18nMark } from "@lingui/react";
import * as semver from "semver";
import { filter } from "rxjs/operators";
import {
  ToastAppearance,
  ToastCallbackType,
  ToastNotification
} from "@extension-kid/toast-notifications";

import { getAction$, getUiMetadata$ } from "./streams";
import { UIActions, UIActionType } from "./types/UIAction";
import { rollbackUI, updateUI } from "./commands";
import { getNotificationService } from "./utils";

const LOCAL_DEV_VERSION = "0.0.0";
const activeNotifications: string[] = [];

function clearActiveNotifications() {
  if (activeNotifications.length) {
    activeNotifications.splice(0, activeNotifications.length);
  }
}

function removeActiveNotification(id: string) {
  const notificationIndex = activeNotifications.indexOf(id);
  if (notificationIndex !== -1) {
    activeNotifications.splice(notificationIndex, 1);
  }
}

function displayNotification(notification: ToastNotification) {
  if (!activeNotifications.includes(notification.id)) {
    const ns = getNotificationService();
    ns.push(notification);
    activeNotifications.push(notification.id);
  }
}

function updateAvailableCallback(
  callbackType: ToastCallbackType,
  toastNotification: ToastNotification
) {
  removeActiveNotification(toastNotification.id);
  switch (callbackType) {
    case "primary":
      // Reload the UI
      location.reload();
      break;
  }
}

function updateFailedCallback(
  callbackType: ToastCallbackType,
  toastNotification: ToastNotification,
  updateVersion: string
) {
  removeActiveNotification(toastNotification.id);
  switch (callbackType) {
    case "primary":
      // Retry update
      updateUI(updateVersion);
      break;
  }
}

function rollbackFailedCallback(
  callbackType: ToastCallbackType,
  toastNotification: ToastNotification
) {
  removeActiveNotification(toastNotification.id);
  switch (callbackType) {
    case "primary":
      // Retry rollback
      rollbackUI();
      break;
  }
}

function dismissNotificationCallback(
  _callbackType: ToastCallbackType,
  toastNotification: ToastNotification
) {
  removeActiveNotification(toastNotification.id);
}

function setupUIUpdatedNotification() {
  getUiMetadata$().subscribe(uiMetadata => {
    const { clientBuild, serverBuild } = uiMetadata;
    const coercedClientBuild = semver.coerce(clientBuild || "");
    const coercedServerBuild = semver.coerce(serverBuild || "");
    if (
      coercedClientBuild !== null &&
      coercedServerBuild !== null &&
      coercedClientBuild.raw !== coercedServerBuild.raw &&
      coercedClientBuild.raw !== LOCAL_DEV_VERSION
    ) {
      const displayVersion = coercedServerBuild.raw;
      const description = {
        id: i18nMark(
          "DC/OS UI has been updated to {version}. Reload the UI for the updated version."
        ),
        values: {
          version: displayVersion
        }
      };
      const notification = new ToastNotification(i18nMark("New UI Available"), {
        appearance: ToastAppearance.Success,
        description,
        primaryActionText: i18nMark("Reload"),
        callback: updateAvailableCallback
      });
      displayNotification(notification);
    }
  });
}

function setupUpdateFailedNotification() {
  getAction$()
    .pipe(
      filter(
        action =>
          action.action === UIActions.Error &&
          action.type === UIActionType.Update
      )
    )
    .subscribe(action => {
      let notification: ToastNotification;
      const title = i18nMark("UI Upgrade Failure");
      const description = i18nMark(
        "The UI upgrade has failed due to an error."
      );
      if (action.value.data !== undefined) {
        const upgradeVersion: string = action.value.data;
        const tryAgainCallback = (
          callbackType: ToastCallbackType,
          toastNotification: ToastNotification
        ) => {
          updateFailedCallback(callbackType, toastNotification, upgradeVersion);
        };
        notification = new ToastNotification(title, {
          appearance: ToastAppearance.Danger,
          description,
          primaryActionText: i18nMark("Try Again"),
          callback: tryAgainCallback
        });
      } else {
        notification = new ToastNotification(title, {
          appearance: ToastAppearance.Danger,
          description,
          callback: dismissNotificationCallback
        });
      }

      displayNotification(notification);
    });
}

function setupRollbackFailedNotification() {
  getAction$()
    .pipe(
      filter(
        action =>
          action.action === UIActions.Error &&
          action.type === UIActionType.Reset
      )
    )
    .subscribe(() => {
      const notification = new ToastNotification(
        i18nMark("UI Rollback Failure"),
        {
          appearance: ToastAppearance.Danger,
          description: i18nMark("The UI rollback has failed due to an error."),
          primaryActionText: i18nMark("Try Again"),
          callback: rollbackFailedCallback
        }
      );
      displayNotification(notification);
    });
}

export {
  setupUIUpdatedNotification,
  setupUpdateFailedNotification,
  setupRollbackFailedNotification,
  clearActiveNotifications
};
