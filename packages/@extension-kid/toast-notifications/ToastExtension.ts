import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";

import {
  Notification,
  NotificationServiceExtensionInterface,
} from "../notification-service";
import { ToastNotification } from "./ToastNotification";

@injectable()
class ToastExtension implements NotificationServiceExtensionInterface {
  public id = ToastNotification.NotificationType;
  public readonly Toast$: BehaviorSubject<ToastNotification[]>;
  private toasts: ToastNotification[] = [];

  constructor() {
    const toasts: ToastNotification[] = [];
    this.Toast$ = new BehaviorSubject<ToastNotification[]>(toasts);
    this.Toast$.subscribe((toasts) => (this.toasts = toasts));

    this.supportedNotifications = this.supportedNotifications.bind(this);
    this.push = this.push.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
    this.toastPrimaryAction = this.toastPrimaryAction.bind(this);
    this.toastSecondaryAction = this.toastSecondaryAction.bind(this);
    this.removeToast = this.removeToast.bind(this);
  }

  public supportedNotifications() {
    return [ToastNotification.NotificationType];
  }

  public push(notification: Notification) {
    const toast = notification as ToastNotification;

    this.Toast$.next(this.toasts.concat(toast));
  }

  public dismissToast(toastId: string) {
    const toast = this.removeToast(toastId);
    if (toast !== null) {
      toast.dismiss();
    }
  }

  public toastPrimaryAction(toastId: string) {
    const toast = this.removeToast(toastId);
    if (toast !== null) {
      toast.primaryAction();
    }
  }

  public toastSecondaryAction(toastId: string) {
    const toast = this.removeToast(toastId);
    if (toast !== null) {
      toast.secondaryAction();
    }
  }

  private removeToast(toastId: string): ToastNotification | null {
    const toast = this.toasts.find((toast) => toast.id === toastId);
    if (toast) {
      this.Toast$.next(this.toasts.filter((toast) => toast.id !== toastId));
      return toast;
    }
    return null;
  }
}

export default ToastExtension;
