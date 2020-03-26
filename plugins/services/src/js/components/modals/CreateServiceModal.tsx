import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import * as React from "react";
import { Confirm } from "reactjs-components";
import { Hooks } from "PluginSDK";
import { routerShape } from "react-router";

import { combineParsers } from "#SRC/js/utils/ParserUtil";
import { combineReducers } from "#SRC/js/utils/ReducerUtil";
import { DCOS_CHANGE } from "#SRC/js/constants/EventTypes";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import AppValidators from "#SRC/resources/raml/marathon/v2/types/app.raml";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import PodValidators from "#SRC/resources/raml/marathon/v2/types/pod.raml";
import ToggleButton from "#SRC/js/components/ToggleButton";
import UserSettingsStore from "#SRC/js/stores/UserSettingsStore";
import Util from "#SRC/js/utils/Util";

import Application from "../../structs/Application";
import ApplicationSpec from "../../structs/ApplicationSpec";
import PodSpec from "../../structs/PodSpec";
import Service from "../../structs/Service";

import MarathonActions from "../../events/MarathonActions";
import MarathonStore from "../../stores/MarathonStore";
import {
  MARATHON_SERVICE_CREATE_ERROR,
  MARATHON_SERVICE_CREATE_SUCCESS,
  MARATHON_SERVICE_EDIT_ERROR,
  MARATHON_SERVICE_EDIT_SUCCESS,
} from "../../constants/EventTypes";

import { DEFAULT_APP_SPEC } from "../../constants/DefaultApp";
import { DEFAULT_POD_SPEC } from "../../constants/DefaultPod";

import ContainerServiceFormSection from "../forms/ContainerServiceFormSection";
import CreateServiceJsonOnly from "./CreateServiceJsonOnly";
import EnvironmentFormSection from "../forms/EnvironmentFormSection";
import MarathonAppValidators from "../../validators/MarathonAppValidators";
import MarathonPodValidators from "../../validators/MarathonPodValidators";
import MarathonErrorUtil from "../../utils/MarathonErrorUtil";
import CreateServiceModalServicePicker from "./CreateServiceModalServicePicker";
import CreateServiceModalForm from "./CreateServiceModalForm";
import ServiceConfigDisplay from "../../service-configuration/ServiceConfigDisplay";
import GeneralServiceFormSection from "../forms/GeneralServiceFormSection";
import HealthChecksFormSection from "../forms/HealthChecksFormSection";
import JSONSingleContainerReducers from "../../reducers/JSONSingleContainerReducers";
import JSONMultiContainerParser from "../../reducers/JSONMultiContainerParser";
import JSONMultiContainerReducers from "../../reducers/JSONMultiContainerReducers";
import JSONSingleContainerParser from "../../reducers/JSONSingleContainerParser";
import MultiContainerNetworkingFormSection from "../forms/MultiContainerNetworkingFormSection";
import MultiContainerVolumesFormSection from "../forms/MultiContainerVolumesFormSection";
import NetworkingFormSection from "../forms/NetworkingFormSection";
import * as ServiceErrorTypes from "../../constants/ServiceErrorTypes";
import VolumesFormSection from "../forms/VolumesFormSection";
import VipLabelsValidators from "../../validators/VipLabelsValidators";
import PlacementsValidators from "../../validators/PlacementsValidators";
import { getBaseID, getServiceJSON } from "../../utils/ServiceUtil";

const APP_VALIDATORS = [
  AppValidators.App,
  MarathonAppValidators.containsCmdArgsOrContainer,
  MarathonAppValidators.mustContainImageOnDocker,
  MarathonAppValidators.validateConstraints,
  MarathonAppValidators.validateLabels,
  MarathonAppValidators.mustNotContainUris,
  MarathonAppValidators.validateProfileVolumes,
  VipLabelsValidators.mustContainPort,
];

const POD_VALIDATORS = [
  PodValidators.Pod,
  MarathonPodValidators.validateProfileVolumes,
  VipLabelsValidators.mustContainPort,
  PlacementsValidators.mustHaveUniqueOperatorField,
];

