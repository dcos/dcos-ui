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

## i18n

`@lingui/react` is used for translating text inside of toasts. The all text strings for the toast, `title` `description` `primaryActionText` `secondaryActionText` can be set to either a `string` or an object with a message `id` and `values` to be used for translation.

```typescript
const toastNotification = new ToastNotification(
  "My Title",
  {
    description: {
      id: "My template with a {variable}!",
      values: {
        variable: "My runtime variable value"
      }
    }
  }
);
```

All static strings or templates used as an `id` should be marked using `i18nMark` from `@lingui/react`

```typescript
import { i18nMark } from "@lingui/react";

const title = i18nMark("My Title");
const description = i18nMark("My template with a {variable}!");
const toastNotification = new ToastNotification(
  title,
  {
    description: {
      id: description,
      values: {
        variable: "My runtime variable value"
      }
    }
  }
);
```
