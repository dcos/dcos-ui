import React from 'react';

import {Modal} from 'reactjs-components';

var ErrorModal = React.createClass({

  displayName: 'ErrorModal',

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    errorMsg: React.PropTypes.element
  },

  onClose() {
    this.props.onClose();
  },

  render() {
    let header = (
      <h5 className="modal-header-title text-align-center flush-top flush-bottom">
        Looks Like Something is Wrong
      </h5>
    );

    return (
      <Modal
        modalClass="modal"
        onClose={this.onClose}
        open={this.props.open}
        showHeader={true}
        header={header}>
        {this.props.errorMsg}
      </Modal>
    );
  }
});

module.exports = ErrorModal;
