import { Notification } from "@extension-kid/notification-service";

enum ToastAppearance {
  Default = "default",
  Success = "success",
  Warning = "warning",
  Danger = "danger"
}

enum ToastCallbackType {
  Dismiss,
  Primary,
  Secondary
}

type ToastCallback = (
  callbackType: ToastCallbackType,
  notification: ToastNotification
) => void;

class ToastNotification extends Notification {
  static NotificationType = Symbol("Toast");
  readonly title: string;
  readonly description: string;
  readonly appearance: ToastAppearance;
  readonly autodismiss: boolean;
  readonly callback: ToastCallback | null;
  readonly primaryActionText: string;
  readonly secondaryActionText: string;

  constructor(
    title: string,
    description: string = "",
    callback: ToastCallback | null = null,
    appearance: ToastAppearance = ToastAppearance.Default,
    primaryActionText: string = "",
    secondaryActionText: string = "",
    autodismiss: boolean = false
  ) {
    super(ToastNotification.NotificationType, `${title}|${description}`);
    this.title = title;
    this.description = description || "";
    this.appearance = appearance;
    this.autodismiss = autodismiss;
    this.callback = callback;
    this.primaryActionText = primaryActionText;
    this.secondaryActionText = secondaryActionText;

    this.dismiss = this.dismiss.bind(this);
    this.primaryAction = this.primaryAction.bind(this);
    this.secondaryAction = this.secondaryAction.bind(this);
  }

  dismiss() {
    if (this.callback === null) {
      return;
    }

    this.callback(ToastCallbackType.Dismiss, this);
  }

  primaryAction() {
    if (this.callback === null) {
      return;
    }

    this.callback(ToastCallbackType.Primary, this);
  }

  secondaryAction() {
    if (this.callback === null) {
      return;
    }

    this.callback(ToastCallbackType.Secondary, this);
  }
}

export { ToastNotification, ToastAppearance, ToastCallbackType };
