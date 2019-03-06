import { getExtensionModule } from "@extension-kid/notification-service";
import ToastExtension from "./ToastExtension";
import { makeToastContainer } from "./components/ToastContainer";
import { ToastNotification, ToastAppearance } from "./ToastNotification";

function bindExtension(_context = {}) {
  return getExtensionModule(ToastExtension);
}

export {
  bindExtension as default,
  makeToastContainer,
  ToastNotification,
  ToastAppearance
};
