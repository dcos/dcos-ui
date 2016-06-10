import Ace from 'react-ace';
import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import ChronosStore from '../../stores/ChronosStore';

const METHODS_TO_BIND = [
  'handleCancel',
  'handleClearError',
  'handleJSONChange',
  'handleSubmit',
  'onChronosStoreJobCreateSuccess',
  'onChronosStoreJobCreateError'
];

// TODO: We should get this default job spec from the job struct
const JOB_SPEC = {
  id: '',
  description: '',
  run: {}
};

class JobFormModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorMessage: null,
      jsonDefinition: JSON.stringify(JOB_SPEC, null, 2)
    };

    this.store_listeners = [
      {
        name: 'chronos',
        events: ['jobCreateSuccess', 'jobCreateError']
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
    this.setState({
      errorMessage: null,
      jsonDefinition: JSON.stringify(JOB_SPEC, null, 2),
    });
  }

  handleClearError() {
    this.setState({
      errorMessage: null
    });
  }

  handleJSONChange(jsonDefinition) {
    this.setState({jsonDefinition})
  }

  onChronosStoreJobCreateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onChronosStoreJobCreateError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  handleCancel() {
    this.props.onClose();
  }

  handleSubmit() {
    let jsonDefinition = this.state.jsonDefinition;
    ChronosStore.createJob(JSON.parse(jsonDefinition));
    this.setState({
      errorMessage: null,
      jsonDefinition
    });
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
        <button
          className="button button-large button-success flush-bottom"
          onClick={this.handleSubmit}>
          Deploy
        </button>
      </div>
    );
  }

  getModalContents() {
    let {jsonDefinition} = this.state;

    return (
      <Ace editorProps={{$blockScrolling: true}}
        mode="json"
        onChange={this.handleJSONChange}
        showGutter={true}
        showPrintMargin={false}
        theme="monokai"
        value={jsonDefinition}
        width="100%" />
    );
  }

  render() {
    let title = 'Create new Job';

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

JobFormModal.defaultProps = {
  onClose: function () {},
  open: false,
  service: null
};

JobFormModal.propTypes = {
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = JobFormModal;
