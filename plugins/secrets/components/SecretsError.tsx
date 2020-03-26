import { i18nMark } from "@lingui/react";
import * as React from "react";
import PropTypes from "prop-types";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import Page from "#SRC/js/components/Page";

import SecretFormModal from "./SecretFormModal";

function SecretError({
  type,
  open,
  closeModal,
  openModal,
  breadcrumbs,
  permissionErrorMessage,
}) {
  const errorMessage =
    type === "permission" ? permissionErrorMessage : <RequestErrorMsg />;

  return (
    <Page>
      <Page.Header
        breadcrumbs={breadcrumbs}
        addButton={{
          onItemSelect: openModal,
          label: i18nMark("New Secret"),
        }}
      />
      {errorMessage}
      <SecretFormModal onClose={closeModal} open={open} />
    </Page>
  );
}

SecretError.defaultProps = {
  open: false,
  closeModal: () => {},
  openModal: () => {},
  permissionErrorMessage: <RequestErrorMsg />,
};

SecretError.propTypes = {
  type: PropTypes.string,
  open: PropTypes.bool,
  closeModal: PropTypes.func,
  openModal: PropTypes.func,
  breadcrumbs: PropTypes.element,
  permissionErrorMessage: PropTypes.element,
};

export default SecretError;
