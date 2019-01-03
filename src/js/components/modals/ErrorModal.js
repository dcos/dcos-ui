import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";

import { Modal } from "reactjs-components";

import ModalHeading from "../modals/ModalHeading";

const METHODS_TO_BIND = ["onClose"];

class ErrorModal extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onClose() {
    this.props.onClose();
  }

  render() {
    const header = (
      <ModalHeading>
        <Trans render="span">Looks Like Something is Wrong</Trans>
      </ModalHeading>
    );

    return (
      <Modal
        modalClass="modal"
        onClose={this.onClose}
        open={this.props.open}
        showHeader={true}
        header={header}
      >
        {this.props.errorMsg}
      </Modal>
    );
  }
}

ErrorModal.displayName = "ErrorModal";

ErrorModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  errorMsg: PropTypes.element
};

module.exports = ErrorModal;
