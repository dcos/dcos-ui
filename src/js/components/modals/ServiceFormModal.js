import Ace from 'react-ace';
import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import MarathonStore from '../../stores/MarathonStore';
import ServiceForm from '../ServiceForm';
import Service from '../../structs/Service';
import ServiceUtil from '../../utils/ServiceUtil';
import ServiceSchema from '../../schemas/ServiceSchema';
import ToggleButton from '../ToggleButton';

const METHODS_TO_BIND = [
  'getTriggerSubmit',
  'handleCancel',
  'handleClearError',
  'handleJSONChange',
  'handleJSONToggle',
  'handleSubmit',
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

const responseAttributePathToFieldIdMap = {
  'id': 'appId',
  'apps': 'appId',
  '/id': 'appId',
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
  '/container/docker/portMappings': 'dockerPortMappings',
  '/container/docker/portMappings({INDEX})/containerPort':
    'dockerPortMappings/{INDEX}/port',
  '/container/docker/portMappings({INDEX})/protocol':
    'dockerPortMappings/{INDEX}/protocol',
  '/container/docker/portMappings({INDEX})/hostPort': 'dockerPortMappings',
  '/container/docker/portMappings({INDEX})/servicePort': 'dockerPortMappings',
  '/labels': 'labels',
  '/uris': 'uris',
  '/user': 'user',
  '/': 'general'
};

class ServiceFormModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    let model =
      ServiceUtil.createFormModelFromSchema(ServiceSchema);

    this.state = {
      errorMessage: null,
      jsonDefinition: JSON.stringify({id:'', cmd:''}, null, 2),
      jsonMode: false,
      model,
      service: ServiceUtil.createServiceFromFormModel(model)
    };

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceCreateError',
          'serviceCreateSuccess',
          'serviceEditError',
          'serviceEditSuccess'
        ]
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    if (!this.props.open && nextProps.open) {
      this.resetState();
    }
  }

  resetState() {
    let model = ServiceUtil.createFormModelFromSchema(ServiceSchema);
    let service = ServiceUtil.createServiceFromFormModel(model);
    if (this.props.service) {
      service = this.props.service;
    }
    this.setState({
      errorMessage: null,
      jsonDefinition: JSON.stringify({id:'', cmd:''}, null, 2),
      jsonMode: false,
      model,
      service: service
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
    let service = Object.assign({}, this.state.service);
    try {
      service = new Service(JSON.parse(jsonDefinition));
    } catch (e) {

    }
    this.setState({jsonDefinition, service})
  }

  handleJSONToggle() {
    let nextState = {};
    if (!this.state.jsonMode) {
      let {model} = this.triggerSubmit();
      let service = ServiceUtil.createServiceFromFormModel(model);
      nextState.model = model;
      nextState.service = service;
      nextState.jsonDefinition = JSON.stringify(ServiceUtil
        .getAppDefinitionFromService(service), null, 2);
    }
    nextState.jsonMode = !this.state.jsonMode;
    this.setState(nextState);
  }

  onMarathonStoreServiceCreateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMarathonStoreServiceCreateError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  onMarathonStoreServiceEditSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMarathonStoreServiceEditError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  handleCancel() {
    this.props.onClose();
  }

  handleSubmit() {
    let marathonAction = MarathonStore.createService;

    if (this.props.isEdit) {
      marathonAction = MarathonStore.editService;
    }

    if (this.state.jsonMode) {
      let jsonDefinition = this.state.jsonDefinition;
      marathonAction(JSON.parse(jsonDefinition));
      this.setState({
        errorMessage: null,
        jsonDefinition,
        service: new Service(JSON.parse(jsonDefinition))
      });
      return;
    }
    if (this.triggerSubmit) {
      let {model, isValid} = this.triggerSubmit();
      if (!isValid) {
        return;
      }
      let service = ServiceUtil.createServiceFromFormModel(model);
      this.setState({service, model, errorMessage: null});
      marathonAction(ServiceUtil.getAppDefinitionFromService(service));
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

    let errorList = null;
    if (errorMessage.details != null) {
      errorList = errorMessage.details.map(function ({path, errors}) {
        let fieldId = 'general';

        // Check if attributePath contains an index like path(0)/attribute
        // Matches as defined: [0] : '(0)', [1]: '0'
        let matches = path.match(/\(([0-9]+)\)/);
        if (matches != null) {
          let resolvePath = responseAttributePathToFieldIdMap[
            path.replace(matches[0], '({INDEX})')
          ];
          if (resolvePath != null) {
            fieldId = resolvePath.replace('{INDEX}', matches[1]);
          }
        } else {
          fieldId = responseAttributePathToFieldIdMap[path];
        }
        errors = errors.map(function (error) {
          if (serverResponseMappings[error]) {
            return serverResponseMappings[error];
          }
          return error;
        });

        return (
          <li key={path}>
            {`${fieldId}: ${errors}`}
          </li>
        );
      });
    }

    return (
      <div>
        <div className="error-field text-danger">
          <h4 className="text-align-center text-danger flush-top">
            {errorMessage.message}
          </h4>
          <ul>
            {errorList}
          </ul>
        </div>
      </div>
    );
  }

  getSubmitText() {
    if (this.props.isEdit) {
      return 'Change and deploy configuration';
    }
    return 'Deploy';
  }

  getFooter() {
    return (
      <div className="button-collection flush-bottom">
        <button
          className="button button-large flush-top flush-bottom"
          onClick={this.handleCancel}>
          Cancel
        </button>
        <ToggleButton
          checked={this.state.jsonMode}
          onChange={this.handleJSONToggle}>
          JSON mode
        </ToggleButton>
        <button
          className="button button-large button-success flush-bottom"
          onClick={this.handleSubmit}>
          {this.getSubmitText()}
        </button>
      </div>
    );
  }

  getModalContents() {
    let {jsonDefinition, jsonMode, service} = this.state;

    if (jsonMode) {
      return (
        <Ace editorProps={{$blockScrolling: true}}
          mode="json"
          onChange={this.handleJSONChange}
          showGutter={true}
          showPrintMargin={false}
          theme="monokai"
          value={jsonDefinition}
          width="100%"/>
      );
    }

    let model = ServiceUtil.createFormModelFromSchema(ServiceSchema, service);

    return (
      <ServiceForm
        getTriggerSubmit={this.getTriggerSubmit}
        model={model}
        onChange={this.handleClearError}
        schema={ServiceSchema}/>
    );
  }

  render() {
    let title = 'Deploy new Service';

    if (this.props.isEdit) {
      title = 'Edit Service';
    }

    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        maxHeightPercentage={.9}
        bodyClass=""
        modalWrapperClass="multiple-form-modal service-deploy-modal"
        innerBodyClass=""
        open={this.props.open}
        showCloseButton={false}
        showHeader={true}
        footer={this.getFooter()}
        titleText={title}
        showFooter={true}>
        {this.getErrorMessage()}
        {this.getModalContents()}
      </Modal>
    );
  }
}

ServiceFormModal.defaultProps = {
  isEdit: false,
  onClose: function () {},
  open: false,
  service: null
};

ServiceFormModal.propTypes = {
  isEdit: React.PropTypes.bool,
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceFormModal;
