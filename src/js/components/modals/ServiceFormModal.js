import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';
import Ace from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import AdvancedConfig from '../AdvancedConfig';
import MarathonStore from '../../stores/MarathonStore';
import Service from '../../structs/Service';
import ServiceUtil from '../../utils/ServiceUtil';
import ServiceSchema from '../../constants/ServiceSchema';
import ToggleButton from '../ToggleButton';

const METHODS_TO_BIND = [
  'handleChange',
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
      service: ServiceUtil.createServiceFromFormModel(model),
      model: model,
      json: false,
      app: JSON.stringify({id:'', cmd:''}, null, 2),
      errorMessage: null
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
    let {props} = this;
    if (!props.open && nextProps.open) {
      this.resetState();
    }
  }

  resetState() {
    let model = ServiceUtil.createFormModelFromSchema(ServiceSchema);
    this.setState({
      service: ServiceUtil.createServiceFromFormModel(model),
      model: model,
      app: '',
      errorMessage: null
    });
  }

  handleChange({isValidated, model}) {
    if (isValidated) {
      this.setState({
        service: ServiceUtil.createServiceFromFormModel(model),
        model: model,
        errorMessage: null
      });
    }
  }

  handleJSONChange(app) {
    let {service} = this.state;
    try {
      service = new Service(JSON.parse(app));
    } catch (e) {

    }
    this.setState({app, service})
  }

  handleToggleJSON() {
    this.setState({app: JSON.stringify(ServiceUtil
      .getAppDefinitionFromService(this.state.service), null, 2)});
    this.setState({json: !this.state.json});
  }

  handleClearError() {
    this.setState({
      errorMessage: null
    });
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
    if (this.state.json) {
      MarathonStore.createService(JSON.parse(this.state.app));
      return ;
    }
    MarathonStore.createService(ServiceUtil.getAppDefinitionFromService(this.state.service));
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
        <button onClick={this.handleClearError.bind(this)}
          className="button button-small button-danger flush-bottom">
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
          onClick={this.handleCancel.bind(this)}>
          Cancel
        </button>
        <ToggleButton
          checked={this.state.json}
          onChange={this.handleToggleJSON.bind(this)}>
          JSON mode
        </ToggleButton>
        <button
          className="button button-large button-success flush-bottom"
          onClick={this.handleSubmit.bind(this)}>
          Deploy
        </button>
      </div>
    );

  }

  getModalContents() {
    if (this.state.json) {
      return (
        <Ace editorProps={{$blockScrolling: true}}
          mode="json"
          onChange={this.handleJSONChange.bind(this)}
          showGutter={true}
          showPrintMargin={false}
          theme="monokai"
          value={this.state.app}
          width="100%"/>
      );
    }

    return (
      <AdvancedConfig
        model={
          ServiceUtil.createFormModelFromSchema(
            ServiceSchema,
            this.state.service
          )
        }
        schema={ServiceSchema}
        onChange={this.handleChange} />
    );
  }

  render() {
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
        titleText="Deploy New Service"
        showFooter={true}>
        {this.getErrorMessage()}
        {this.getModalContents()}
      </Modal>
    );
  }
}

ServiceFormModal.defaultProps = {
  onClose: function () {},
  open: false
};

ServiceFormModal.propTypes = {
  open: React.PropTypes.bool,
  model: React.PropTypes.object,
  onClose: React.PropTypes.func
};

module.exports = ServiceFormModal;
