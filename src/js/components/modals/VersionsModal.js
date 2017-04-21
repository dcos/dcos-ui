import { Modal } from "reactjs-components";
import React from "react";

import ClickToSelect from "../ClickToSelect";
import Config from "../../config/Config";
import ModalHeading from "../modals/ModalHeading";

var VersionsModal = React.createClass({
  displayName: "VersionsModal",

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    versionDump: React.PropTypes.object.isRequired
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
        {Config.productName} Info
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
        <ClickToSelect>
          {this.getContent()}
        </ClickToSelect>
      </Modal>
    );
  }
});

module.exports = VersionsModal;
