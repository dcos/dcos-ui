import classNames from 'classnames';
import deepEqual from 'deep-equal';
import React, {Component, PropTypes} from 'react';
import {Hooks} from 'PluginSDK';
import {routerShape} from 'react-router';

import Application from '../../structs/Application';
import PodSpec from '../../structs/PodSpec';
import Service from '../../structs/Service';

import DCOSStore from '../../../../../../foundation-ui/stores/DCOSStore';
import MarathonActions from '../../events/MarathonActions';
import MarathonStore from '../../stores/MarathonStore';
import {
  MARATHON_SERVICE_CREATE_ERROR,
  MARATHON_SERVICE_CREATE_SUCCESS,
  MARATHON_SERVICE_EDIT_ERROR,
  MARATHON_SERVICE_EDIT_SUCCESS
} from '../../constants/EventTypes';
import {DCOS_CHANGE} from '../../../../../../src/js/constants/EventTypes';

import {DEFAULT_APP_SPEC} from '../../constants/DefaultApp';
import {DEFAULT_POD_SPEC} from '../../constants/DefaultPod';

import ContainerServiceFormSection from '../forms/ContainerServiceFormSection';
import CreateServiceJsonOnly from './CreateServiceJsonOnly';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import FullScreenModal from '../../../../../../src/js/components/modals/FullScreenModal';
import FullScreenModalHeader from '../../../../../../src/js/components/modals/FullScreenModalHeader';
import FullScreenModalHeaderActions from '../../../../../../src/js/components/modals/FullScreenModalHeaderActions';
import FullScreenModalHeaderTitle from '../../../../../../src/js/components/modals/FullScreenModalHeaderTitle';
import GeneralServiceFormSection from '../forms/GeneralServiceFormSection';
import HealthChecksFormSection from '../forms/HealthChecksFormSection';
import JSONAppReducers from '../../reducers/JSONAppReducers';
import JSONMultiContainerReducers from '../../reducers/JSONMultiContainerReducers';
import JSONParser from '../../reducers/JSONParser';
import MultiContainerNetworkingFormSection from '../forms/MultiContainerNetworkingFormSection';
import MultiContainerVolumesFormSection from '../forms/MultiContainerVolumesFormSection';
import NetworkingFormSection from '../forms/NetworkingFormSection';
import NewCreateServiceModalForm from './NewCreateServiceModalForm';
import NewCreateServiceModalServicePicker from './NewCreateServiceModalServicePicker';
import ServiceConfigDisplay from '../../service-configuration/ServiceConfigDisplay';
import {getBaseID} from '../../utils/ServiceUtil';
import ToggleButton from '../../../../../../src/js/components/ToggleButton';
import Util from '../../../../../../src/js/utils/Util';
import VolumesFormSection from '../forms/VolumesFormSection';
import {combineParsers} from '../../../../../../src/js/utils/ParserUtil';
import {combineReducers} from '../../../../../../src/js/utils/ReducerUtil';

const METHODS_TO_BIND = [
  'handleGoBack',
  'handleClearError',
  'handleClose',
  'handleConvertToPod',
  'handleJSONToggle',
  'handleServiceChange',
  'handleServiceErrorChange',
  'handleServiceReview',
  'handleServiceRun',
  'handleServiceSelection',
  'handleTabChange',
  'handleStoreChange',
  'onMarathonStoreServiceCreateError',
  'onMarathonStoreServiceCreateSuccess',
  'onMarathonStoreServiceEditError',
  'onMarathonStoreServiceEditSuccess'
];

