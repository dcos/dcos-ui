import { I18n } from "@lingui/core";
import { i18nMark } from "@lingui/react";

import { TYPES } from "#SRC/js/types/containerTypes";

import {
  ToastNotification,
  ToastAppearance,
} from "@extension-kid/toast-notifications";

import container from "#SRC/js/container";
import {
  NotificationService,
  NotificationServiceType,
} from "@extension-kid/notification-service";

const notificationService = container.get<NotificationService>(
  NotificationServiceType
);

const i18n = container.get<I18n>(TYPES.I18n);

const defaultNetworkErrorHandler = ({
  message,
  code,
}: {
  message: string;
  code: number;
}) => {
  notificationService.push(
    new ToastNotification(i18n._(i18nMark("Cannot Reactivate Node")), {
      appearance: ToastAppearance.Danger,
      autodismiss: true,
      description:
        code === 0
          ? i18n._(i18nMark("Network is offline"))
          : i18n._(
              i18nMark(
                "Unable to complete request. Please try again. The error returned was {code} {message}"
              ),
              { code, message }
            ),
    })
  );
};

export { defaultNetworkErrorHandler };
