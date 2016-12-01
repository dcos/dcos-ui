import React from 'react';
import {Modal} from 'reactjs-components';

import Icon from '../../../../../../src/js/components/Icon';

class RuntimeErrorModal extends React.Component {
  constructor() {
    super();

    this.state = {
      isOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.errors !== nextProps.errors) {
      this.setState({isOpen: true});
    }
    return false;
  }

  handleClose() {
    this.setState({isOpen: false});
  }

  getMessage() {
    const {errors} = this.props;

    if (!errors) {
      return;
    }

    const details = errors.details.map(function (item, index) {
      const message = item.errors.join(' ');
      if (message === '') {
        return;
      }

      return <div key={index}>{message}</div>;
    });

    return (
      <div>
        <h4>{errors.message}</h4>
        {details}
      </div>
    );
  }

  render() {
    return (
      <Modal
        open={this.state.isOpen}
        modalClass="modal modal-small runtime-error-modal"
        modalWrapperClass="runtime-error-modal-wrapper"
        backdropClass="modal-backdrop">
        <div className="text-align-center">
          <div className="close-button">
            <a
              className="button button-primary-link"
              onClick={() => this.handleClose()}>
              <Icon
                id="close"
                family="medium"
                color="grey"
                size="tiny" />
            </a>
          </div>
          {this.getMessage()}
          <div className="pod pod-shorter-bottom">
            <button
              className="button button-inverse"
              onClick={() => this.handleClose()}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = RuntimeErrorModal;
