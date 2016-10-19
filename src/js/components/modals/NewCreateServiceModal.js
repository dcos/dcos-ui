import React from 'react';

import FullScreenModal from './FullScreenModal';
import FullScreenModalHeader from './FullScreenModalHeader';
import FullScreenModalHeaderActions from './FullScreenModalHeaderActions';
import FullScreenModalHeaderTitle from './FullScreenModalHeaderTitle';
import NewCreateServiceModalServicePicker from './NewCreateServiceModalServicePicker';
import NewCreateServiceModalForm from './NewCreateServiceModalForm';
import Util from '../../utils/Util';

const METHODS_TO_BIND = ['handleServiceSelection'];

class NewServiceFormModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      servicePickerActive: true,
      serviceFormActive: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleServiceSelection(service) {
    console.log(service);
    this.setState({
      servicePickerActive: false,
      serviceFormActive: true
    });
  }

  getHeader() {
    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions actions={this.getSecondaryActions()}
          type="secondary" />
        <FullScreenModalHeaderTitle>
          Run a Service
        </FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions actions={this.getPrimaryActions()}
          type="primary" />
      </FullScreenModalHeader>
    );
  }

  getModalContent() {
    if (this.state.servicePickerActive) {
      return (
        <NewCreateServiceModalServicePicker
          onServiceSelect={this.handleServiceSelection} />
      );
    }

    return <NewCreateServiceModalForm />;
  }

  getPrimaryActions() {
    if (this.state.servicePickerActive) {
      return null;
    }

    return [
      {
        className: 'button-primary',
        clickHandler: () => console.log('Review...'),
        label: 'Review & Run'
      }
    ];
  }

  getSecondaryActions() {
    if (this.state.servicePickerActive) {
      return [
        {
          className: 'button-stroke',
          clickHandler: () => this.props.onClose(),
          label: 'Cancel'
        }
      ];
    }

    return [
      {
        className: 'button-stroke',
        clickHandler: () => {
          this.setState({servicePickerActive: true, serviceFormActive: false});
        },
        label: 'Back'
      }
    ];
  }

  render() {
    let {props} = this;

    return (
      <FullScreenModal
        header={this.getHeader()}
        title="Run a Service"
        {...Util.omit(props, Object.keys(NewServiceFormModal.propTypes))}>
        {this.getModalContent()}
      </FullScreenModal>
    );
  }
}

NewServiceFormModal.propTypes = {
  children: React.PropTypes.node
};

module.exports = NewServiceFormModal;
