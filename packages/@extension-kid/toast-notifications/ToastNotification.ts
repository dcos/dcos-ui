import { Notification } from "@extension-kid/notification-service";

enum ToastAppearance {
  Default = "default",
  Success = "success",
  Warning = "warning",
  Danger = "danger",
}

enum ToastCallbackType {
  Dismiss = "dismiss",
  Primary = "primary",
  Secondary = "secondary",
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
  public static NotificationType = Symbol.for("Toast");

  public readonly appearance: ToastAppearance;
  public readonly autodismiss: boolean;
  public readonly callback?: ToastCallback;
  public readonly description?: string;
  public readonly primaryActionText?: string;
  public readonly secondaryActionText?: string;
  public readonly title: string;

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

  public dismiss() {
    if (!this.callback) {
      return;
    }
    try {
      this.callback(ToastCallbackType.Dismiss, this);
    } catch {
      // Don't let a notifier exception crash the ToastExtension/ToastContainer
    }
  }

  public primaryAction() {
    if (!this.callback) {
      return;
    }

    try {
      this.callback(ToastCallbackType.Primary, this);
    } catch {
      // Don't let a notifier exception crash the ToastExtension/ToastContainer
    }
  }

  public secondaryAction() {
    if (!this.callback) {
      return;
    }

    try {
      this.callback(ToastCallbackType.Secondary, this);
    } catch {
      // Don't let a notifier exception crash the ToastExtension/ToastContainer
    }
  }
}

export {
  ToastNotification,
  ToastNotificationOptions,
  ToastAppearance,
  ToastCallbackType,
};
