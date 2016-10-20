import React from 'react';

import FullScreenModal from '../../../../../../src/js/components/modals/FullScreenModal';
import FullScreenModalHeader from '../../../../../../src/js/components/modals/FullScreenModalHeader';
import FullScreenModalHeaderActions from '../../../../../../src/js/components/modals/FullScreenModalHeaderActions';
import FullScreenModalHeaderTitle from '../../../../../../src/js/components/modals/FullScreenModalHeaderTitle';
import NewCreateServiceModalServicePicker from './NewCreateServiceModalServicePicker';
import NewCreateServiceModalForm from './NewCreateServiceModalForm';
import ToggleButton from '../../../../../../src/js/components/ToggleButton';
import Util from '../../../../../../src/js/utils/Util';

const METHODS_TO_BIND = ['handleJSONToggle', 'handleServiceSelection'];

class NewServiceFormModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      isJSONModeActive: false,
      servicePickerActive: true,
      serviceFormActive: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleJSONToggle() {
    this.setState({isJSONModeActive: !this.state.isJSONModeActive});
  }

  handleServiceSelection() {
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

    return (
      <NewCreateServiceModalForm
        isJSONModeActive={this.state.isJSONModeActive} />
    );
  }

  getPrimaryActions() {
    if (this.state.servicePickerActive) {
      return null;
    }

    return [
      {
        node: (
          <ToggleButton
            className="flush"
            checkboxClassName="toggle-button"
            checked={this.state.isJSONModeActive}
            onChange={this.handleJSONToggle}
            key="json-editor">
            JSON Editor
          </ToggleButton>
        )
      },
      {
        className: 'button-primary flush-vertical',
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
