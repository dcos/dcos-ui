import Ace from 'react-ace';
import classNames from 'classnames';
import deepEqual from 'deep-equal';
import {Hooks} from 'PluginSDK';
import mixin from 'reactjs-mixin';
import {Modal, Tooltip} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import Config from '../../config/Config';
import CollapsibleErrorMessage from '../CollapsibleErrorMessage';
import Icon from '../Icon';
import MarathonStore from '../../stores/MarathonStore';
import PodSpec from '../../structs/PodSpec';
import Service from '../../structs/Service';
import ServiceForm from '../ServiceForm';
import ServiceSchema from '../../schemas/ServiceSchema';
import ServiceUtil from '../../utils/ServiceUtil';
import ToggleButton from '../ToggleButton';
import ErrorPaths from '../../constants/ErrorPaths';

const METHODS_TO_BIND = [
  'getTriggerSubmit',
  'handleCancel',
  'handleClearError',
  'handleJSONChange',
  'handleJSONToggle',
  'handleSubmit',
  'handleTabChange',
  'onMarathonStoreServiceCreateError',
  'onMarathonStoreServiceCreateSuccess',
  'onMarathonStoreServiceEditError',
  'onMarathonStoreServiceEditSuccess'
];

const serverResponseMappings = {
  'error.path.missing': 'Specify a path',
  'error.minLength': 'Field may not be blank',
  'error.expected.jsnumber': 'A number is expected',
  'error.expected.jsstring': 'A string is expected'
};

const responseAttributePathToFieldIdMap = Object.assign({
  '/acceptedResourceRoles': 'acceptedResourceRoles',
  '/cmd': 'cmd',
  '/constraints': 'constraints',
  '/constraints({INDEX})': 'constraints',
  '/container/docker/forcePullImage': 'dockerForcePullImage',
  '/container/docker/image': 'dockerImage',
  '/container/docker/network': 'dockerNetwork',
  '/container/docker/privileged': 'dockerPrivileged',
  '/container/docker/parameters({INDEX})/key':
    'dockerParameters/{INDEX}/key',
  '/container/docker/parameters': 'dockerParameters',
  '/container/docker/parameters({INDEX})/value':
    'dockerParameters/{INDEX}/value',
  '/container/volumes({INDEX})/containerPath':
    'containerVolumes/{INDEX}/containerPath',
  '/container/volumes({INDEX})/hostPath':
    'containerVolumes/{INDEX}/hostPath',
  '/container/volumes({INDEX})/mode':
    'containerVolumes/{INDEX}/mode',
  '/cpus': 'cpus',
  '/disk': 'disk',
  '/env': 'env',
  '/executor': 'executor',
  '/healthChecks({INDEX})/command/value':
    'healthChecks/{INDEX}/command',
  '/healthChecks({INDEX})/path':
    'healthChecks/{INDEX}/path',
  '/healthChecks({INDEX})/intervalSeconds':
    'healthChecks/{INDEX}/intervalSeconds',
  '/healthChecks({INDEX})/port':
    'healthChecks/{INDEX}/port',
  '/healthChecks({INDEX})/portIndex':
    'healthChecks/{INDEX}/portIndex',
  '/healthChecks({INDEX})/timeoutSeconds':
    'healthChecks/{INDEX}/timeoutSeconds',
  '/healthChecks({INDEX})/gracePeriodSeconds':
    'healthChecks/{INDEX}/gracePeriodSeconds',
  '/healthChecks({INDEX})/maxConsecutiveFailures':
    'healthChecks/{INDEX}/maxConsecutiveFailures',
  '/instances': 'instances',
  '/mem': 'mem',
  '/portDefinitions': 'portDefinitions',
  '/portDefinitions({INDEX})/name': 'portDefinitions/{INDEX}/name',
  '/portDefinitions({INDEX})/port': 'portDefinitions/{INDEX}/port',
  '/portDefinitions({INDEX})/protocol': 'portDefinitions/{INDEX}/protocol',
  '/value/isResident': 'Residency',
  '/value/upgradeStrategy': 'Update Strategy',
  '/container/docker/portMappings': 'dockerPortMappings',
  '/container/docker/portMappings({INDEX})/containerPort':
    'dockerPortMappings/{INDEX}/port',
  '/container/docker/portMappings({INDEX})/protocol':
    'dockerPortMappings/{INDEX}/protocol',
  '/container/docker/portMappings({INDEX})/hostPort': 'dockerPortMappings',
  '/container/docker/portMappings({INDEX})/servicePort': 'dockerPortMappings',
  '/labels': 'labels',
  '/uris': 'uris',
  '/user': 'user'
}, ErrorPaths);

