import { getExtensionModule } from "@extension-kid/notification-service";
import ToastExtension from "./ToastExtension";
import { makeToastContainer } from "./components/ToastContainer";
import {
  ToastNotification,
  ToastAppearance,
  ToastCallbackType,
} from "./ToastNotification";

const bindExtension = (_context = {}) => getExtensionModule(ToastExtension);
export {
  bindExtension as default,
  makeToastContainer,
  ToastCallbackType,
  ToastNotification,
  ToastAppearance,
};