class CreateServiceModal extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };
  constructor(...args) {
    super(...args);

    this.state = this.getResetState(this.props);
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { location, params } = this.props;
    // Skip update if there was no change to props
    if (
      nextProps.location.pathname === location.pathname &&
      isEqual(nextProps.params, params)
    ) {
      return;
    }

    this.setState(this.getResetState(nextProps));
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    const requestCompleted = this.state.isPending && !nextState.isPending;
    const shouldClose = requestCompleted && !nextState.apiErrors.length;

    if (shouldClose) {
      const serviceID = nextProps.params.id || "";

      const { path } = nextProps.route;
      const routePrefix = path.startsWith("edit")
        ? // When edit: navigate to the detail of the service which was edited
          "/services/detail/"
        : // When create: navigate to the group service was created in
          "/services/overview/";
      this.context.router.push(routePrefix + encodeURIComponent(serviceID));
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
  onMarathonStoreServiceCreateError = (errors) => {
    this.setState({
      apiErrors: MarathonErrorUtil.parseErrors(errors),
      isPending: false,
    });
  };
  onMarathonStoreServiceCreateSuccess = () => {
    this.setState({ apiErrors: [], isPending: false });
  };
  onMarathonStoreServiceEditError = (errors) => {
    this.setState({
      apiErrors: MarathonErrorUtil.parseErrors(errors),
      isPending: false,
    });
  };
  onMarathonStoreServiceEditSuccess = () => {
    this.setState({ apiErrors: [], isPending: false });
  };

  shouldForceSubmit() {
    return this.state.apiErrors.some(
      (error) => error.type === ServiceErrorTypes.SERVICE_DEPLOYING
    );
  }
  handleRouterWillLeave = () => {
    const { isOpen, hasChangesApplied, serviceReviewActive } = this.state;
    // If we are not about to close the modal and not on the review screen,
    // confirm before navigating away
    if (isOpen && hasChangesApplied && !serviceReviewActive) {
      this.handleOpenConfirm();

      // Cancel route change, if it is already open
      return false;
    }

    return true;
  };
  handleConfirmGoBack = () => {
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
        serviceFormActive: false,
      });

      return;
    }

    // Switch back from JSON to picker
    if (serviceJsonActive) {
      this.setState({
        isConfirmOpen: false,
        hasChangesApplied: false,
        servicePickerActive: true,
        serviceJsonActive: false,
      });
    }
  };
  handleStoreChange = () => {
    // Unsubscribe from further events
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.handleStoreChange);

    const { params } = this.props;
    const serviceID = decodeURIComponent(params.id || "/");
    const service = DCOSStore.serviceTree.findItemById(serviceID);

    this.setState({ service, serviceSpec: service.getSpec() });
  };
  handleGoBack = (event) => {
    const { tabViewID } = event;
    const {
      hasChangesApplied,
      serviceFormActive,
      servicePickerActive,
      serviceReviewActive,
    } = this.state;

    if (serviceReviewActive) {
      // Remove the 'Application is deploying' error when we havigate back
      // since it's not related to the form
      const apiErrors = this.state.apiErrors.filter(
        (error) => error.type !== ServiceErrorTypes.SERVICE_DEPLOYING
      );

      // Just hide review screen. Form or JSON mode will be
      // activated automatically depending on their last state
      this.setState({
        activeTab: tabViewID,
        apiErrors,
        serviceReviewActive: false,
        showAllErrors: true,
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
  };
  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  };
  handleClearError = () => {
    this.setState({
      apiErrors: [],
      showAllErrors: false,
    });
  };

  handleOpenConfirm() {
    this.setState({ isConfirmOpen: true });
  }
  handleCloseConfirmModal = () => {
    this.setState({ isConfirmOpen: false });
  };

  handleClose = () => {
    // Start the animation of the modal by setting isOpen to false
    this.setState({ isConfirmOpen: false, isOpen: false }, () => {
      // Once state is set, start a timer for the length of the animation and
      // navigate away once the animation is over.
      setTimeout(this.context.router.goBack, 300);
    });
  };
  handleConvertToPod = () => {
    this.handleServiceSelection({ type: "pod" });
  };
  handleJSONToggle = () => {
    UserSettingsStore.setJSONEditorExpandedSetting(
      !this.state.isJSONModeActive
    );
    this.setState({ isJSONModeActive: !this.state.isJSONModeActive });
  };
  handleServiceChange = (newService) => {
    // If there were previous error messages visible it's better to revalidate
    // on each change going forward
    const formErrors = this.state.submitFailed
      ? this.validateServiceSpec(newService)
      : [];

    this.setState({
      serviceSpec: newService,
      hasChangesApplied: true,
      formErrors,
    });
  };
  handleServiceErrorsChange = (errors) => {
    this.setState({ serviceFormErrors: errors });
  };
  handleServicePropertyChange = (path) => {
    const refPath = path.join(".");
    let { apiErrors } = this.state;

    apiErrors = apiErrors.filter((error) => {
      const errorPath = error.path.join(".");

      // Remove all root errors on a simple update
      if (errorPath === "") {
        return false;
      }

      // Otherwise remove errors on the given path
      return errorPath !== refPath;
    });

    this.setState({ apiErrors });
  };
  handleServiceSelection = (event) => {
    const { route, type } = event;
    const { params } = this.props;
    const baseID = getBaseID(decodeURIComponent(params.id || "/"));

    switch (type) {
      case "app":
        this.setState({
          activeTab: null,
          apiErrors: [],
          formErrors: [],
          serviceFormErrors: [],
          servicePickerActive: false,
          serviceFormActive: true,
          serviceSpec: new ApplicationSpec({
            id: baseID,
            ...DEFAULT_APP_SPEC,
          }),
          showAllErrors: false,
        });
        break;

      case "pod":
        this.setState({
          activeTab: null,
          apiErrors: [],
          formErrors: [],
          serviceFormErrors: [],
          servicePickerActive: false,
          serviceFormActive: true,
          serviceSpec: new PodSpec({
            id: baseID,
            ...DEFAULT_POD_SPEC,
          }),
          showAllErrors: false,
        });
        break;

      case "json":
        this.setState({
          activeTab: null,
          apiErrors: [],
          formErrors: [],
          serviceFormErrors: [],
          servicePickerActive: false,
          serviceJsonActive: true,
          serviceSpec: new ApplicationSpec({
            id: baseID,
            ...DEFAULT_APP_SPEC,
          }),
          showAllErrors: false,
        });
        break;

      case "redirect":
        this.context.router.push(route);
        break;
    }
  };
  handleServiceReview = () => {
    const expandAdvancedSettings = this.getExpandAdvancedSettings();

    if (this.criticalFormErrors().length === 0) {
      this.setState({
        apiErrors: [],
        formErrors: [],
        serviceReviewActive: true,
        expandAdvancedSettings,
      });
    } else {
      this.setState({
        showAllErrors: true,
        submitFailed: true,
        formErrors: this.validateServiceSpec(this.state.serviceSpec),
        expandAdvancedSettings,
      });
    }
  };
  handleServiceRun = () => {
    const { location } = this.props;
    const { service, serviceSpec } = this.state;
    const force = this.shouldForceSubmit();
    if (this.isLocationEdit(location) && service instanceof Service) {
      MarathonActions.editService(service, serviceSpec, force);
    } else {
      MarathonActions.createService(serviceSpec, force);
    }

    this.setState({ isPending: true });
  };
  getExpandAdvancedSettings = () => {
    // If we have errors inside the advanced options, expand the options to allow the user to see the errors.
    const { serviceSpec } = this.state;
    const isDockerContainer =
      Util.findNestedPropertyInObject(serviceSpec, "container.type") ===
      "DOCKER";

    return this.criticalFormErrors().some(
      ({ path }) =>
        isEqual(path, ["gpus"]) ||
        isEqual(path, ["disk"]) ||
        (isDockerContainer && isEqual(path, ["container", "docker", "image"]))
    );
  };

  isLocationEdit(location) {
    return location.pathname.includes("/edit");
  }

  /**
   * Determines whether or not the form can be submitted
   * @returns {array} of critical errors that are present
   */
  criticalFormErrors() {
    const formErrors = this.validateServiceSpec(this.state.serviceSpec);
    const criticalFormErrors = formErrors.filter(
      (error) => !error.isPermissive
    );

    return criticalFormErrors.concat(this.state.serviceFormErrors);
  }

  /**
   * This function returns errors produced by the form validators
   * @param {Object} serviceSpec The service spec to validate
   * @returns {Array} - An array of error objects
   */
  validateServiceSpec(serviceSpec) {
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

    return validationErrors;
  }

  /**
   * This function combines the errors received from marathon and the errors
   * produced by the form into a unified error array
   *
   * @returns {Array} - An array of error objects
   */
  getAllErrors() {
    return this.state.apiErrors
      .concat(this.state.formErrors)
      .concat(this.state.serviceFormErrors);
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
            <Trans render="span">Review & Run Service</Trans>
          </FullScreenModalHeaderTitle>
          <FullScreenModalHeaderActions
            actions={this.getPrimaryActions()}
            type="primary"
          />
        </FullScreenModalHeader>
      );
    }

    let title = <Trans render="span">Run a Service</Trans>;
    const { location } = this.props;
    const { service } = this.state;

    if (this.isLocationEdit(location)) {
      title = service ? (
        <Trans render="span">Edit {service.getName()}</Trans>
      ) : (
        <Trans render="span">Edit Service</Trans>
      );
    }

    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={this.getSecondaryActions()}
          type="secondary"
        />
        <FullScreenModalHeaderTitle>{title}</FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={this.getPrimaryActions()}
          type="primary"
        />
      </FullScreenModalHeader>
    );
  }
  resetExpandAdvancedSettings = () => {
    // Reset, otherwise every change in the form will open the advanced options
    // after they are opened once
    if (this.state.expandAdvancedSettings) {
      this.setState({ expandAdvancedSettings: false });
    }
  };

  getModalContent() {
    const {
      isJSONModeActive,
      serviceSpec,
      serviceFormActive,
      serviceJsonActive,
      servicePickerActive,
      serviceReviewActive,
      expandAdvancedSettings,
    } = this.state;

    // NOTE: Always prioritize review screen check
    if (serviceReviewActive) {
      return (
        <div className="flex-item-grow-1">
          <div className="container">
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
        <CreateServiceModalServicePicker
          onServiceSelect={this.handleServiceSelection}
        />
      );
    }

    if (serviceFormActive) {
      const { location } = this.props;
      const { showAllErrors } = this.state;

      const SINGLE_CONTAINER_SECTIONS = [
        ContainerServiceFormSection,
        EnvironmentFormSection,
        GeneralServiceFormSection,
        HealthChecksFormSection,
        NetworkingFormSection,
        VolumesFormSection,
      ];

      const MULTI_CONTAINER_SECTIONS = [
        ContainerServiceFormSection,
        EnvironmentFormSection,
        GeneralServiceFormSection,
        HealthChecksFormSection,
        NetworkingFormSection,
        VolumesFormSection,
        MultiContainerVolumesFormSection,
        MultiContainerNetworkingFormSection,
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
            Object.assign(
              {},
              ...MULTI_CONTAINER_SECTIONS.map((item) => item.configReducers)
            )
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
          Hooks.applyFilter(
            "serviceJsonConfigReducers",
            JSONSingleContainerReducers
          )
        );

        inputConfigReducers = combineReducers(
          Hooks.applyFilter(
            "serviceInputConfigReducers",
            Object.assign(
              {},
              ...SINGLE_CONTAINER_SECTIONS.map((item) => item.configReducers)
            )
          )
        );
      }

      return (
        <CreateServiceModalForm
          activeTab={this.state.activeTab}
          errors={this.getAllErrors()}
          expandAdvancedSettings={expandAdvancedSettings}
          jsonParserReducers={jsonParserReducers}
          jsonConfigReducers={jsonConfigReducers}
          handleTabChange={this.handleTabChange}
          inputConfigReducers={inputConfigReducers}
          isEdit={this.isLocationEdit(location)}
          isJSONModeActive={isJSONModeActive}
          ref={(ref) => (this.createComponent = ref)}
          onChange={this.handleServiceChange}
          onConvertToPod={this.handleConvertToPod}
          onErrorsChange={this.handleServiceErrorsChange}
          service={serviceSpec}
          showAllErrors={showAllErrors}
          resetExpandAdvancedSettings={this.resetExpandAdvancedSettings}
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
          ref={(ref) => (this.createComponent = ref)}
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
      serviceReviewActive,
    } = this.state;

    const force = this.shouldForceSubmit();
    const runButtonLabel = force
      ? i18nMark("Force Run Service")
      : i18nMark("Run Service");
    const runButtonClassNames = classNames("flush-vertical", {
      "button-primary": !force,
      "button-danger": force,
    });

    // NOTE: Always prioritize review screen check
    if (serviceReviewActive) {
      return [
        {
          className: runButtonClassNames,
          clickHandler: this.handleServiceRun,
          label: this.state.isPending
            ? i18nMark("Deploying...")
            : runButtonLabel,
          disabled: this.state.isPending,
        },
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
              <Trans render="span">JSON Editor</Trans>
            </ToggleButton>
          ),
        },
        {
          className: "button-primary flush-vertical",
          clickHandler: this.handleServiceReview,
          label: i18nMark("Review & Run"),
        },
      ];
    }

    if (serviceJsonActive) {
      return [
        {
          className: "button-primary flush-vertical",
          clickHandler: this.handleServiceReview,
          label: i18nMark("Review & Run"),
        },
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
    let serviceSpec = new ApplicationSpec({
      id: getBaseID(serviceID),
      ...DEFAULT_APP_SPEC,
    });

    if (isEdit && service instanceof Service && !isSpecificVersion) {
      serviceSpec = service.getSpec();
    }

    if (isEdit && isSpecificVersion) {
      serviceSpec = service
        .constructor(service.getVersions().get(params.version))
        .getSpec();
    }

    const newState = {
      activeTab: null,
      apiErrors: [],
      expandAdvancedSettings: false,
      formErrors: [], // Errors detected by form validation
      hasChangesApplied: false,
      isConfirmOpen: false,
      isJSONModeActive: UserSettingsStore.JSONEditorExpandedSetting,
      isOpen: true,
      isPending: false,
      submitDisabled: false,
      service,
      serviceSpec,
      serviceFormActive: isEdit, // Switch directly to form/json if edit
      serviceFormErrors: [],
      serviceJsonActive: false,
      servicePickerActive: !isEdit, // Switch directly to form/json if edit
      serviceReviewActive: false,
      serviceFormHasErrors: false,
      showAllErrors: false,
      submitFailed: false, // Tried to submit form and form validation failed
    };

    return newState;
  }

  getSecondaryActions() {
    const { location } = this.props;
    const { servicePickerActive, serviceReviewActive } = this.state;
    let label = i18nMark("Back");

    if (
      servicePickerActive ||
      (this.isLocationEdit(location) && !serviceReviewActive)
    ) {
      label = i18nMark("Cancel");
    }

    return [
      {
        className: "button-primary-link button-flush-horizontal",
        clickHandler: this.handleGoBack,
        label,
      },
    ];
  }

  render() {
    const { props } = this;
    const {
      hasChangesApplied,
      isOpen,
      servicePickerActive,
      serviceReviewActive,
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
        {...Util.omit(props, Object.keys(CreateServiceModal.propTypes))}
      >
        {this.getModalContent()}
        <Confirm
          closeByBackdropClick={true}
          header={
            <ModalHeading>
              <Trans render="span">Discard Changes?</Trans>
            </ModalHeading>
          }
          open={this.state.isConfirmOpen}
          onClose={this.handleCloseConfirmModal}
          leftButtonText={props.i18n._(t`Cancel`)}
          leftButtonClassName="button button-primary-link flush-left"
          leftButtonCallback={this.handleCloseConfirmModal}
          rightButtonText={props.i18n._(t`Discard`)}
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleConfirmGoBack}
          showHeader={true}
        >
          <Trans render="p">
            Are you sure you want to leave this page? Any data you entered will{" "}
            be lost.
          </Trans>
        </Confirm>
      </FullScreenModal>
    );
  }
}

CreateServiceModal.contextTypes = {
  router: routerShape,
};

export default withI18n()(CreateServiceModal);
