import { injectable, inject, Container } from "inversify";
import { I18n, i18nMark } from "@lingui/core";

import * as semver from "semver";
import { filter, map, tap } from "rxjs/operators";
import {
  NotificationService,
  NotificationServiceType
} from "@extension-kid/notification-service";
import {
  ToastAppearance,
  ToastCallbackType,
  ToastNotification
} from "@extension-kid/toast-notifications";

import { TYPES } from "#SRC/js/types/containerTypes";
import { getAction$, getUiMetadata$ } from "./streams";
import { UIActions, UIActionType } from "./types/UIAction";
import { rollbackUI, updateUI } from "./commands";

const LOCAL_DEV_VERSION = "0.0.0";

interface UIUpdateNotificationTypes {
  uiUpdated: boolean;
  uiUpdateFailed: boolean;
  uiRollbackFailed: boolean;
}

interface UIUpdateNotifications {
  _clear(): void;
  setupUIUpdatedNotification(): void;
  setupUpdateFailedNotification(): void;
  setupRollbackFailedNotification(): void;
}

const UIUpdateNotificationsType = Symbol.for("UIUpdateNotifications");

@injectable()
class Notifications implements UIUpdateNotifications {
  private static _methodsToBind = [
    "_clear",
    "setupUIUpdatedNotification",
    "setupUpdateFailedNotification",
    "setupRollbackFailedNotification",
    "removeActiveNotification",
    "updateAvailableCallback",
    "dismissNotificationCallback",
    "rollbackFailedCallback",
    "updateFailedCallback"
  ];
  private readonly _notificationService: NotificationService;
  private readonly _i18n: I18n;
  private _activeNotifications: string[] = [];
  private setupNotifications: UIUpdateNotificationTypes = {
    uiUpdated: false,
    uiUpdateFailed: false,
    uiRollbackFailed: false
  };

  public constructor(
    @inject(NotificationServiceType) notificationService: NotificationService,
    @inject(TYPES.I18n) i18n: I18n
  ) {
    this._notificationService = notificationService;
    this._i18n = i18n;

    Notifications._methodsToBind.forEach(method => {
      //@ts-ignore
      this[method] = this[method].bind(this);
    });
  }

  public setupUIUpdatedNotification() {
    if (this.setupNotifications.uiUpdated) {
      return;
    }
    this.setupNotifications.uiUpdated = true;
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
          const title = this._i18n._(i18nMark("New UI Available"));
          const description = this._i18n._(
            i18nMark(
              "DC/OS UI has been updated to {version}. Reload the UI for the updated version."
            ),
            {
              version: displayVersion
            }
          );
          const primaryActionText = this._i18n._(i18nMark("Reload"));
          return new ToastNotification(title, {
            appearance: ToastAppearance.Success,
            callback: this.updateAvailableCallback,
            description,
            primaryActionText
          });
        }),
        filter(
          toastNotification =>
            !this._activeNotifications.includes(toastNotification.id)
        ),
        tap(toastNotification =>
          this._activeNotifications.push(toastNotification.id)
        )
      )
      .subscribe(this._notificationService.push);
  }
  public setupUpdateFailedNotification() {
    if (this.setupNotifications.uiUpdateFailed) {
      return;
    }
    this.setupNotifications.uiUpdateFailed = true;

    getAction$()
      .pipe(
        filter(
          uiAction =>
            uiAction.action === UIActions.Error &&
            uiAction.type === UIActionType.Update
        ),
        map(uiAction => {
          let notification: ToastNotification;
          const title = this._i18n._(i18nMark("UI Upgrade Failure"));
          const description = this._i18n._(
            i18nMark("The UI upgrade has failed due to an error.")
          );
          const primaryActionText = this._i18n._(i18nMark("Try Again"));
          if (uiAction.value.data !== undefined) {
            const upgradeVersion: string = uiAction.value.data;
            const tryAgainCallback = (
              callbackType: ToastCallbackType,
              toastNotification: ToastNotification
            ) => {
              this.updateFailedCallback(
                callbackType,
                toastNotification,
                upgradeVersion
              );
            };
            notification = new ToastNotification(title, {
              appearance: ToastAppearance.Danger,
              callback: tryAgainCallback,
              description,
              primaryActionText
            });
          } else {
            notification = new ToastNotification(title, {
              appearance: ToastAppearance.Danger,
              description,
              callback: this.dismissNotificationCallback
            });
          }
          return notification;
        }),
        filter(
          toastNotification =>
            !this._activeNotifications.includes(toastNotification.id)
        ),
        tap(toastNotification =>
          this._activeNotifications.push(toastNotification.id)
        )
      )
      .subscribe(this._notificationService.push);
  }
  public setupRollbackFailedNotification() {
    if (this.setupNotifications.uiRollbackFailed) {
      return;
    }
    this.setupNotifications.uiRollbackFailed = true;

    getAction$()
      .pipe(
        filter(
          uiAction =>
            uiAction.action === UIActions.Error &&
            uiAction.type === UIActionType.Reset
        ),
        map(() => {
          const title = this._i18n._(i18nMark("UI Rollback Failure"));
          const description = this._i18n._(
            i18nMark("The UI rollback has failed due to an error.")
          );
          const primaryActionText = this._i18n._(i18nMark("Try Again"));
          return new ToastNotification(title, {
            appearance: ToastAppearance.Danger,
            callback: this.rollbackFailedCallback,
            description,
            primaryActionText
          });
        }),
        filter(
          toastNotification =>
            !this._activeNotifications.includes(toastNotification.id)
        ),
        tap(toastNotification =>
          this._activeNotifications.push(toastNotification.id)
        )
      )
      .subscribe(this._notificationService.push);
  }
  public _clear() {
    // This is a helper to clear the current state of this instance for unit tests
    if (this._activeNotifications.length > 0) {
      this._activeNotifications.splice(0, this._activeNotifications.length);
    }
    this.setupNotifications = {
      uiUpdated: false,
      uiUpdateFailed: false,
      uiRollbackFailed: false
    };
  }

  private removeActiveNotification(id: string) {
    const notificationIndex = this._activeNotifications.indexOf(id);
    if (notificationIndex !== -1) {
      this._activeNotifications.splice(notificationIndex, 1);
    }
  }

  private updateAvailableCallback(
    callbackType: ToastCallbackType,
    toastNotification: ToastNotification
  ) {
    this.removeActiveNotification(toastNotification.id);
    switch (callbackType) {
      case "primary":
        // Reload the UI
        location.reload();
        break;
    }
  }

  private dismissNotificationCallback(
    _callbackType: ToastCallbackType,
    toastNotification: ToastNotification
  ) {
    this.removeActiveNotification(toastNotification.id);
  }
  private rollbackFailedCallback(
    callbackType: ToastCallbackType,
    toastNotification: ToastNotification
  ) {
    this.removeActiveNotification(toastNotification.id);
    switch (callbackType) {
      case "primary":
        // Retry rollback
        rollbackUI();
        break;
    }
  }
  private updateFailedCallback(
    callbackType: ToastCallbackType,
    toastNotification: ToastNotification,
    updateVersion: string
  ) {
    this.removeActiveNotification(toastNotification.id);
    switch (callbackType) {
      case "primary":
        // Retry update
        updateUI(updateVersion);
        break;
    }
  }
}

function loadNotifications(container: Container) {
  container
    .bind<UIUpdateNotifications>(UIUpdateNotificationsType)
    .to(Notifications);
}

export {
  Notifications,
  UIUpdateNotifications,
  UIUpdateNotificationsType,
  loadNotifications
};
