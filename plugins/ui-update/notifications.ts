import { i18nMark } from "@lingui/react";
import * as semver from "semver";
import { filter, map, tap } from "rxjs/operators";
import { NotificationService } from "@extension-kid/notification-service";
import {
  ToastAppearance,
  ToastCallbackType,
  ToastNotification
} from "@extension-kid/toast-notifications";

import { getAction$, getUiMetadata$ } from "./streams";
import { UIActions, UIActionType } from "./types/UIAction";
import { rollbackUI, updateUI } from "./commands";

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

function setupUIUpdatedNotification(notificationService: NotificationService) {
  getUiMetadata$()
    .pipe(
      filter(uiMetadata => {
        const { clientBuild, serverBuild } = uiMetadata;
        const coercedClientBuild = semver.coerce(clientBuild || "");
        const coercedServerBuild = semver.coerce(serverBuild || "");
        return (
          coercedClientBuild !== null &&
          coercedServerBuild !== null &&
          coercedClientBuild.raw !== coercedServerBuild.raw &&
          coercedClientBuild.raw !== LOCAL_DEV_VERSION
        );
      }),
      map(uiMetadata => {
        //@ts-ignore
        const displayVersion = semver.coerce(uiMetadata.serverBuild);
        const description = {
          id: i18nMark(
            "DC/OS UI has been updated to {version}. Reload the UI for the updated version."
          ),
          values: {
            // @ts-ignore
            version: displayVersion.raw
          }
        };
        return new ToastNotification(i18nMark("New UI Available"), {
          appearance: ToastAppearance.Success,
          description,
          primaryActionText: i18nMark("Reload"),
          callback: updateAvailableCallback
        });
      }),
      filter(
        toastNotification => !activeNotifications.includes(toastNotification.id)
      ),
      tap(toastNotification => activeNotifications.push(toastNotification.id))
    )
    .subscribe(notificationService.push);
}

function setupUpdateFailedNotification(
  notificationService: NotificationService
) {
  getAction$()
    .pipe(
      filter(
        uiAction =>
          uiAction.action === UIActions.Error &&
          uiAction.type === UIActionType.Update
      ),
      map(uiAction => {
        let notification: ToastNotification;
        const title = i18nMark("UI Upgrade Failure");
        const description = i18nMark(
          "The UI upgrade has failed due to an error."
        );
        if (uiAction.value.data !== undefined) {
          const upgradeVersion: string = uiAction.value.data;
          const tryAgainCallback = (
            callbackType: ToastCallbackType,
            toastNotification: ToastNotification
          ) => {
            updateFailedCallback(
              callbackType,
              toastNotification,
              upgradeVersion
            );
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
        return notification;
      }),
      filter(
        toastNotification => !activeNotifications.includes(toastNotification.id)
      ),
      tap(toastNotification => activeNotifications.push(toastNotification.id))
    )
    .subscribe(notificationService.push);
}

function setupRollbackFailedNotification(
  notificationService: NotificationService
) {
  getAction$()
    .pipe(
      filter(
        uiAction =>
          uiAction.action === UIActions.Error &&
          uiAction.type === UIActionType.Reset
      ),
      map(
        () =>
          new ToastNotification(i18nMark("UI Rollback Failure"), {
            appearance: ToastAppearance.Danger,
            description: i18nMark(
              "The UI rollback has failed due to an error."
            ),
            primaryActionText: i18nMark("Try Again"),
            callback: rollbackFailedCallback
          })
      ),
      filter(
        toastNotification => !activeNotifications.includes(toastNotification.id)
      ),
      tap(toastNotification => activeNotifications.push(toastNotification.id))
    )
    .subscribe(notificationService.push);
}

export {
  setupUIUpdatedNotification,
  setupUpdateFailedNotification,
  setupRollbackFailedNotification,
  clearActiveNotifications
};
