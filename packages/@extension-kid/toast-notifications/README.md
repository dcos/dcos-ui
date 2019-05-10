# Toast Notification Extension

This package defines the `ToastExtension` & `ToastNotificaton` classes to be used in conjunction with the component provided by `makeToastContainer` to display Toasts using `@dcos/ui-kit` `Toaster` & `Toast` components.

## Usage example

```typescript
// Setup
import "reflect-metadata"; // Needed for inversify
import { Container } from "@extension-kid/core";

import notificationServiceFactory from "@extension-kid/notification-service";
import toastsExtensionFactory from "@extension-kid/toast-notifications";

const container = new Container();
container.load(notificationServiceFactory());
container.load(toastsExtensionFactory());

// Component creation & usage
import { makeToastContainer } from "@extension-kid/toast-notifications";

const ToastContainer = makeToastContainer(container);
const render = () => {
  return (
    <ToastContainer
      className="container-class"
      primaryActionClassName="primary-action-class"
      secondaryActionClassName="secondary-action-class"
    />
  );
};

// ToastNotification creation
import { NotificationService, NotificationServiceType } from "@extension-kid/notification-service";
import { ToastNotification, ToastAppearance, ToastCallbackType } from "@extension-kid/toast-notifications";

const notificationService = container.get<NotificationService>(NotificationServiceType);
const toastCallback = (callbackType: ToastCallbackType, toast: ToastNotification) => {
  //Do Something when toast is dismissed or action executed
};
const toastNotification = new ToastNotification(
  "My toast title", // Title
  {
    appearance: ToastAppearance.Success, // Appearance (defaults to ToastAppearance.Default)
    autodismiss: true, // Auto dismiss notification (defaults to false)
    callback: toastCallback, // ToastCallback
    description: "This is a great description", // Description
    primaryActionText: "Main Action", // Primary Action Text
    secondaryActionText: "other action", // Secondary Action Text
  }
);

notificationService.push(toastNotification);
``` 
