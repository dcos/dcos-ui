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

interface ToastNotificationOptions {
  appearance?: ToastAppearance;
  autodismiss?: boolean;
  description?: string;
  callback?: ToastCallback;
  primaryActionText?: string;
  secondaryActionText?: string;
}

class ToastNotification extends Notification {
  static NotificationType = Symbol("Toast");
  readonly title: string;
  readonly description: string;
  readonly appearance: ToastAppearance;
  readonly autodismiss: boolean;
  readonly callback: ToastCallback | undefined;
  readonly primaryActionText: string | undefined;
  readonly secondaryActionText: string | undefined;

  constructor(title: string, options: ToastNotificationOptions = {}) {
    const description = options.description || "";
    super(ToastNotification.NotificationType, `${title}|${description}`);
    this.title = title;
    this.description = description;
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
