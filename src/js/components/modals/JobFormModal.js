import Ace from 'react-ace';
import mixin from 'reactjs-mixin';
import {Modal} from 'reactjs-components';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import MetronomeStore from '../../stores/MetronomeStore';
import Job from '../../structs/Job';
import JobForm from '../JobForm';
import JobUtil from '../../utils/JobUtil';
import JobSchema from '../../schemas/JobSchema';
import ToggleButton from '../ToggleButton';

const METHODS_TO_BIND = [
  'handleCancel',
  'handleFormChange',
  'handleJSONEditorChange',
  'handleInputModeToggle',
  'handleSubmit',
  'onMetronomeStoreJobCreateSuccess',
  'onMetronomeStoreJobCreateError',
  'onMetronomeStoreJobUpdateSuccess',
  'onMetronomeStoreJobUpdateError'
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
        name: 'metronome',
        events: [
          'jobCreateSuccess',
          'jobCreateError',
          'jobUpdateSuccess',
          'jobUpdateError'
        ],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.props.open) {
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

  onMetronomeStoreJobCreateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMetronomeStoreJobCreateError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  onMetronomeStoreJobUpdateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMetronomeStoreJobUpdateError(errorMessage) {
    this.setState({
      errorMessage
    });
  }

  resetState() {
    this.setState({
      errorMessage: null,
      job: this.props.job,
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
    let {isEdit, job} = this.props;
    let jobSpec = JobUtil.createJobSpecFromJob(this.state.job);

    if (!isEdit) {
      MetronomeStore.createJob(jobSpec);
    } else {
      MetronomeStore.updateJob(job.getId(), jobSpec);
    }
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
          height="462px"
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
    let submitLabel = 'Deploy';
    if (this.props.isEdit) {
      submitLabel = 'Change and deploy';
    }

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
          {submitLabel}
        </button>
      </div>
    );
  }

  getModalTitle() {
    let heading = ' Create new Job';
    if (this.props.isEdit) {
      heading = 'Edit Job';
    }

    return (
      <div className="header-flex">
        <div className="header-left">
          <h4 className="flush-top flush-bottom text-color-neutral">
            {heading}
          </h4>
        </div>
        <div className="header-right">
          <ToggleButton
            className="modal-form-title-label"
            checkboxClassName="modal-form-title-toggle-button toggle-button"
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
        modalWrapperClass="multiple-form-modal modal-form"
        open={this.props.open}
        scrollContainerClass=""
        showCloseButton={false}
        showHeader={true}
        footer={this.getModalFooter()}
        titleText={this.getModalTitle()}
        titleClass="modal-header-title flush-top flush-bottom"
        showFooter={true}>
        {this.getErrorMessage()}
        {this.getModalContents()}
      </Modal>
    );
  }
}

JobFormModal.defaultProps = {
  isEdit: false,
  job: new Job(),
  onClose: function () {},
  open: false
};

JobFormModal.propTypes = {
  isEdit: React.PropTypes.bool,
  job: React.PropTypes.instanceOf(Job),
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = JobFormModal;
