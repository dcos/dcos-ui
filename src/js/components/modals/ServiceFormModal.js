import Ace from 'react-ace';
import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import MarathonStore from '../../stores/MarathonStore';
import SchemaForm from '../SchemaForm';
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
  'onMarathonStoreServiceCreateSuccess'
];

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
        events: ['serviceCreateError', 'serviceCreateSuccess']
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

  handleCancel() {
    this.props.onClose();
  }

  handleSubmit() {
    if (this.state.jsonMode) {
      let jsonDefinition = this.state.jsonDefinition;
      MarathonStore.createService(JSON.parse(jsonDefinition));
      this.setState({
        errorMessage: null,
        jsonDefinition,
        service: new Service(JSON.parse(jsonDefinition))
      });
      return;
    }
    if (this.triggerSubmit) {
      let {model} = this.triggerSubmit();
      let service = ServiceUtil.createServiceFromFormModel(model);
      this.setState({service, model, errorMessage: null});
      MarathonStore
        .createService(ServiceUtil.getAppDefinitionFromService(service));
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

    return (
      <div>
        <h4 className="text-align-center text-danger flush-top">
          {errorMessage.message}
        </h4>
        <pre className="text-danger">
          {JSON.stringify(errorMessage.details, null, 2)}
        </pre>
        <button
          className="button button-small button-danger flush-bottom"
          onClick={this.handleClearError}>
          clear
        </button>
      </div>
    );
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
          Deploy
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
      <SchemaForm
        getTriggerSubmit={this.getTriggerSubmit}
        model={model}
        schema={ServiceSchema}/>
    );
  }

  render() {
    let title = 'Deploy new Serivce';

    if (this.props.isEdit) {
      title = 'Edit Service';
    }

    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        maxHeightPercentage={.9}
        bodyClass=""
        modalWrapperClass="multiple-form-modal"
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
