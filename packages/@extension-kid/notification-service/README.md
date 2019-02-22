# Notification Service

The notification service is an extension that can be used to `push` notifications from anywhere in the application. The notification service should be loaded into your `Container` and can then be retrieved as needed.

## Example

```javascript
// loading
import notificationServiceContainerModuleFactory from "@extension-kid/notification-service";
container.load(notificationServiceContainerModuleFactory());

...

// usage
import { 
  Notification, 
  NotificationService, 
  NotificationServiceType
} from "@extension-kid/notification-service";

const ns = container.get<NotificationService>(NotificationServiceType);
ns.push(new Notification(Symbol("my notification type"), "My notification"));
```
There should be a corresponding extension loaded to handle the notification type pushed through the notification service.

Notification service extensions must implement the `NotificationServiceExtensionInterface` defined in `NotificationService.ts`
