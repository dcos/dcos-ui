import classNames from "classnames";
import deepEqual from "deep-equal";
import React, { Component, PropTypes } from "react";
import { Confirm } from "reactjs-components";
import { Hooks } from "PluginSDK";
import { routerShape } from "react-router";

import Application from "../../structs/Application";
import ApplicationSpec from "../../structs/ApplicationSpec";
import PodSpec from "../../structs/PodSpec";
import Service from "../../structs/Service";

import DCOSStore from "../../../../../../foundation-ui/stores/DCOSStore";
import MarathonActions from "../../events/MarathonActions";
import MarathonStore from "../../stores/MarathonStore";
import {
  MARATHON_SERVICE_CREATE_ERROR,
  MARATHON_SERVICE_CREATE_SUCCESS,
  MARATHON_SERVICE_EDIT_ERROR,
  MARATHON_SERVICE_EDIT_SUCCESS
} from "../../constants/EventTypes";
import { DCOS_CHANGE } from "../../../../../../src/js/constants/EventTypes";

import { DEFAULT_APP_SPEC } from "../../constants/DefaultApp";
import { DEFAULT_POD_SPEC } from "../../constants/DefaultPod";

import ContainerServiceFormSection from "../forms/ContainerServiceFormSection";
import CreateServiceJsonOnly from "./CreateServiceJsonOnly";
import EnvironmentFormSection from "../forms/EnvironmentFormSection";
import AppValidators
  from "../../../../../../src/resources/raml/marathon/v2/types/app.raml";
import DataValidatorUtil
  from "../../../../../../src/js/utils/DataValidatorUtil";
import FullScreenModal
  from "../../../../../../src/js/components/modals/FullScreenModal";
import FullScreenModalHeader
  from "../../../../../../src/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions
  from "../../../../../../src/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle
  from "../../../../../../src/js/components/modals/FullScreenModalHeaderTitle";
import MarathonAppValidators from "../../validators/MarathonAppValidators";
import MarathonErrorUtil from "../../utils/MarathonErrorUtil";
import NewCreateServiceModalServicePicker
  from "./NewCreateServiceModalServicePicker";
import NewCreateServiceModalForm from "./NewCreateServiceModalForm";
import PodValidators
  from "../../../../../../src/resources/raml/marathon/v2/types/pod.raml";
import ServiceConfigDisplay
  from "../../service-configuration/ServiceConfigDisplay";
import ToggleButton from "../../../../../../src/js/components/ToggleButton";
import Util from "../../../../../../src/js/utils/Util";
import GeneralServiceFormSection from "../forms/GeneralServiceFormSection";
import HealthChecksFormSection from "../forms/HealthChecksFormSection";
import JSONAppReducers from "../../reducers/JSONAppReducers";
import JSONMultiContainerParser from "../../reducers/JSONMultiContainerParser";
import JSONMultiContainerReducers
  from "../../reducers/JSONMultiContainerReducers";
import JSONSingleContainerParser
  from "../../reducers/JSONSingleContainerParser";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import MultiContainerNetworkingFormSection
  from "../forms/MultiContainerNetworkingFormSection";
import MultiContainerVolumesFormSection
  from "../forms/MultiContainerVolumesFormSection";
import NetworkingFormSection from "../forms/NetworkingFormSection";
import ServiceErrorTypes from "../../constants/ServiceErrorTypes";
import VolumesFormSection from "../forms/VolumesFormSection";
import VipLabelsValidators from "../../validators/VipLabelsValidators";
import { combineParsers } from "../../../../../../src/js/utils/ParserUtil";
import { combineReducers } from "../../../../../../src/js/utils/ReducerUtil";
import { getBaseID, getServiceJSON } from "../../utils/ServiceUtil";

const METHODS_TO_BIND = [
  "handleClearError",
  "handleClose",
  "handleCloseConfirmModal",
  "handleConfirmGoBack",
  "handleConvertToPod",
  "handleGoBack",
  "handleJSONToggle",
  "handleRouterWillLeave",
  "handleServiceChange",
  "handleServiceErrorsChange",
  "handleServicePropertyChange",
  "handleServiceReview",
  "handleServiceRun",
  "handleServiceSelection",
  "handleStoreChange",
  "handleTabChange",
  "onMarathonStoreServiceCreateError",
  "onMarathonStoreServiceCreateSuccess",
  "onMarathonStoreServiceEditError",
  "onMarathonStoreServiceEditSuccess"
];

