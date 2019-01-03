import { Trans } from "@lingui/macro";
import { Modal } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";

import ClickToSelect from "../ClickToSelect";
import Config from "../../config/Config";
import ModalHeading from "../modals/ModalHeading";

const METHODS_TO_BIND = ["onClose"];

class VersionsModal extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onClose() {
    this.props.onClose();
  }

  getContent() {
    var string = JSON.stringify(this.props.versionDump, null, 2);

    return <pre className="flush-bottom">{string}</pre>;
  }

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
}

VersionsModal.displayName = "VersionsModal";

VersionsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  versionDump: PropTypes.object.isRequired
};

module.exports = VersionsModal;
