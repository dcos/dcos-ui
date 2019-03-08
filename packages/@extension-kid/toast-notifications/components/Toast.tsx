import * as React from "react";
import { Trans } from "@lingui/macro";
import { Toast } from "@dcos/ui-kit";
import { ToastProps } from "@dcos/ui-kit/dist/packages/toaster/components/Toast";

import { ToastNotification, ToastTranslatableText } from "../ToastNotification";
import ToastExtension from "../ToastExtension";

function makeTextContent(
  value: string | ToastTranslatableText
): React.ReactElement<HTMLElement> {
  if (typeof value === "string") {
    return <Trans id={value} />;
  }
  return <Trans id={value.id} values={value.values} />;
}

export default (
  toastNotification: ToastNotification,
  extension: ToastExtension,
  primaryActionClassName: string | undefined,
  secondaryActionClassName: string | undefined
): JSX.Element => {
  const toastProps: ToastProps = {
    id: toastNotification.id,
    title: makeTextContent(toastNotification.title),
    description: toastNotification.description
      ? makeTextContent(toastNotification.description)
      : undefined,
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
        {makeTextContent(toastNotification.primaryActionText)}
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
        {makeTextContent(toastNotification.secondaryActionText)}
      </button>
    );
  }
  return <Toast key={toastNotification.id} {...toastProps} />;
};