const APP_VALIDATORS = [
  AppValidators.App,
  MarathonAppValidators.containsCmdArgsOrContainer,
  MarathonAppValidators.complyWithResidencyRules,
  MarathonAppValidators.complyWithIpAddressRules,
  MarathonAppValidators.mustContainImageOnDocker,
  MarathonAppValidators.validateConstraints,
  MarathonAppValidators.mustNotContainUris,
  VipLabelsValidators.mustContainPort
];

const POD_VALIDATORS = [PodValidators.Pod, VipLabelsValidators.mustContainPort];

class NewCreateServiceModal extends Component {
  constructor() {
    super(...arguments);

    this.state = this.getResetState(this.props);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const { location, route } = this.props;
    const { service } = this.state;
    const { router } = this.context;
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

    this.unregisterLeaveHook = router.setRouteLeaveHook(
      route,
      this.handleRouterWillLeave
    );

    // Only add change listener if we didn't receive our service in first try
    if (!service && this.isLocationEdit(location)) {
      DCOSStore.addChangeListener(DCOS_CHANGE, this.handleStoreChange);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location, params } = this.props;
    // Skip update if there was no change to props
    if (
      nextProps.location.pathname === location.pathname &&
      deepEqual(nextProps.params, params)
    ) {
      return;
    }

    this.setState(this.getResetState(nextProps));
  }

  componentWillUpdate(nextProps, nextState) {
    const requestCompleted = this.state.isPending && !nextState.isPending;
    const shouldClose = requestCompleted && !nextState.apiErrors.length;

    if (shouldClose) {
      this.context.router.push(
        `/services/overview/${encodeURIComponent(nextProps.params.id)}`
      );
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

    // Clean up router leave hook
    this.unregisterLeaveHook();

    // Also remove DCOS change listener, if still subscribed
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.handleStoreChange);
  }

  onMarathonStoreServiceCreateError(errors) {
    this.setState({
      apiErrors: MarathonErrorUtil.parseErrors(errors),
      isPending: false
    });
  }

  onMarathonStoreServiceCreateSuccess() {
    this.setState({ apiErrors: [], isPending: false });
  }

  onMarathonStoreServiceEditError(errors) {
    this.setState({
      apiErrors: MarathonErrorUtil.parseErrors(errors),
      isPending: false
    });
  }

  onMarathonStoreServiceEditSuccess() {
    this.setState({ apiErrors: [], isPending: false });
  }

  shouldForceSubmit() {
    return this.state.apiErrors.some(function(error) {
      return error.type === ServiceErrorTypes.SERVICE_DEPLOYING;
    });
  }

  handleRouterWillLeave() {
    const { isOpen, hasChangesApplied, serviceReviewActive } = this.state;
    // If we are not about to close the modal and not on the review screen,
    // confirm before navigating away
    if (isOpen && hasChangesApplied && !serviceReviewActive) {
      this.handleOpenConfirm();

      // Cancel route change, if it is already open
      return false;
    }

    return true;
  }

  handleConfirmGoBack() {
    const { location } = this.props;
    const { serviceFormActive, serviceJsonActive } = this.state;

    // Close if editing a service in the form
    if (serviceFormActive && this.isLocationEdit(location)) {
      this.handleClose();

      return;
    }

    // Switch back from form to picker
    if (serviceFormActive) {
      this.setState({
        isConfirmOpen: false,
        hasChangesApplied: false,
        servicePickerActive: true,
        serviceFormActive: false
      });

      return;
    }

    // Switch back from JSON to picker
    if (serviceJsonActive) {
      this.setState({
        isConfirmOpen: false,
        hasChangesApplied: false,
        servicePickerActive: true,
        serviceJsonActive: false
      });
    }
  }

  handleStoreChange() {
    // Unsubscribe from further events
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.handleStoreChange);

    const { params } = this.props;
    const serviceID = decodeURIComponent(params.id || "/");
    const service = DCOSStore.serviceTree.findItemById(serviceID);

