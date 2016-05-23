import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AdvancedConfig from '../AdvancedConfig';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import MarathonStore from '../../stores/MarathonStore';
import ServiceUtil from '../../utils/ServiceUtil';
import ServiceSchema from '../../constants/ServiceSchema';

const METHODS_TO_BIND = [
  'getAdvancedSubmit',
  'onMarathonStoreServiceCreateSuccess',
  'onMarathonStoreServiceCreateError',
  'handleChange',
  'handleSubmit'
];

class DeployServiceModal extends mixin(InternalStorageMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.internalStorage_set({
      hasFormErrors: false,
      pendingRequest: false
    });

    let model =
      ServiceUtil.createFormModelFromSchema(ServiceSchema);
    this.state = {
      service: ServiceUtil.createServiceFromFormModel(model),
      model: model,
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

  componentDidMount() {
    super.componentDidMount(...arguments);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    let {props} = this;
    if (!props.open && nextProps.open) {
      this.resetState();
    }
    if (props.open && !nextProps.open) {
      this.internalStorage_set({
        hasFormErrors: false,
        pendingRequest: false
      });
      // Reset our trigger submit for advanced install
      this.triggerAdvancedSubmit = undefined;
    }
  }

  resetState() {
    let model = ServiceUtil.createFormModelFromSchema(ServiceSchema)
    this.setState({
      service: ServiceUtil.createServiceFromFormModel(model),
      model: model,
      errorMessage: null
    });
  }

  componentDidUpdate() {
    if (this.triggerAdvancedSubmit) {
      // Trigger submit upfront to validate fields and potentially disable buttons
      let {isValidated} = this.triggerAdvancedSubmit();
      this.internalStorage_update({hasFormErrors: !isValidated});
    }
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

  handleChange({isValidated, model}) {
    this.internalStorage_update({hasFormErrors: !isValidated});
    if (isValidated) {
      this.setState({
        service: ServiceUtil.createServiceFromFormModel(model),
        model: model,
        errorMessage: null
      });
    }
  }

  handleCancel() {
    this.props.onClose();
  }

  handleSubmit() {
    MarathonStore.createService(ServiceUtil.getAppDefinitionFromService(this.state.service));
  }

  getAdvancedSubmit(triggerSubmit) {
    this.triggerAdvancedSubmit = triggerSubmit;
  }

  getErrorMessage() {
    let {errorMessage} = this.state;
    if (!errorMessage) {
      return null;
    }
    return (
      <h4 className="text-align-center text-danger flush-top">{errorMessage}</h4>
    );
  }

  getFooter() {
    let {pendingRequest, hasFormErrors} = this.internalStorage_get();
    // Only return footer, we always render AdvancedConfig, but just change
    // the hidden class in render

    return (
      <div className="modal-footer">
        <div className="container">
          <div className="button-collection flush-bottom">
            <button
              className="button button-large flush-top flush-bottom"
              onClick={this.handleCancel.bind(this)}>
              Cancel
            </button>
            <button
              disabled={pendingRequest || hasFormErrors}
              className="button button-large button-success flush-bottom"
              onClick={this.handleSubmit.bind(this)}>
              Deploy
            </button>
          </div>
        </div>
      </div>
    );

  }

  getModalContents() {
    return (
      <div>
        <AdvancedConfig
          headerText="Deploy New Service"
          schema={ServiceSchema}
          model={this.state.model}
          onChange={this.handleChange}
          getTriggerSubmit={this.getAdvancedSubmit} />
        {this.getErrorMessage()}
        {this.getFooter()}
      </div>
    );
  }

  render() {
    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        bodyClass=""
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass="modal modal-large"
        modalWrapperClass="multiple-form-modal"
        open={this.props.open}
        showCloseButton={false}
        showFooter={false}>
        {this.getModalContents()}
      </Modal>
    );
  }
}

DeployServiceModal.defaultProps = {
  onClose: function () {},
  open: false
};

DeployServiceModal.propTypes = {
  open: React.PropTypes.bool,
  model: React.PropTypes.object,
  onClose: React.PropTypes.func
};

module.exports = DeployServiceModal;