function didMessageChange(prevMessage, newMessage) {
  return (typeof prevMessage !== typeof newMessage) ||
         ((typeof prevMessage === 'object') &&
          !deepEqual(prevMessage, newMessage));
}

class ServiceFormModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      defaultTab: '',
      errorMessage: null,
      jsonMode: false,
      pendingRequest: false,
      serviceSpec: null
    };

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceCreateError',
          'serviceCreateSuccess',
          'serviceEditError',
          'serviceEditSuccess'
        ],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.resetState();
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    if (!this.props.open && nextProps.open) {
      this.resetState(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {state, props} = this;
    return props.open !== nextProps.open ||
      state.jsonMode !== nextState.jsonMode ||
      state.pendingRequest !== nextState.pendingRequest ||
      didMessageChange(state.errorMessage, nextState.errorMessage) ||
      didMessageChange(state.warningMessage, nextState.warningMessage);
  }

  resetState(props = this.props) {
    let serviceSpec = props.service.getSpec();

    let warningMessage = null;
    let jsonMode = false;
    if (this.shouldDisableForm(serviceSpec)) {
      warningMessage = {
        message: 'Your config contains attributes we currently only support ' +
        'in the JSON mode.'
      };
      jsonMode = true;
    }

    this.setState({
      defaultTab: '',
      warningMessage,
      errorMessage: null,
      force: false,
      jsonMode,
      pendingRequest: false,
      serviceSpec
    });
  }

  handleClearError() {
    if (this.state.errorMessage == null) {
      return;
    }
    this.setState({
      errorMessage: null
    });
  }

  handleJSONChange(jsonDefinition) {
    let {serviceSpec} = this.state;

    try {
      serviceSpec = ServiceUtil.createSpecFromDefinition(
        JSON.parse(jsonDefinition));
    } catch (e) {
    }

    let warningMessage = null;

    if (this.shouldDisableForm(serviceSpec)) {
      warningMessage = {
        message: 'Your config contains attributes we currently only support ' +
        'in the JSON mode.'
      };
    }

    this.setState(
      {
        serviceSpec,
        errorMessage: null,
        warningMessage
      }
    );
  }

  handleJSONToggle() {
    let nextState = {};
    let {serviceSpec} = this.state;

    if (!this.state.jsonMode) {
      let {model} = this.triggerSubmit();
      serviceSpec = ServiceUtil.createSpecFromFormModel(
        model,
        ServiceSchema,
        this.props.isEdit,
        serviceSpec.get()
      );
    }

    nextState.serviceSpec = serviceSpec;
    if (this.shouldDisableForm(serviceSpec)) {
      nextState.warningMessage = {
        message: 'Your config contains attributes we currently only support ' +
        'in the JSON mode.'
      };
    } else {
      nextState.jsonMode = !this.state.jsonMode;
    }

    this.setState(nextState);
  }

  handleTabChange(tab) {
    this.setState({defaultTab: tab});
  }

  onMarathonStoreServiceCreateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMarathonStoreServiceCreateError(errorMessage) {
    this.setState({
      errorMessage,
      pendingRequest: false
    });
  }

  shouldDisableForm(serviceSpec) {
    if (serviceSpec instanceof PodSpec) {
      return true;
    }

    let containerSettings = serviceSpec.getContainerSettings();

    let portDefinitions = serviceSpec.getPortDefinitions();

    if (portDefinitions) {
      let invalidVIP = !portDefinitions.some(function (port) {
        if (port.labels == null || Object.keys(port.labels).length === 0) {
          return true;
        }
        return Object.keys(port.labels).some(function (key) {
          return port.labels[key] === `${serviceSpec.getId()}:${port.port}`;
        });
      });
      if (invalidVIP) {
        return true;
      }
    }

    if (containerSettings && containerSettings.docker && containerSettings.docker.portMappings) {
      let invalidVIPPortMappings = !containerSettings.docker.portMappings.some(function (port) {
        if (port.labels == null || Object.keys(port.labels).length === 0) {
          return true;
        }
        return Object.keys(port.labels).some(function (key) {
          return port.labels[key] === `${serviceSpec.getId()}:` +
              `${port.containerPort}`;
        });
      });
      if (invalidVIPPortMappings) {
        return true;
      }
    }

    return containerSettings != null && containerSettings.type === 'MESOS' && (
      (containerSettings.docker && containerSettings.docker.image != null) ||
      (containerSettings.appc && containerSettings.appc.image != null)
    );
  }

  shouldForceUpdate(message = this.state.errorMessage) {
    return message && message.message && /force=true/.test(message.message);
  }

  onMarathonStoreServiceEditSuccess() {
    this.props.onClose();
    this.resetState();
  }

  onMarathonStoreServiceEditError(errorMessage) {
    if (!this.props.open) {
      return;
    }
    this.setState({
      errorMessage,
      force: this.shouldForceUpdate(errorMessage),
      pendingRequest: false
    });
  }

  handleCancel() {
    this.props.onClose();
  }

  handleSubmit() {
    const {force, serviceSpec} = this.state;
    const {isEdit, service} = this.props;
    let marathonAction = MarathonStore.createService;

    if (isEdit) {
      marathonAction = MarathonStore.editService.bind(MarathonStore, service);
    }

    if (this.state.jsonMode) {
      marathonAction(serviceSpec, force);
      this.setState({
        errorMessage: null,
        pendingRequest: true
      });
      return;
    }

    if (this.triggerSubmit) {
      let {model, isValidated} = this.triggerSubmit();

      if (!isValidated) {
        return;
      }
      let serviceSpec = ServiceUtil.createSpecFromFormModel(
        model,
        ServiceSchema,
        this.props.isEdit,
        this.props.service.getSpec().get() // Work on the original service spec
      );
      marathonAction(
        serviceSpec,
        this.state.force
      );
    }
  }

  getTriggerSubmit(triggerSubmit) {
    this.triggerSubmit = triggerSubmit;
  }

  getErrorMessage() {
    let {errorMessage} = this.state;
    if (!errorMessage) {
      return null;
    }

    // Stringify error details
    let errorList = null;
    if (errorMessage.details != null) {
      let responseMap = Hooks.applyFilter(
        'serviceFormErrorResponseMap',
        responseAttributePathToFieldIdMap
      );
      errorList = errorMessage.details.map(function ({path, errors}) {
        let fieldId = 'general';

        // Check if attributePath contains an index like path(0)/attribute
        // Matches as defined: [0] : '(0)', [1]: '0'
        let matches = Hooks.applyFilter('serviceFormMatchErrorPath',
          path.match(/\(([0-9]+)\)/),
          path
        );

        if (matches != null) {
          let resolvePath = responseMap[
            path.replace(matches[0], '({INDEX})')
          ];

          if (resolvePath == null) {
            resolvePath = responseMap[
              path.replace(matches[0], '{INDEX}')
            ];
          }
          if (resolvePath != null) {
            fieldId = resolvePath.replace('{INDEX}', matches[1]);
          }
        } else {
          fieldId = responseMap[path] || fieldId;
        }
        errors = errors.map(function (error) {
          if (serverResponseMappings[error]) {
            return serverResponseMappings[error];
          }
          return error;
        });

        // Return path-prefixed error string
        return `${fieldId}: ${errors}`;

      });
    }

    if (this.shouldForceUpdate(errorMessage)) {
      return (
        <CollapsibleErrorMessage
          className="error-for-modal"
          message={`App is currently locked by one or more deployments.
            Press the button again to forcefully change and deploy the new configuration.`} />
      );
    }

    return (
      <CollapsibleErrorMessage
        className="error-for-modal"
        details={errorList}
        message={errorMessage.message} />
    );

  }

  getSubmitText() {
    if (this.props.isEdit) {
      return 'Deploy Changes';
    }
    return 'Deploy';
  }

  getFooter() {
    let {pendingRequest} = this.state;
    let deployButtonClassNames = classNames('button button-large',
      {
        'button-success': !pendingRequest,
        'disabled': pendingRequest
      }
    );

    return (
      <div className="button-collection flush-bottom">
        <button
          className="button button-large"
          onClick={this.handleCancel}>
          Cancel
        </button>
        <button
          className={deployButtonClassNames}
          onClick={this.handleSubmit}>
          {this.getSubmitText()}
        </button>
      </div>
    );
  }

  getModalContents() {
    let {defaultTab, jsonMode, serviceSpec} = this.state;

    if (jsonMode) {
      let jsonDefinition = JSON.stringify(serviceSpec, null, 2);
      let toolTipContent = (
        <div>
          Use the JSON editor to enter Marathon Application definitions manually.
          {' '}
          <a href={`${Config.marathonDocsURI}generated/api.html#v2_apps_post`} target="_blank">
            View API docs.
          </a>
        </div>
      );

      return (
        <div className="ace-editor-container">
          <Ace editorProps={{$blockScrolling: true}}
            mode="json"
            onChange={this.handleJSONChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="462px"
            value={jsonDefinition}
            width="100%"/>
          <Tooltip
            content={toolTipContent}
            interactive={true}
            wrapperClassName="tooltip-wrapper media-object-item json-editor-help"
            wrapText={true}
            maxWidth={300}
            position="left"
            scrollContainer=".gm-scroll-view">
            <Icon color="grey" id="ring-question" size="mini" family="mini" />
          </Tooltip>
        </div>
      );
    }

    let model = ServiceUtil.createFormModelFromSchema(
      ServiceSchema,
      serviceSpec
    );

    return (
      <ServiceForm
        defaultTab={defaultTab}
        getTriggerSubmit={this.getTriggerSubmit}
        model={model}
        onChange={this.handleClearError}
        onTabChange={this.handleTabChange}
        schema={ServiceSchema}/>
    );
  }

  getToggleButton() {
    let classSet = 'modal-form-title-label flush-bottom';

    if (this.shouldDisableForm(this.state.serviceSpec)) {
      classSet = `${classSet} disabled`;
    }

    return (<ToggleButton
      className={classSet}
      checkboxClassName="toggle-button"
      checked={this.state.jsonMode}
      onChange={this.handleJSONToggle}>
      JSON mode
    </ToggleButton>);
  }

  getWarningMessage() {
    let {warningMessage} = this.state;
    if (!warningMessage) {
      return null;
    }

    return (
      <div>
        <div className="warning-field">
          <div className="text-align-center flush-top">
            {warningMessage.message}
          </div>
        </div>
      </div>
    );
  }

  render() {
    let headerText = 'Deploy New Service';

    if (this.props.isEdit) {
      headerText = 'Edit Service';
    }

    let header = (
      <div className="modal-header-title">
        <div className="header-flex">
          <div className="header-left">
            <span className="h4 flush-top flush-bottom text-color-neutral">
              {headerText}
            </span>
          </div>
          <div className="header-right">
            {this.getToggleButton()}
          </div>
        </div>
        <div className="header-full-width">
          {this.getErrorMessage()}
          {this.getWarningMessage()}
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
        useGemini={false}>
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
  isEdit: React.PropTypes.bool,
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceFormModal;
