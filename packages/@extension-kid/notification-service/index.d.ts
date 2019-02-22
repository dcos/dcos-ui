import { ContainerModule } from "inversify";
import {
  default as NotificationService,
  NotificationServiceExtensionInterface
} from "./NotificationService";
import { Notification } from "./Notification";

export function getExtensionModule<T>(extension: {
  new (...args: any[]): T;
}): ContainerModule;
export default function(_context: object = {}): ContainerModule;
export const NotificationServiceExtensionType: symbol;
export const NotificationServiceType: symbol;
export {
  NotificationServiceExtensionInterface,
  NotificationService,
  Notification
};
