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

interface ToastTranslatableText {
  id: string;
  values?: Record<string, string>;
}

function messageForId(
  title: string | ToastTranslatableText,
  description?: string | ToastTranslatableText
) {
  let descValue = "";
  const titleValue = typeof title === "string" ? title : title.id;
  if (description) {
    descValue = typeof description === "string" ? description : description.id;
  }

  return `${titleValue}|${descValue}`;
}

interface ToastNotificationOptions {
  appearance?: ToastAppearance;
  autodismiss?: boolean;
  description?: string | ToastTranslatableText;
  callback?: ToastCallback;
  primaryActionText?: string | ToastTranslatableText;
  secondaryActionText?: string | ToastTranslatableText;
}

class ToastNotification extends Notification {
  static NotificationType = Symbol("Toast");
  readonly title: string | ToastTranslatableText;
  readonly description?: string | ToastTranslatableText;
  readonly appearance: ToastAppearance;
  readonly autodismiss: boolean;
  readonly callback: ToastCallback | undefined;
  readonly primaryActionText?: string | ToastTranslatableText;
  readonly secondaryActionText?: string | ToastTranslatableText;

  constructor(
    title: string | ToastTranslatableText,
    options: ToastNotificationOptions = {}
  ) {
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
  ToastCallbackType,
  ToastTranslatableText
};
