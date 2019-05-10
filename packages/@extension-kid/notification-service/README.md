# Notification Service

The notification service is an extension that can be used to `push` notifications from anywhere in the application. The notification service should be loaded into your `Container` and can then be retrieved as needed.

## Extensions

Notification service extensions must implement the `NotificationServiceExtensionInterface` defined in `NotificationService.ts`

```typescript
import { injectable, inject, named } from "inversify";
import {
  Notification,
  NotificationServiceExtensionInterface
} from "@extension-kid/notification-service";

const DebugSymbol = Symbol("Debug");

class DebugNotification extends Notification {
  constructor(message: string) {
    super(DebugSymbol, message);
  }
}

@injectable()
class DebugNotificationExtension
  implements NotificationServiceExtensionInterface {
  id = DebugSymbol;

  supportedNotifications() {
    return [DebugSymbol];
  }

  push(notification: DebugNotification) {    
    console.log(
      `${notification.timestamp.toISOString()} - DEBUG - ${
        notification.message
      }`
    );
  }
}
```

## Example

```javascript
// loading
import notificationServiceContainerModuleFactory, {getExtensionModule} from "@extension-kid/notification-service";
container.load(notificationServiceContainerModuleFactory());
container.load(getExtensionModule(DebugNotificationExtension));

...

// usage
import { 
  Notification, 
  NotificationService, 
  NotificationServiceType
} from "@extension-kid/notification-service";

const ns = container.get<NotificationService>(NotificationServiceType);
ns.push(new DebugNotification("My debug notification"));
```
There should be a corresponding extension loaded to handle the notification type pushed through the notification service.
