import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";

import { Modal } from "reactjs-components";

import ModalHeading from "../modals/ModalHeading";

var ErrorModal = React.createClass({
  displayName: "ErrorModal",

  propTypes: {
    onClose: PropTypes.func.isRequired,
    errorMsg: PropTypes.element
  },

  onClose() {
    this.props.onClose();
  },

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
});

module.exports = ErrorModal;
