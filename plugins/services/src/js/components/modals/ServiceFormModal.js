import Ace from "react-ace";
import classNames from "classnames";
import deepEqual from "deep-equal";
import { Hooks } from "PluginSDK";
import { Modal, Tooltip } from "reactjs-components";
import React, { PropTypes } from "react";

import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";

import Config from "../../../../../../src/js/config/Config";
import Icon from "../../../../../../src/js/components/Icon";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import PodSpec from "../../structs/PodSpec";
import Service from "../../structs/Service";
import ServiceForm from "../ServiceForm";
import ServiceSchema from "../../schemas/ServiceSchema";
import ServiceUtil from "../../utils/ServiceUtil";
import ToggleButton from "../../../../../../src/js/components/ToggleButton";
import ErrorPaths from "../../constants/ErrorPaths";
import CollapsibleErrorMessage
  from "../../../../../../src/js/components/CollapsibleErrorMessage";

const SUPPORTED_ONLY_IN_JSON_TEXT =
  "Your config contains attributes we currently only support in the JSON mode.";

const METHODS_TO_BIND = [
  "getTriggerSubmit",
  "handleJSONChange",
  "handleJSONToggle",
  "handleSubmit",
  "handleTabChange"
];

const serverResponseMappings = {
  "error.path.missing": "Specify a path",
  "error.minLength": "Field may not be blank",
  "error.expected.jsnumber": "A number is expected",
  "error.expected.jsstring": "A string is expected"
};

const responseAttributePathToFieldIdMap = Object.assign(
  {
    "/acceptedResourceRoles": "acceptedResourceRoles",
    "/cmd": "cmd",
    "/constraints": "constraints",
    "/constraints({INDEX})": "constraints",
    "/container/docker/forcePullImage": "dockerForcePullImage",
    "/container/docker/image": "dockerImage",
    "/container/docker/network": "dockerNetwork",
    "/container/docker/privileged": "dockerPrivileged",
    "/container/docker/parameters({INDEX})/key": "dockerParameters/{INDEX}/key",
    "/container/docker/parameters": "dockerParameters",
    "/container/docker/parameters({INDEX})/value": "dockerParameters/{INDEX}/value",
    "/container/volumes({INDEX})/containerPath": "containerVolumes/{INDEX}/containerPath",
    "/container/volumes({INDEX})/hostPath": "containerVolumes/{INDEX}/hostPath",
    "/container/volumes({INDEX})/mode": "containerVolumes/{INDEX}/mode",
    "/cpus": "cpus",
    "/disk": "disk",
    "/env": "env",
    "/executor": "executor",
    "/healthChecks({INDEX})/command/value": "healthChecks/{INDEX}/command",
    "/healthChecks({INDEX})/path": "healthChecks/{INDEX}/path",
    "/healthChecks({INDEX})/intervalSeconds": "healthChecks/{INDEX}/intervalSeconds",
    "/healthChecks({INDEX})/port": "healthChecks/{INDEX}/port",
    "/healthChecks({INDEX})/portIndex": "healthChecks/{INDEX}/portIndex",
    "/healthChecks({INDEX})/timeoutSeconds": "healthChecks/{INDEX}/timeoutSeconds",
    "/healthChecks({INDEX})/gracePeriodSeconds": "healthChecks/{INDEX}/gracePeriodSeconds",
    "/healthChecks({INDEX})/maxConsecutiveFailures": "healthChecks/{INDEX}/maxConsecutiveFailures",
    "/instances": "instances",
    "/mem": "mem",
    "/portDefinitions": "portDefinitions",
    "/portDefinitions({INDEX})/name": "portDefinitions/{INDEX}/name",
    "/portDefinitions({INDEX})/port": "portDefinitions/{INDEX}/port",
    "/portDefinitions({INDEX})/protocol": "portDefinitions/{INDEX}/protocol",
    "/value/isResident": "Residency",
    "/value/upgradeStrategy": "Update Strategy",
    "/container/docker/portMappings": "dockerPortMappings",
    "/container/docker/portMappings({INDEX})/containerPort": "dockerPortMappings/{INDEX}/port",
    "/container/docker/portMappings({INDEX})/protocol": "dockerPortMappings/{INDEX}/protocol",
    "/container/docker/portMappings({INDEX})/hostPort": "dockerPortMappings",
    "/container/docker/portMappings({INDEX})/servicePort": "dockerPortMappings",
    "/labels": "labels",
    "/uris": "uris",
    "/user": "user"
  },
  ErrorPaths
);

function didMessageChange(prevMessage, newMessage) {
  return (
    typeof prevMessage !== typeof newMessage ||
    (typeof prevMessage === "object" && !deepEqual(prevMessage, newMessage))
  );
}

class ServiceFormModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      defaultTab: "",
      jsonMode: false,
      serviceSpec: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.resetState();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.open && nextProps.open) {
      this.resetState(nextProps);
    }
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { state, props } = this;

    return (
      props.open !== nextProps.open ||
      state.jsonMode !== nextState.jsonMode ||
      props.isPending !== nextProps.isPending ||
      didMessageChange(props.errors, nextProps.errors) ||
      didMessageChange(state.jsonLockReason, nextState.jsonLockReason)
    );
  }

  resetState(props = this.props) {
    const serviceSpec = props.service.getSpec();

    let jsonLockReason = null;
    let jsonMode = false;
    if (this.shouldDisableForm(serviceSpec)) {
      jsonLockReason = SUPPORTED_ONLY_IN_JSON_TEXT;
      jsonMode = true;
    }

    this.setState(
      {
        defaultTab: "",
        jsonLockReason,
        jsonMode,
        serviceSpec
      },
      this.props.clearError
    );
  }

  handleJSONChange(jsonDefinition) {
    let { serviceSpec } = this.state;

    try {
      serviceSpec = ServiceUtil.createSpecFromDefinition(
        JSON.parse(jsonDefinition)
      );
    } catch (e) {}

    let jsonLockReason = null;

    if (this.shouldDisableForm(serviceSpec)) {
      jsonLockReason = SUPPORTED_ONLY_IN_JSON_TEXT;
    }

    this.setState(
      {
        serviceSpec,
        jsonLockReason
      },
      this.props.clearError
    );
  }

  handleJSONToggle() {
    const nextState = {};
    let { serviceSpec } = this.state;

    if (!this.state.jsonMode) {
      const { model } = this.triggerSubmit();
      serviceSpec = ServiceUtil.createSpecFromFormModel(
        model,
        ServiceSchema,
        this.props.isEdit,
        serviceSpec.get()
      );
    }

    nextState.serviceSpec = serviceSpec;
    if (this.shouldDisableForm(serviceSpec)) {
      nextState.jsonLockReason = SUPPORTED_ONLY_IN_JSON_TEXT;
    } else {
      nextState.jsonMode = !this.state.jsonMode;
    }

    this.setState(nextState);
  }

  handleTabChange(tab) {
    this.setState({ defaultTab: tab });
  }

  shouldDisableForm(serviceSpec) {
    if (serviceSpec instanceof PodSpec) {
      return true;
    }

    const containerSettings = serviceSpec.getContainerSettings();

    const portDefinitions = serviceSpec.getPortDefinitions();

    if (portDefinitions) {
      const invalidVIP = !portDefinitions.some(function(port) {
        if (port.labels == null || Object.keys(port.labels).length === 0) {
          return true;
        }

        return Object.keys(port.labels).some(function(key) {
          return port.labels[key] === `${serviceSpec.getId()}:${port.port}`;
        });
      });
      if (invalidVIP) {
        return true;
      }
    }

    if (
      containerSettings &&
      containerSettings.docker &&
      containerSettings.docker.portMappings
    ) {
      const invalidVIPPortMappings = !containerSettings.docker.portMappings.some(
        function(port) {
          if (port.labels == null || Object.keys(port.labels).length === 0) {
            return true;
          }

          return Object.keys(port.labels).some(function(key) {
            return (
              port.labels[key] ===
              `${serviceSpec.getId()}: ${port.containerPort}`
            );
          });
        }
      );
      if (invalidVIPPortMappings) {
        return true;
      }
    }

    return (
      containerSettings != null &&
      containerSettings.type === "MESOS" &&
      ((containerSettings.docker && containerSettings.docker.image != null) ||
        (containerSettings.appc && containerSettings.appc.image != null))
    );
  }

  shouldForceUpdate(message = this.props.errors) {
    return message && message.message && /force=true/.test(message.message);
  }

  handleSubmit() {
    const { serviceSpec } = this.state;
    const { isEdit, marathonAction, service } = this.props;

    if (this.state.jsonMode) {
      marathonAction(service, serviceSpec, this.shouldForceUpdate());

      return;
    }

    if (this.triggerSubmit) {
      const { model, isValidated } = this.triggerSubmit();

      if (!isValidated) {
        return;
      }

      const serviceSpec = ServiceUtil.createSpecFromFormModel(
        model,
        ServiceSchema,
        isEdit,
        service.getSpec().get() // Work on the original service spec
      );

      marathonAction(service, serviceSpec, this.shouldForceUpdate());
    }
  }

  getTriggerSubmit(triggerSubmit) {
    this.triggerSubmit = triggerSubmit;
  }

  getErrorMessage() {
    // Assign to non-conflicting variable
    const errorDetails = this.props.errors;

    if (!errorDetails) {
      return null;
    }

    // Stringify error details
    let errorList = null;
    if (errorDetails.details != null) {
      const responseMap = Hooks.applyFilter(
        "serviceFormErrorResponseMap",
        responseAttributePathToFieldIdMap
      );
      errorList = errorDetails.details.map(function({ path, errors }) {
        let fieldId = "general";

        // Check if attributePath contains an index like path(0)/attribute
        // Matches as defined: [0] : '(0)', [1]: '0'
        const matches = Hooks.applyFilter(
          "serviceFormMatchErrorPath",
          path.match(/\(([0-9]+)\)/),
          path
        );

        if (matches != null) {
          let resolvePath = responseMap[path.replace(matches[0], "({INDEX})")];

          if (resolvePath == null) {
            resolvePath = responseMap[path.replace(matches[0], "{INDEX}")];
          }
          if (resolvePath != null) {
            fieldId = resolvePath.replace("{INDEX}", matches[1]);
          }
        } else {
          fieldId = responseMap[path] || fieldId;
        }
        errors = errors.map(function(error) {
          if (serverResponseMappings[error]) {
            return serverResponseMappings[error];
          }

          return error;
        });

        // Return path-prefixed error string
        return `${fieldId}: ${errors}`;
      });
    }

    if (this.shouldForceUpdate()) {
      return (
        <CollapsibleErrorMessage
          className="error-for-modal"
          message={`App is currently locked by one or more deployments.
            Press the button again to forcefully change and deploy the new configuration.`}
        />
      );
    }

    return (
      <CollapsibleErrorMessage
        className="error-for-modal"
        details={errorList}
        message={errorDetails.message}
      />
    );
  }

  getSubmitText() {
    if (this.props.isEdit) {
      return "Deploy Changes";
    }

    return "Deploy";
  }

  getFooter() {
    const { onClose, isPending } = this.props;

    const deployButtonClassNames = classNames("button button-large", {
      "button-success": !isPending,
      disabled: isPending
    });

    return (
      <div className="button-collection flush-bottom">
        <button className="button button-large" onClick={onClose}>
          Cancel
        </button>
        <button className={deployButtonClassNames} onClick={this.handleSubmit}>
          {this.getSubmitText()}
        </button>
      </div>
    );
  }

  getModalContents() {
    const { defaultTab, jsonMode, serviceSpec } = this.state;

    if (jsonMode) {
      const jsonDefinition = JSON.stringify(serviceSpec, null, 2);
      const toolTipContent = (
        <div>
          Use the JSON editor to enter Marathon Application definitions manually.
          {" "}
          <a
            href={`${Config.marathonDocsURI}generated/api.html#v2_apps_post`}
            target="_blank"
          >
            View API docs.
          </a>
        </div>
      );

      return (
        <div className="ace-editor-container">
          <Ace
            editorProps={{ $blockScrolling: true }}
            mode="json"
            onChange={this.handleJSONChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="462px"
            value={jsonDefinition}
            width="100%"
          />
          <Tooltip
            content={toolTipContent}
            interactive={true}
            wrapperClassName="tooltip-wrapper media-object-item json-editor-help"
            wrapText={true}
            maxWidth={300}
            position="left"
            scrollContainer=".gm-scroll-view"
          >
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </div>
      );
    }

    const model = ServiceUtil.createFormModelFromSchema(
      ServiceSchema,
      serviceSpec
    );

    return (
      <ServiceForm
        defaultTab={defaultTab}
        getTriggerSubmit={this.getTriggerSubmit}
        model={model}
        onChange={this.props.clearError}
        onTabChange={this.handleTabChange}
        schema={ServiceSchema}
      />
    );
  }

  getToggleButton() {
    let classSet = "modal-form-title-label flush-bottom";
    const { jsonLockReason } = this.state;

    if (jsonLockReason) {
      classSet = `${classSet} disabled`;
    }

    const toggleButton = (
      <ToggleButton
        className={classSet}
        checkboxClassName="toggle-button"
        checked={this.state.jsonMode}
        onChange={this.handleJSONToggle}
      >
        JSON mode
      </ToggleButton>
    );

    if (!jsonLockReason) {
      return toggleButton;
    }

    return (
      <Tooltip
        content={jsonLockReason}
        interactive={true}
        maxWidth={320}
        wrapText={true}
      >
        {toggleButton}
      </Tooltip>
    );
  }

  render() {
    let headerText = "Deploy New Service";

    if (this.props.isEdit) {
      headerText = "Edit Service";
    }

    const header = (
      <div>
        <div className="header-flex">
          <div className="header-left">
            <ModalHeading align="left" level={4}>
              {headerText}
            </ModalHeading>
          </div>
          <div className="header-right">
            {this.getToggleButton()}
          </div>
        </div>
        <div className="header-full-width">
          {this.getErrorMessage()}
        </div>
      </div>
    );

    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        modalWrapperClass="multiple-form-modal modal-form"
        open={this.props.open}
        showHeader={true}
        footer={this.getFooter()}
        header={header}
        scrollContainerClass="multiple-form-modal-body"
        showFooter={true}
        useGemini={false}
      >
        {this.getModalContents()}
      </Modal>
    );
  }
}

ServiceFormModal.defaultProps = {
  isEdit: false,
  onClose() {},
  open: false,
  service: null
};

ServiceFormModal.propTypes = {
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isEdit: PropTypes.bool,
  isPending: PropTypes.bool.isRequired,
  marathonAction: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  service: PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceFormModal;
