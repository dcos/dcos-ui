var React = require('react');

import {Modal} from 'reactjs-components';

import Config from '../../config/Config';

var VersionsModal = React.createClass({

  displayName: 'VersionsModal',

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    versionDump: React.PropTypes.object.isRequired
  },

  onClose: function () {
    this.props.onClose();
  },

  getContent: function () {
    var string = JSON.stringify(this.props.versionDump, null, 2);
    return (
      <div className="versions-modal-content">
        <pre>{string}</pre>
      </div>
    );
  },

  render: function () {
    return (
      <Modal
        maxHeightPercentage={0.9}
        onClose={this.onClose}
        open={this.props.open}
        showCloseButton={false}
        showHeader={true}
        showFooter={false}
        size="large"
        titleClass="modal-header-title text-align-center flush-top
          flush-bottom"
        titleText={`${Config.productName} Info`}>
        {this.getContent()}
      </Modal>
    );
  }
});

module.exports = VersionsModal;
