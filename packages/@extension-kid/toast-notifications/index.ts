import { getExtensionModule } from "@extension-kid/notification-service";
import ToastExtension from "./ToastExtension";
import { makeToastContainer } from "./components/ToastContainer";
import {
  ToastNotification,
  ToastAppearance,
  ToastCallbackType,
} from "./ToastNotification";

function bindExtension(_context = {}) {
  return getExtensionModule(ToastExtension);
}

export {
  bindExtension as default,
  makeToastContainer,
  ToastCallbackType,
  ToastNotification,
  ToastAppearance,
};
