import {Modal} from 'reactjs-components';
import React from 'react';

import ClickToSelect from '../ClickToSelect';
import Config from '../../config/Config';

var VersionsModal = React.createClass({

  displayName: 'VersionsModal',

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    versionDump: React.PropTypes.object.isRequired
  },

  onClose() {
    this.props.onClose();
  },

  getContent() {
    var string = JSON.stringify(this.props.versionDump, null, 2);
    return (
      <div className="versions-modal-content">
        <pre>{string}</pre>
      </div>
    );
  },

  render() {
    let header = (
      <h5 configlassName="modal-header-title text-align-center flush-top flush-bottom">
        {Config.productName} Info
      </h5>
    );

    return (
      <Modal
        onClose={this.onClose}
        open={this.props.open}
        showHeader={true}
        header={header}
        size="large">
        <ClickToSelect>
          {this.getContent()}
        </ClickToSelect>
      </Modal>
    );
  }
});

module.exports = VersionsModal;
