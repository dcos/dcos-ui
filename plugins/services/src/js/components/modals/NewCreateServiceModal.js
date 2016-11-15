import React, {Component, PropTypes} from 'react';

import FullScreenModal from '../../../../../../src/js/components/modals/FullScreenModal';
import FullScreenModalHeader from '../../../../../../src/js/components/modals/FullScreenModalHeader';
import FullScreenModalHeaderActions from '../../../../../../src/js/components/modals/FullScreenModalHeaderActions';
import FullScreenModalHeaderTitle from '../../../../../../src/js/components/modals/FullScreenModalHeaderTitle';
import NewCreateServiceModalServicePicker from './NewCreateServiceModalServicePicker';
import NewCreateServiceModalForm from './NewCreateServiceModalForm';
import Service from '../../structs/Service';
import ServiceConfigDisplay from '../../service-configuration/ServiceConfigDisplay';
import ToggleButton from '../../../../../../src/js/components/ToggleButton';
import Util from '../../../../../../src/js/utils/Util';

const METHODS_TO_BIND = [
  'handleGoBack',
  'handleClose',
  'handleJSONToggle',
  'handleServiceSelection',
  'handleServiceReview',
  'handleServiceRun'
];

class NewServiceFormModal extends Component {
  constructor() {
    super(...arguments);

    this.state = this.getResetState();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;
    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.handleClose();
    }
  }

  handleGoBack() {
    let {
      serviceFormActive,
      servicePickerActive,
      serviceReviewConfig
    } = this.state;

    // Close if picker is open, or if editing a service in the form
    if (servicePickerActive || (serviceFormActive && this.props.isEdit)) {
      this.handleClose();
      return;
    }

    if (serviceFormActive) {
      this.setState({
        servicePickerActive: true,
        serviceFormActive: false,
        serviceReviewConfig: null
      });
      return;
    }

    if (serviceReviewConfig) {
      this.setState({
        servicePickerActive: false,
        serviceFormActive: true,
        serviceReviewConfig: null
      });
    }
  }

  handleClose() {
    this.props.onClose();
    this.setState(this.getResetState());
  }

  handleJSONToggle() {
    this.setState({isJSONModeActive: !this.state.isJSONModeActive});
  }

  getResetState(nextProps = this.props) {
    let newState = {
      isJSONModeActive: false,
      serviceFormActive: false,
      servicePickerActive: true,
      serviceReviewConfig: null
    };

    // Switch directly to form if edit
    if (nextProps.isEdit) {
      newState.servicePickerActive = false;
      newState.serviceFormActive = true;
    }

    return newState;
  }

  handleServiceSelection() {
    this.setState({
      servicePickerActive: false,
      serviceFormActive: true,
      serviceReviewConfig: null
    });
  }

  handleServiceReview() {
    this.setState({
      servicePickerActive: false,
      serviceFormActive: false,
      serviceReviewConfig: this.serviceModalForm.getAppConfig()
    });
  }

  handleServiceRun() {
    let {marathonAction, service} = this.props;
    marathonAction(
      service,
      this.state.serviceReviewConfig
    );
  }

  getHeader() {
    if (this.state.serviceReviewConfig) {
      return (
        <FullScreenModalHeader>
          <FullScreenModalHeaderActions
            actions={this.getSecondaryActions()}
            type="secondary" />
          <FullScreenModalHeaderTitle>
            Review & Run Service
          </FullScreenModalHeaderTitle>
          <FullScreenModalHeaderActions
            actions={this.getPrimaryActions()}
            type="primary" />
        </FullScreenModalHeader>
      );
    }

    let title = 'Run a Service';
    let {isEdit, service} = this.props;
    let serviceName = service.getName();
    if (serviceName) {
      serviceName = `"${serviceName}"`;
    } else {
      serviceName = 'Service';
    }

    if (isEdit) {
      title = `Edit ${serviceName}`;
    }

    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={this.getSecondaryActions()}
          type="secondary" />
        <FullScreenModalHeaderTitle>
          {title}
        </FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={this.getPrimaryActions()}
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

    if (this.state.serviceReviewConfig) {
      return (
        <ServiceConfigDisplay appConfig={this.state.serviceReviewConfig} />
      );
    }

    return (
      <NewCreateServiceModalForm
        isJSONModeActive={this.state.isJSONModeActive}
        service={this.props.service}
        ref={(ref) => { this.serviceModalForm = ref; }} />
    );
  }

  getPrimaryActions() {
    let {
      serviceFormActive,
      servicePickerActive,
      serviceReviewConfig
    } = this.state;

    if (servicePickerActive) {
      return null;
    }

    if (serviceFormActive) {
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
          clickHandler: this.handleServiceReview,
          label: 'Review & Run'
        }
      ];
    }

    if (serviceReviewConfig) {
      return [
        {
          className: 'button-primary flush-vertical',
          clickHandler: this.handleServiceRun,
          label: 'Run Service'
        }
      ];
    }
  }

  getSecondaryActions() {
    let {servicePickerActive, serviceFormActive} = this.state;
    let label = 'Back';
    if (servicePickerActive || (serviceFormActive && this.props.isEdit)) {
      label = 'Cancel';
    }

    return [
      {
        className: 'button-stroke',
        clickHandler: this.handleGoBack,
        label
      }
    ];
  }

  render() {
    let {props} = this;

    return (
      <FullScreenModal
        header={this.getHeader()}
        onClose={this.handleClose}
        {...Util.omit(props, Object.keys(NewServiceFormModal.propTypes))}>
        {this.getModalContent()}
      </FullScreenModal>
    );
  }
}

NewServiceFormModal.propTypes = {
  errors: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  isEdit: PropTypes.bool,
  isPending: PropTypes.bool.isRequired,
  marathonAction: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  service: PropTypes.instanceOf(Service).isRequired
};

module.exports = NewServiceFormModal;