    this.setState({ service, serviceSpec: service.getSpec() });
  }

  handleGoBack(event) {
    const { tabViewID } = event;
    const {
      hasChangesApplied,
      serviceFormActive,
      servicePickerActive,
      serviceReviewActive
    } = this.state;

    if (serviceReviewActive) {
      // Remove the 'Application is deploying' error when we havigate back
      // since it's not related to the form
      const apiErrors = this.state.apiErrors.filter(function(error) {
        return error.type !== ServiceErrorTypes.SERVICE_DEPLOYING;
      });

      // Just hide review screen. Form or JSON mode will be
      // activated automatically depending on their last state
      this.setState({
        activeTab: tabViewID,
        apiErrors,
        serviceReviewActive: false,
        showAllErrors: true
      });

      return;
    }

    // Close if picker is open
    if (servicePickerActive && !serviceFormActive) {
      this.handleClose();

      return;
    }

    // Close if editing a service in the form, but confirm before
    // if changes has been applied to the form
    if (serviceFormActive && hasChangesApplied) {
      this.handleOpenConfirm();

      return;
    }

    this.handleConfirmGoBack();
  }

  handleTabChange(activeTab) {
    this.setState({ activeTab });
  }

  handleClearError() {
    this.setState({
      apiErrors: [],
      showAllErrors: false
    });
  }

  handleOpenConfirm() {
    this.setState({ isConfirmOpen: true });
  }

  handleCloseConfirmModal() {
    this.setState({ isConfirmOpen: false });
  }

  handleClose() {
    // Start the animation of the modal by setting isOpen to false
    this.setState({ isConfirmOpen: false, isOpen: false }, () => {
      // Once state is set, start a timer for the length of the animation and
      // navigate away once the animation is over.
      setTimeout(this.context.router.goBack, 300);
    });
  }

  handleConvertToPod() {
    this.handleServiceSelection({ type: "pod" });
  }

  handleJSONToggle() {
    this.setState({ isJSONModeActive: !this.state.isJSONModeActive });
  }

  handleServiceChange(newService) {
    this.setState({ serviceSpec: newService, hasChangesApplied: true });
  }

  handleServiceErrorsChange(errors) {
    this.setState({ serviceFormErrors: errors });
  }

  handleServicePropertyChange(path) {
    const refPath = path.join(".");
    let { apiErrors } = this.state;

    apiErrors = apiErrors.filter(error => {
      const errorPath = error.path.join(".");

      // Remove all root errors on a simple update
      if (errorPath === "") {
        return false;
      }

      // Otherwise remove errors on the given path
      return errorPath !== refPath;
    });

    this.setState({ apiErrors });
  }

  handleServiceSelection(event) {
    const { route, type } = event;
    const { params } = this.props;
    const baseID = getBaseID(decodeURIComponent(params.id || "/"));

    switch (type) {
      case "app":
        this.setState({
          activeTab: null,
          apiErrors: [],
          serviceFormErrors: [],
          servicePickerActive: false,
          serviceFormActive: true,
          serviceSpec: new ApplicationSpec(
            Object.assign({ id: baseID }, DEFAULT_APP_SPEC)
          ),
          showAllErrors: false
        });
        break;

      case "pod":
        this.setState({
          activeTab: null,
          apiErrors: [],
          serviceFormErrors: [],
          servicePickerActive: false,
          serviceFormActive: true,
          serviceSpec: new PodSpec(
            Object.assign({ id: baseID }, DEFAULT_POD_SPEC)
          ),
          showAllErrors: false
        });
        break;

      case "json":
        this.setState({
          activeTab: null,
          apiErrors: [],
          serviceFormErrors: [],
          servicePickerActive: false,
          serviceJsonActive: true,
          serviceSpec: new ApplicationSpec(
            Object.assign({ id: baseID }, DEFAULT_APP_SPEC)
          ),
          showAllErrors: false
        });
        break;

      case "redirect":
        this.context.router.push(route);
        break;
    }
  }

  handleServiceReview() {
    const errors = this.getFormErrors();
    if (errors.length === 0) {
      this.setState({
        apiErrors: [],
        serviceReviewActive: true
      });
    } else {
      this.setState({
        showAllErrors: true
      });
    }
  }

  handleServiceRun() {
    const { location } = this.props;
    const { service, serviceSpec } = this.state;
    const force = this.shouldForceSubmit();
    if (this.isLocationEdit(location) && service instanceof Service) {
      MarathonActions.editService(service, serviceSpec, force);
    } else {
      MarathonActions.createService(serviceSpec, force);
    }

    this.setState({ isPending: true });
  }

  isLocationEdit(location) {
    return location.pathname.includes("/edit");
  }

  /**
   * This function combines the errors received from marathon and the errors
   * produced by the form into a unified error array
   *
   * @returns {Array} - An array of error objects
   */
  getFormErrors() {
    const { serviceFormErrors, serviceSpec } = this.state;
    let validationErrors = [];

    const appValidators = APP_VALIDATORS.concat(
      Hooks.applyFilter("appValidators", [])
    );

    const podValidators = POD_VALIDATORS.concat(
      Hooks.applyFilter("podValidators", [])
    );

    // Validate Application or Pod according to the contents
    // of the serviceSpec property.

    if (serviceSpec instanceof ApplicationSpec) {
      validationErrors = DataValidatorUtil.validate(
        getServiceJSON(serviceSpec),
        appValidators
      );
    }

    if (serviceSpec instanceof PodSpec) {
      validationErrors = DataValidatorUtil.validate(
        getServiceJSON(serviceSpec),
        podValidators
      );
    }

    return validationErrors.concat(serviceFormErrors);
  }

  /**
   * This function combines the errors received from marathon and the errors
   * produced by the form into a unified error array
   *
   * @returns {Array} - An array of error objects
   */
  getAllErrors() {
    return this.state.apiErrors.concat(this.getFormErrors());
  }

  getHeader() {
    // NOTE: Always prioritize review screen check
    if (this.state.serviceReviewActive) {
      return (
        <FullScreenModalHeader>
          <FullScreenModalHeaderActions
            actions={this.getSecondaryActions()}
            type="secondary"
          />
          <FullScreenModalHeaderTitle>
            Review & Run Service
          </FullScreenModalHeaderTitle>
          <FullScreenModalHeaderActions
            actions={this.getPrimaryActions()}
            type="primary"
          />
        </FullScreenModalHeader>
      );
    }

    let title = "Run a Service";
    const { location } = this.props;
    const { service } = this.state;
    const serviceName = service ? `"${service.getName()}"` : "Service";

    if (this.isLocationEdit(location)) {
      title = `Edit ${serviceName}`;
    }

    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={this.getSecondaryActions()}
          type="secondary"
        />
        <FullScreenModalHeaderTitle>
          {title}
        </FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={this.getPrimaryActions()}
          type="primary"
        />
      </FullScreenModalHeader>
    );
  }

  getModalContent() {
    const {
      isJSONModeActive,
      serviceSpec,
      serviceFormActive,
      serviceJsonActive,
      servicePickerActive,
      serviceReviewActive
    } = this.state;

    // NOTE: Always prioritize review screen check
    if (serviceReviewActive) {
      return (
        <div className="flex-item-grow-1">
          <div className="container container-wide">
            <ServiceConfigDisplay
              onEditClick={this.handleGoBack}
              appConfig={serviceSpec}
              errors={this.getAllErrors()}
            />
          </div>
        </div>
      );
    }

    if (servicePickerActive) {
      return (
        <NewCreateServiceModalServicePicker
          onServiceSelect={this.handleServiceSelection}
        />
      );
    }

    if (serviceFormActive) {
      const { location } = this.props;
      const { showAllErrors } = this.state;

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

      let jsonParserReducers;
      let jsonConfigReducers;
      let inputConfigReducers;

      if (serviceSpec instanceof PodSpec) {
        jsonParserReducers = combineParsers(
          Hooks.applyFilter(
            "multiContainerCreateJsonParserReducers",
            JSONMultiContainerParser
          )
        );

        jsonConfigReducers = combineReducers(
          Hooks.applyFilter(
            "multiContainerJsonConfigReducers",
            JSONMultiContainerReducers
          )
        );

        inputConfigReducers = combineReducers(
          Hooks.applyFilter(
            "multiContainerInputConfigReducers",
            Object.assign({}, ...SECTIONS.map(item => item.configReducers))
          )
        );
      } else {
        jsonParserReducers = combineParsers(
          Hooks.applyFilter(
            "serviceCreateJsonParserReducers",
            JSONSingleContainerParser
          )
        );

        jsonConfigReducers = combineReducers(
          Hooks.applyFilter("serviceJsonConfigReducers", JSONAppReducers)
        );

        inputConfigReducers = combineReducers(
          Hooks.applyFilter(
            "serviceInputConfigReducers",
            Object.assign({}, ...SECTIONS.map(item => item.configReducers))
          )
        );
      }

      return (
        <NewCreateServiceModalForm
          activeTab={this.state.activeTab}
          errors={this.getAllErrors()}
          jsonParserReducers={jsonParserReducers}
          jsonConfigReducers={jsonConfigReducers}
          handleTabChange={this.handleTabChange}
          inputConfigReducers={inputConfigReducers}
          isEdit={this.isLocationEdit(location)}
          isJSONModeActive={isJSONModeActive}
          ref={ref => {
            return (this.createComponent = ref);
          }}
          onChange={this.handleServiceChange}
          onConvertToPod={this.handleConvertToPod}
          onErrorsChange={this.handleServiceErrorsChange}
          service={serviceSpec}
          showAllErrors={showAllErrors}
        />
      );
    }

    if (serviceJsonActive) {
      // TODO (DCOS-13561): serviceSpec should be service

      return (
        <CreateServiceJsonOnly
          errors={this.getAllErrors()}
          onChange={this.handleServiceChange}
          onErrorsChange={this.handleServiceErrorsChange}
          onPropertyChange={this.handleServicePropertyChange}
          ref={ref => {
            return (this.createComponent = ref);
          }}
          service={serviceSpec}
        />
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
    const runButtonLabel = force ? "Force Run Service" : "Run Service";
    const runButtonClassNames = classNames("flush-vertical", {
      "button-primary": !force,
      "button-danger": force
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
              key="json-editor"
            >
              JSON Editor
            </ToggleButton>
          )
        },
        {
          className: "button-primary flush-vertical",
          clickHandler: this.handleServiceReview,
          label: "Review & Run"
        }
      ];
    }

    if (serviceJsonActive) {
      return [
        {
          className: "button-primary flush-vertical",
          clickHandler: this.handleServiceReview,
          label: "Review & Run"
        }
      ];
    }

    return [];
  }

  getResetState(nextProps = this.props) {
    const { location, params } = nextProps;
    const isEdit = this.isLocationEdit(location);
    const serviceID = decodeURIComponent(params.id || "/");
    const service = isEdit
      ? DCOSStore.serviceTree.findItemById(serviceID)
      : null;
    const isSpecificVersion = service instanceof Application && params.version;
    let serviceSpec = new ApplicationSpec(
      Object.assign({ id: getBaseID(serviceID) }, DEFAULT_APP_SPEC)
    );

    if (isEdit && service instanceof Service && !isSpecificVersion) {
      serviceSpec = service.getSpec();
    }

    if (isEdit && isSpecificVersion) {
      serviceSpec = service.getVersions().get(params.version);
    }

    const newState = {
      activeTab: null,
      apiErrors: [],
      hasChangesApplied: false,
      isConfirmOpen: false,
      isJSONModeActive: false,
      isOpen: true,
      isPending: false,
      service,
      serviceSpec,
      serviceFormActive: isEdit, // Switch directly to form/json if edit
      serviceFormErrors: [],
      serviceJsonActive: false,
      servicePickerActive: !isEdit, // Switch directly to form/json if edit
      serviceReviewActive: false,
      serviceFormHasErrors: false,
      showAllErrors: false
    };

    return newState;
  }

  getSecondaryActions() {
    const { location } = this.props;
    const { servicePickerActive, serviceReviewActive } = this.state;
    let label = "Back";

    if (
      servicePickerActive ||
      (this.isLocationEdit(location) && !serviceReviewActive)
    ) {
      label = "Cancel";
    }

    return [
      {
        className: "button-stroke",
        clickHandler: this.handleGoBack,
        label
      }
    ];
  }

  render() {
    const { props } = this;
    const {
      hasChangesApplied,
      isOpen,
      servicePickerActive,
      serviceReviewActive
    } = this.state;
    let useGemini = false;
    if (servicePickerActive || serviceReviewActive) {
      useGemini = true;
    }

    let closeAction = this.handleClose;
    if (hasChangesApplied) {
      closeAction = this.handleOpenConfirm;
    }

    return (
      <FullScreenModal
        header={this.getHeader()}
        onClose={closeAction}
        useGemini={useGemini}
        open={isOpen}
        {...Util.omit(props, Object.keys(NewCreateServiceModal.propTypes))}
      >
        {this.getModalContent()}
        <Confirm
          closeByBackdropClick={true}
          header={<ModalHeading>Discard Changes?</ModalHeading>}
          open={this.state.isConfirmOpen}
          onClose={this.handleCloseConfirmModal}
          leftButtonText="Cancel"
          leftButtonCallback={this.handleCloseConfirmModal}
          rightButtonText="Discard"
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleConfirmGoBack}
          showHeader={true}
        >
          <p>
            Are you sure you want to leave this page? Any data you entered will be lost.
          </p>
        </Confirm>
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
