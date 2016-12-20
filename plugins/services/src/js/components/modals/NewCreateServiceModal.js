import classNames from 'classnames';
import React, {Component, PropTypes} from 'react';
import {Hooks} from 'PluginSDK';

import Application from '../../structs/Application';
import Pod from '../../structs/Pod';

import {NEW_APP_DEFAULTS} from '../../constants/NewApplicationDefaults';
import {NEW_POD_DEFAULTS} from '../../constants/NewPodDefaults';

import FullScreenModal from '../../../../../../src/js/components/modals/FullScreenModal';
import FullScreenModalHeader from '../../../../../../src/js/components/modals/FullScreenModalHeader';
import FullScreenModalHeaderActions from '../../../../../../src/js/components/modals/FullScreenModalHeaderActions';
import FullScreenModalHeaderTitle from '../../../../../../src/js/components/modals/FullScreenModalHeaderTitle';
import NewCreateServiceModalServicePicker from './NewCreateServiceModalServicePicker';
import NewCreateServiceModalForm from './NewCreateServiceModalForm';
import CreateServiceJsonOnly from './CreateServiceJsonOnly';
import Service from '../../structs/Service';
import ServiceConfigDisplay from '../../service-configuration/ServiceConfigDisplay';
import ServiceUtil from '../../utils/ServiceUtil';
import ToggleButton from '../../../../../../src/js/components/ToggleButton';
import Util from '../../../../../../src/js/utils/Util';
import ContainerServiceFormSection from '../forms/ContainerServiceFormSection';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import GeneralServiceFormSection from '../forms/GeneralServiceFormSection';
import HealthChecksFormSection from '../forms/HealthChecksFormSection';
import NetworkingFormSection from '../forms/NetworkingFormSection';
import VolumesFormSection from '../forms/VolumesFormSection';
import {combineParsers} from '../../../../../../src/js/utils/ParserUtil';
import {combineReducers} from '../../../../../../src/js/utils/ReducerUtil';
import JSONConfigReducers from '../../reducers/JSONConfigReducers';
import JSONParserReducers from '../../reducers/JSONParserReducers';

const METHODS_TO_BIND = [
  'handleGoBack',
  'handleClose',
  'handleJSONToggle',
  'handleServiceChange',
  'handleServiceErrorChange',
  'handleServiceReview',
  'handleServiceRun',
  'handleServiceSelection'
];

