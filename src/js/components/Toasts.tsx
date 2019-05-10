import * as React from "react";
import { makeToastContainer } from "@extension-kid/toast-notifications";

import container from "../container";

export default () => {
  const ToastContainer = makeToastContainer(container);
  return (
    <ToastContainer
      className="toasts-container"
      primaryActionClassName="button button-primary-link"
      secondaryActionClassName="button button-link"
    />
  );
};