class NewCreateServiceModal extends Component {
  constructor() {
    super(...arguments);

    const {location, params} = this.props;
    const isEdit = this.isLocationEdit(location);
    const serviceID = decodeURIComponent(params.id || '/');
    const service = isEdit ? DCOSStore.serviceTree.findItemById(serviceID) : null;
    const isSpecificVersion = service instanceof Application && params.version;
    let serviceConfig = new Application(
      Object.assign({id: getBaseID(serviceID)}, DEFAULT_APP_SPEC)
    );

    if (isEdit && service instanceof Service && !isSpecificVersion) {
      serviceConfig = service.getSpec();
    }

    if (isEdit && isSpecificVersion) {
      serviceConfig = service.getVersions().get(params.version);
    }

    this.state = {
      activeTab: null,
      errors: null,
      isJSONModeActive: false,
      isOpen: true,
      isPending: false,
      service,
      serviceConfig,
      serviceFormActive: isEdit, // Switch directly to form/json if edit
      serviceJsonActive: false,
      servicePickerActive: !isEdit, // Switch directly to form/json if edit
      serviceReviewActive: false,
      serviceFormHasErrors: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    // Add store change listeners the traditional way as React Router is
    // not able to pass down correct props if we are using StoreMixin
    MarathonStore.addChangeListener(
      MARATHON_SERVICE_CREATE_ERROR,
      this.onMarathonStoreServiceCreateError
    );
    MarathonStore.addChangeListener(
      MARATHON_SERVICE_CREATE_SUCCESS,
      this.onMarathonStoreServiceCreateSuccess
    );
    MarathonStore.addChangeListener(
      MARATHON_SERVICE_EDIT_ERROR,
      this.onMarathonStoreServiceEditError
    );
    MarathonStore.addChangeListener(
      MARATHON_SERVICE_EDIT_SUCCESS,
      this.onMarathonStoreServiceEditSuccess
    );

    // Only add change listener if we didn't receive our service in first try
    if (!service && isEdit) {
      DCOSStore.addChangeListener(DCOS_CHANGE, this.handleStoreChange);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {location, params} = this.props;
    // Skip update if there was no change to props
    if (nextProps.location.pathname === location.pathname &&
      deepEqual(nextProps.params, params)) {
      return;
    }

    const isEdit = this.isLocationEdit(nextProps.location);
    const serviceID = decodeURIComponent(nextProps.params.id || '/');
    const service = isEdit ? DCOSStore.serviceTree.findItemById(serviceID) : null;
    let serviceConfig = new Application(
      Object.assign({id: getBaseID(serviceID)}, DEFAULT_APP_SPEC)
    );

    if (isEdit && service instanceof Service) {
      serviceConfig = service.getSpec();
    }

    this.setState({
      activeTab: null,
      errors: null,
      isJSONModeActive: false,
      isOpen: true,
      isPending: false,
      service,
      serviceConfig,
      serviceFormActive: isEdit, // Switch directly to form/json if edit
      serviceJsonActive: false,
      servicePickerActive: !isEdit, // Switch directly to form/json if edit
      serviceReviewActive: false,
      serviceFormHasErrors: false
    });

    // Only add change listener if we didn't receive our service in first try
    if (!service && isEdit) {
      DCOSStore.addChangeListener(DCOS_CHANGE, this.handleStoreChange);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const requestCompleted = this.state.isPending && !nextState.isPending;
    const shouldClose = requestCompleted && !nextState.errors;

    if (shouldClose) {
      this.context.router.push(`/services/overview/${encodeURIComponent(nextProps.params.id)}`);
    }
  }

  componentWillUnmount() {
    MarathonStore.removeChangeListener(
      MARATHON_SERVICE_CREATE_ERROR,
      this.onMarathonStoreServiceCreateError
    );
    MarathonStore.removeChangeListener(
      MARATHON_SERVICE_CREATE_SUCCESS,
      this.onMarathonStoreServiceCreateSuccess
    );
    MarathonStore.removeChangeListener(
      MARATHON_SERVICE_EDIT_ERROR,
      this.onMarathonStoreServiceEditError
    );
    MarathonStore.removeChangeListener(
      MARATHON_SERVICE_EDIT_SUCCESS,
      this.onMarathonStoreServiceEditSuccess
    );

    // Also remove DCOS change listener, if still subscribed
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.handleStoreChange);
  }

  onMarathonStoreServiceCreateError(errors) {
    this.setState({errors, isPending: false});
  }

  onMarathonStoreServiceCreateSuccess() {
    this.setState({errors: null, isPending: false});
  }

  onMarathonStoreServiceEditError(errors) {
    this.setState({errors, isPending: false});
  }

  onMarathonStoreServiceEditSuccess() {
    this.setState({errors: null, isPending: false});
  }

  shouldForceSubmit() {
    const {errors} = this.state;

    if (errors && errors.message) {
      return /force=true/.test(errors.message);
    }

    return false;
  }

  handleStoreChange() {
    // Unsubscribe from further events
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.handleStoreChange);

    const {params} = this.props;
    const serviceID = decodeURIComponent(params.id || '/');
    const service = DCOSStore.serviceTree.findItemById(serviceID);

    this.setState({service, serviceConfig: service.getSpec()});
  }

  handleGoBack({tabViewID}) {
    const {location} = this.props;
    const {
      serviceFormActive,
      serviceJsonActive,
      servicePickerActive,
      serviceReviewActive
    } = this.state;

    if (serviceReviewActive) {
      // Just hide review screen. Form or JSON mode will be
      // activated automatically depending on their last state
      this.setState({
        serviceReviewActive: false,
        activeTab: tabViewID
      });

      return;
    }

    // Close if picker is open, or if editing a service in the form
    if (servicePickerActive ||
      (!serviceReviewActive && this.isLocationEdit(location))) {
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

  handleTabChange(activeTab) {
    this.setState({activeTab});
  }

  handleClearError() {
    this.setState({errors: null});
  }

  handleClose() {
    this.setState({isOpen: false}, () => {
      // Navigate to parent after setState, so we get modal animation
      this.context.router.goBack();
    });
  }

  handleConvertToPod() {
    this.handleServiceSelection({type: 'pod'});
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

  handleServiceSelection({route, type}) {
    const {params} = this.props;
    const baseID = getBaseID(decodeURIComponent(params.id || '/'));

    switch (type) {
      case 'app':
        this.setState({
          activeTab: null,
          servicePickerActive: false,
          serviceFormActive: true,
          serviceConfig: new Application(
            Object.assign({id: baseID}, DEFAULT_APP_SPEC)
          )
        });
        break;

      case 'pod':
        this.setState({
          activeTab: null,
          servicePickerActive: false,
          serviceFormActive: true,
          serviceConfig: new PodSpec(
            Object.assign({id: baseID}, DEFAULT_POD_SPEC)
          )
        });
        break;

      case 'json':
        this.setState({
          activeTab: null,
          servicePickerActive: false,
          serviceJsonActive: true,
          serviceConfig: new Application(
            Object.assign({id: baseID}, DEFAULT_APP_SPEC)
          )
        });
        break;

      case 'redirect':
        this.context.router.push(route);
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
    const {location} = this.props;
    const {service, serviceConfig} = this.state;
    const force = this.shouldForceSubmit();
    if (this.isLocationEdit(location) && service instanceof Service) {
      MarathonActions.editService(service, serviceConfig, force);
    } else {
      MarathonActions.createService(serviceConfig, force);
    }

    this.setState({isPending: true});
  }

  isLocationEdit(location) {
    return location.pathname.includes('/edit');
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
    const {location} = this.props;
    const {service} = this.state;
    const serviceName = service ? `"${service.getName()}"` : 'Service';

    if (this.isLocationEdit(location)) {
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
    const {
      errors,
      isJSONModeActive,
      serviceConfig,
      serviceFormActive,
      serviceJsonActive,
      servicePickerActive,
      serviceReviewActive
    } = this.state;

    const errorsMap = new Map();
    if (errors) {
      let message = errors.message;

      if (this.shouldForceSubmit()) {
        message = `App is currently locked by one or more deployments.
         Press the button again to forcefully change and deploy the
         new configuration.`;
      }
      errorsMap.set('/', [message]);

      if (errors.details) {
        errors.details.forEach(function (item) {
          const existingMessages = errorsMap.get(item.path);

          let messages = item.errors;

          if (existingMessages) {
            messages = messages.concat(existingMessages);
          }

          errorsMap.set(item.path, messages);
        });
      }
    }

    // NOTE: Always prioritize review screen check
    if (serviceReviewActive) {
      return (
        <div className="flex-item-grow-1">
          <div className="container container-wide">
            <ServiceConfigDisplay
              onEditClick={this.handleGoBack}
              appConfig={serviceConfig}
              clearError={this.handleClearError}
              errors={errorsMap} />
          </div>
        </div>
      );
    }

    if (servicePickerActive) {
      return (
        <NewCreateServiceModalServicePicker
          onServiceSelect={this.handleServiceSelection} />
      );
    }

    if (serviceFormActive) {
      const {location} = this.props;

      const SECTIONS = [
        ContainerServiceFormSection,
        EnvironmentFormSection,
        GeneralServiceFormSection,
        HealthChecksFormSection,
        NetworkingFormSection,
        VolumesFormSection,
        MultiContainerVolumesFormSection,
        MultiContainerNetworkingFormSection
      ];

      const jsonParserReducers = combineParsers(
        Hooks.applyFilter('serviceCreateJsonParserReducers', JSONParser)
      );

      const isPod = serviceConfig instanceof PodSpec;

      let jsonConfigReducers = combineReducers(
        Hooks.applyFilter('serviceJsonConfigReducers', JSONAppReducers)
      );

      if (isPod) {
        jsonConfigReducers = combineReducers(
          Hooks.applyFilter('serviceJsonConfigReducers', JSONMultiContainerReducers)
        );
      }

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
          handleTabChange={this.handleTabChange}
          inputConfigReducers={inputConfigReducers}
          isJSONModeActive={isJSONModeActive}
          ref={(ref) => {
            return this.createComponent = ref;
          }}
          service={serviceConfig}
          onChange={this.handleServiceChange}
          onConvertToPod={this.handleConvertToPod}
          onErrorStateChange={this.handleServiceErrorChange}
          isEdit={this.isLocationEdit(location)} />
      );
    }

    if (serviceJsonActive) {
      // serviceConfig should be service

      return (
        <CreateServiceJsonOnly
          ref={(ref) => {
            return this.createComponent = ref;
          }}
          service={serviceConfig}
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
              checkboxClassName="toggle-button toggle-button-align-left"
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

  getSecondaryActions() {
    const {location} = this.props;
    const {
      servicePickerActive,
      serviceReviewActive
    } = this.state;
    let label = 'Back';

    if (servicePickerActive || (this.isLocationEdit(location) && !serviceReviewActive)) {
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
    const {props} = this;
    const {isOpen, servicePickerActive, serviceReviewActive} = this.state;
    let useGemini = false;

    if (servicePickerActive || serviceReviewActive) {
      useGemini = true;
    }

    return (
      <FullScreenModal
        header={this.getHeader()}
        onClose={this.handleClose}
        useGemini={useGemini}
        open={isOpen}
        {...Util.omit(props, Object.keys(NewCreateServiceModal.propTypes))}>
        {this.getModalContent()}
      </FullScreenModal>
    );
  }
}

NewCreateServiceModal.contextTypes = {
  router: routerShape
};

NewCreateServiceModal.propTypes = {
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

module.exports = NewCreateServiceModal;