class NewServiceFormModal extends Component {
  constructor() {
    super(...arguments);

    this.state = this.getResetState();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;
    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.handleClose();
    }
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    if (!ServiceUtil.isEqual(this.props.service, nextProps.service)) {
      const newState = {serviceConfig: nextProps.service.getSpec()};

      if (nextProps.isEdit) {
        newState.servicePickerActive = false;
        newState.serviceJsonActive = false;
        newState.serviceFormActive = true;

        if (nextProps.service instanceof Pod) {
          newState.serviceJsonActive = true;
          newState.serviceFormActive = false;
        }
      }

      this.setState(newState);
    }
  }

  shouldForceSubmit() {
    const {errors} = this.props;

    if (errors && errors.message) {
      return /force=true/.test(errors.message);
    }

    return false;
  }

  handleGoBack({tabViewID}) {
    const {
      serviceFormActive,
      serviceJsonActive,
      servicePickerActive,
      serviceReviewActive
    } = this.state;

    if (serviceReviewActive) {
      // Just hide review screen. Form or JSON mode will be
      // activated automaticaly depending on their last state
      this.setState({
        serviceReviewActive: false,
        activeTab: tabViewID
      });
      return;
    }

    // Close if picker is open, or if editing a service in the form
    if (servicePickerActive || (!serviceReviewActive && this.props.isEdit)) {
      this.handleClose();
      return;
    }

    if (serviceFormActive) {
      // Switch back from form to picker
      this.setState({
        servicePickerActive: true,
        serviceFormActive: false
      });
      return;
    }

    if (serviceJsonActive) {
      // Switch back from JSON to picker
      this.setState({
        servicePickerActive: true,
        serviceJsonActive: false
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

  handleServiceChange(newService) {
    this.setState({serviceConfig: newService});
  }

  handleServiceErrorChange(hasErrors) {
    this.setState({serviceFormHasErrors: hasErrors});
  }

  handleServiceSelection({type}) {
    switch (type) {

      case 'app':
        this.setState({
          servicePickerActive: false,
          serviceFormActive: true,
          serviceConfig: new Application(
            Object.assign(
              {id: this.props.service.getId()},
              NEW_APP_DEFAULTS
            )
          )
        });
        break;

      case 'pod':
        this.setState({
          servicePickerActive: false,
          serviceJsonActive: true,
          serviceConfig: new Pod(
            Object.assign(
              {id: this.props.service.getId()},
              NEW_POD_DEFAULTS
            )
          )
        });
        break;

      case 'json':
        this.setState({
          servicePickerActive: false,
          serviceJsonActive: true,
          serviceConfig: this.props.service
        });
        break;

    };
  }

  handleServiceReview() {
    if (this.createComponent && this.createComponent.validateCurrentState()) {
      this.handleServiceErrorChange(true);
    } else {
      this.setState({serviceReviewActive: true});
    }
  }

  handleServiceRun() {
    const {marathonAction, service} = this.props;
    marathonAction(
      service,
      this.state.serviceConfig,
      this.shouldForceSubmit()
    );
  }

  getHeader() {

    // NOTE: Always prioritize review screen check
    if (this.state.serviceReviewActive) {
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
    const {isEdit, service} = this.props;
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
    let errorsMap = new Map();
    if (this.props.errors) {
      let message = this.props.errors.message;

      if (this.shouldForceSubmit()) {
        message = `App is currently locked by one or more deployments.
         Press the button again to forcefully change and deploy the
         new configuration.`;
      }
      errorsMap.set('/', [message]);

      if (this.props.errors.details) {
        this.props.errors.details.forEach(function ({errors, path}) {
          const existingMessages = errorsMap.get(path);

          let messages = errors;

          if (existingMessages) {
            messages = messages.concat(existingMessages);
          }

          errorsMap.set(path, messages);
        });
      }
    }

    // NOTE: Always prioritize review screen check
    if (this.state.serviceReviewActive) {
      return (
        <div className="flex-item-grow-1">
          <div className="container">
            <ServiceConfigDisplay
              onEditClick={this.handleGoBack}
              appConfig={this.state.serviceConfig}
              clearError={this.props.clearError}
              errors={errorsMap} />
          </div>
        </div>
      );
    }

    if (this.state.servicePickerActive) {
      return (
        <NewCreateServiceModalServicePicker
          onServiceSelect={this.handleServiceSelection} />
      );
    }

    if (this.state.serviceFormActive) {
      const SECTIONS = [
        ContainerServiceFormSection,
        EnvironmentFormSection,
        GeneralServiceFormSection,
        HealthChecksFormSection,
        NetworkingFormSection,
        VolumesFormSection
      ];

      const jsonParserReducers = combineParsers(
        Hooks.applyFilter('serviceCreateJsonParserReducers', JSONParserReducers)
      );
      const jsonConfigReducers = combineReducers(
        Hooks.applyFilter('serviceJsonConfigReducers', JSONConfigReducers)
      );
      const inputConfigReducers = combineReducers(
        Hooks.applyFilter('serviceInputConfigReducers',
          Object.assign({}, ...SECTIONS.map((item) => item.configReducers))
        )
      );

      return (
        <NewCreateServiceModalForm
          activeTab={this.state.activeTab}
          jsonParserReducers={jsonParserReducers}
          jsonConfigReducers={jsonConfigReducers}
          inputConfigReducers={inputConfigReducers}
          isJSONModeActive={this.state.isJSONModeActive}
          ref={(ref) => { return this.createComponent = ref; }}
          service={this.state.serviceConfig}
          onChange={this.handleServiceChange}
          onErrorStateChange={this.handleServiceErrorChange} />
      );
    }

    if (this.state.serviceJsonActive) {
      return (
        <CreateServiceJsonOnly
          ref={(ref) => { return this.createComponent = ref; }}
          service={this.state.serviceConfig}
          onChange={this.handleServiceChange}
          onErrorStateChange={this.handleServiceErrorChange} />
      );
    }

    return null;
  }

  getPrimaryActions() {
    const {
      serviceFormActive,
      serviceJsonActive,
      servicePickerActive,
      serviceReviewActive
    } = this.state;

    const force = this.shouldForceSubmit();
    const runButtonLabel = force ? 'Force Run Service' : 'Run Service';
    const runButtonClassNames = classNames('flush-vertical', {
      'button-primary': !force,
      'button-danger': force
    });

    // NOTE: Always prioritize review screen check
    if (serviceReviewActive) {
      return [
        {
          className: runButtonClassNames,
          clickHandler: this.handleServiceRun,
          label: runButtonLabel
        }
      ];
    }

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
          disabled: this.state.serviceFormHasErrors,
          label: 'Review & Run'
        }
      ];
    }

    if (serviceJsonActive) {
      return [
        {
          className: 'button-primary flush-vertical',
          clickHandler: this.handleServiceReview,
          disabled: this.state.serviceFormHasErrors,
          label: 'Review & Run'
        }
      ];
    }

    return [];
  }

  getResetState(nextProps = this.props) {
    const newState = {
      activeTab: null,
      isJSONModeActive: false,
      serviceConfig: nextProps.service.getSpec(),
      serviceFormActive: false,
      serviceJsonActive: false,
      servicePickerActive: true,
      serviceReviewActive: false,
      serviceFormHasErrors: false
    };

    // Switch directly to form/json if edit
    if (nextProps.isEdit) {
      newState.servicePickerActive = false;

      if (nextProps.service instanceof Pod) {
        newState.serviceJsonActive = true;
      } else {
        newState.serviceFormActive = true;
      }
    }

    return newState;
  }

  getSecondaryActions() {
    const {
      servicePickerActive,
      serviceReviewActive
    } = this.state;
    let label = 'Back';

    if (servicePickerActive || (this.props.isEdit && !serviceReviewActive)) {
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
    const {props, state: {servicePickerActive, serviceReviewActive}} = this;
    let useGemini = false;

    if (servicePickerActive || serviceReviewActive) {
      useGemini = true;
    }

    return (
      <div>
        <FullScreenModal
          header={this.getHeader()}
          onClose={this.handleClose}
          useGemini={useGemini}
          {...Util.omit(props, Object.keys(NewServiceFormModal.propTypes))}>
          {this.getModalContent()}
        </FullScreenModal>
      </div>
    );
  }
}

NewServiceFormModal.propTypes = {
  clearError: PropTypes.func.isRequired,
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
