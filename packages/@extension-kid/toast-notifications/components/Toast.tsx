import * as React from "react";
import { Toast } from "@dcos/ui-kit";
import { ToastProps } from "@dcos/ui-kit/dist/packages/toaster/components/Toast";

import { ToastNotification } from "../ToastNotification";
import ToastExtension from "../ToastExtension";

export default (
  toastNotification: ToastNotification,
  extension: ToastExtension,
  primaryActionClassName: string | undefined,
  secondaryActionClassName: string | undefined
): JSX.Element => {
  const { id, title, description } = toastNotification;
  const toastProps: ToastProps = {
    id,
    title,
    description,
    appearance: toastNotification.appearance,
    autodismiss: toastNotification.autodismiss
  };
  toastProps.onDismiss = () => {
    extension.dismissToast(toastNotification.id);
  };
  if (toastNotification.primaryActionText) {
    const handlePrimaryClick = () => {
      extension.toastPrimaryAction(toastNotification.id);
    };
    toastProps.primaryAction = (
      <button className={primaryActionClassName} onClick={handlePrimaryClick}>
        {toastNotification.primaryActionText}
      </button>
    );
  }
  if (toastNotification.secondaryActionText) {
    const handleSecondaryClick = () => {
      extension.toastSecondaryAction(toastNotification.id);
    };
    toastProps.primaryAction = (
      <button
        className={secondaryActionClassName}
        onClick={handleSecondaryClick}
      >
        {toastNotification.primaryActionText}
      </button>
    );
  }
  return <Toast key={toastNotification.id} {...toastProps} />;
};
