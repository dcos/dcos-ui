import { Trans } from "@lingui/macro";
import { Modal } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";

import ClickToSelect from "../ClickToSelect";
import Config from "../../config/Config";
import ModalHeading from "../modals/ModalHeading";

var VersionsModal = createReactClass({
  displayName: "VersionsModal",

  propTypes: {
    onClose: PropTypes.func.isRequired,
    versionDump: PropTypes.object.isRequired
  },

  onClose() {
    this.props.onClose();
  },

  getContent() {
    var string = JSON.stringify(this.props.versionDump, null, 2);

    return <pre className="flush-bottom">{string}</pre>;
  },

  render() {
    const header = (
      <ModalHeading>
        <Trans render="span">{Config.productName} Info</Trans>
      </ModalHeading>
    );

    return (
      <Modal
        onClose={this.onClose}
        open={this.props.open}
        showHeader={true}
        header={header}
        size="large"
      >
        <ClickToSelect>{this.getContent()}</ClickToSelect>
      </Modal>
    );
  }
});

module.exports = VersionsModal;
