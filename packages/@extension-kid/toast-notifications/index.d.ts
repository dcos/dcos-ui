import { Container, ContainerModule } from "inversify";
import { ComponentType } from "react";

import { ToastContainerProps } from "./components/ToastContainer";
import {
  ToastAppearance,
  ToastCallback,
  ToastCallbackType,
  ToastNotification
} from "./ToastNotification";

function makeToastContainer(
  container: Container
): ComponentType<ToastContainerProps>;
function bindExtension(_context: object = {}): ContainerModule;

export {
  bindExtension as default,
  makeToastContainer,
  ToastAppearance,
  ToastCallback,
  ToastCallbackType,
  ToastContainerProps,
  ToastNotification
};
