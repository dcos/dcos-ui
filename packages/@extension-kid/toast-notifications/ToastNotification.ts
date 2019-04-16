import { Notification } from "@extension-kid/notification-service";

enum ToastAppearance {
  Default = "default",
  Success = "success",
  Warning = "warning",
  Danger = "danger"
}

enum ToastCallbackType {
  Dismiss = "dismiss",
  Primary = "primary",
  Secondary = "secondary"
}

type ToastCallback = (
  callbackType: ToastCallbackType,
  notification: ToastNotification
) => void;

function messageForId(title: string, description?: string) {
  return `${title}|${description || ""}`;
}

interface ToastNotificationOptions {
  appearance?: ToastAppearance;
  autodismiss?: boolean;
  description?: string;
  callback?: ToastCallback;
  primaryActionText?: string;
  secondaryActionText?: string;
}

class ToastNotification extends Notification {
  static NotificationType = Symbol.for("Toast");

  readonly appearance: ToastAppearance;
  readonly autodismiss: boolean;
  readonly callback?: ToastCallback;
  readonly description?: string;
  readonly primaryActionText?: string;
  readonly secondaryActionText?: string;
  readonly title: string;

  constructor(title: string, options: ToastNotificationOptions = {}) {
    super(
      ToastNotification.NotificationType,
      messageForId(title, options.description)
    );
    this.title = title;
    this.description = options.description;
    this.appearance = options.appearance || ToastAppearance.Default;
    this.autodismiss = options.autodismiss || false;
    this.callback = options.callback;
    this.primaryActionText = options.primaryActionText;
    this.secondaryActionText = options.secondaryActionText;

    this.dismiss = this.dismiss.bind(this);
    this.primaryAction = this.primaryAction.bind(this);
    this.secondaryAction = this.secondaryAction.bind(this);
  }

  dismiss() {
    if (!this.callback) {
      return;
    }
    // Don't let a notifier exception crash the ToastExtension/ToastContainer
    try {
      this.callback(ToastCallbackType.Dismiss, this);
    } catch {}
  }

  primaryAction() {
    if (!this.callback) {
      return;
    }

    // Don't let a notifier exception crash the ToastExtension/ToastContainer
    try {
      this.callback(ToastCallbackType.Primary, this);
    } catch {}
  }

  secondaryAction() {
    if (!this.callback) {
      return;
    }

    // Don't let a notifier exception crash the ToastExtension/ToastContainer
    try {
      this.callback(ToastCallbackType.Secondary, this);
    } catch {}
  }
}

export {
  ToastNotification,
  ToastNotificationOptions,
  ToastAppearance,
  ToastCallbackType
};
