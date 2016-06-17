import Ace from 'react-ace';
import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import ChronosStore from '../../stores/ChronosStore';
import JobSchema from '../../schemas/JobSchema';
import JobUtil from '../../utils/JobUtil';
import Job from '../../structs/Job';
import JobForm from '../JobForm';
import ToggleButton from '../ToggleButton';

const METHODS_TO_BIND = [
  'handleCancel',
  'handleFormChange',
  'handleJSONEditorChange',
  'handleInputModeToggle',
  'handleSubmit',
  'onChronosStoreJobCreateSuccess',
  'onChronosStoreJobCreateError'
];

class JobFormModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorMessage: null,
      job: new Job(),
      jsonMode: false
    };

    this.store_listeners = [
      {
        name: 'chronos',
        events: ['jobCreateSuccess', 'jobCreateError'],
        suppressUpdate: true
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

  shouldComponentUpdate(nextProps, nextState) {
    let {errorMessage, jsonMode} = this.state;
    let {open} = this.props;

    return (nextProps.open !== open ||
      nextState.errorMessage !== errorMessage ||
      nextState.jsonMode !== jsonMode
    );
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

  resetState() {
    this.setState({
      errorMessage: null,
      job: new Job(),
      jsonMode: false
    });
  }

  handleCancel() {
    this.props.onClose();
  }

  handleFormChange({model}) {
    if (!model) {
      return;
    }

    this.setState({
      errorMessage: null,
      job: JobUtil.createJobFromFormModel(model)
    });
  }

  handleInputModeToggle() {
    this.setState({jsonMode: !this.state.jsonMode});
  }

  handleJSONEditorChange(jsonDefinition) {
    try {
      let job = new Job(JSON.parse(jsonDefinition));
      this.setState({errorMessage: null, job});
    } catch (error) {
      // TODO: DCOS-7734 Handle error
    }
  }

  handleSubmit() {
    ChronosStore.createJob(JobUtil.createJobSpecFromJob(this.state.job));
  }

  getErrorMessage() {
    let {errorMessage} = this.state;
    if (!errorMessage) {

      return null;
    }

    return (
    <div>
      <div className="error-field text-danger">
        <pre className="text-align-center">
          {errorMessage.message}
        </pre>
      </div>
    </div>
    );
  }

  getModalContents() {
    let {job, jsonMode} = this.state;

    if (jsonMode) {
      let jobSpec = JobUtil.createJobSpecFromJob(job);

      return (
        <Ace editorProps={{$blockScrolling: true}}
          mode="json"
          onChange={this.handleJSONEditorChange}
          showGutter={true}
          showPrintMargin={false}
          theme="monokai"
          value={JSON.stringify(jobSpec, null, 2)}
          width="100%" />
      );
    }

    let formModel = JobUtil.createFormModelFromSchema(JobSchema, job);

    return (
      <JobForm
        onChange={this.handleFormChange}
        model={formModel}
        schema={JobSchema} />
    );
  }

  getModalFooter() {
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

  getModalTitle() {
    return (
      <div>
        <div className="column-6">
          Create new Job
        </div>
        <div className="column-6 text-align-right">
          <ToggleButton
            checked={this.state.jsonMode}
            onChange={this.handleInputModeToggle}>
            JSON mode
          </ToggleButton>
        </div>
      </div>
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
        footer={this.getModalFooter()}
        titleText={this.getModalTitle()}
        showFooter={true}>
        {this.getErrorMessage()}
        {this.getModalContents()}
      </Modal>
    );
  }
}

JobFormModal.defaultProps = {
  onClose: function () {},
  open: false
};

JobFormModal.propTypes = {
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = JobFormModal;
