var React = require('react');

import {Modal} from 'reactjs-components';

var ErrorModal = React.createClass({

  displayName: 'ErrorModal',

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    errorMsg: React.PropTypes.element
  },

  onClose: function () {
    this.props.onClose();
  },

  render: function () {
    return (
      <Modal
        maxHeightPercentage={0.9}
        modalClass="modal"
        onClose={this.onClose}
        open={this.props.open}
        showCloseButton={false}
        showHeader={true}
        showFooter={false}
        subHeader=""
        titleClass="modal-header-title text-align-center flush-top flush-bottom"
        titleText="Looks Like Something is Wrong">
        {this.props.errorMsg}
      </Modal>
    );
  }
});

module.exports = ErrorModal;
