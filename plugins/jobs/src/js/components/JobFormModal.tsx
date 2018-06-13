import Ace from "react-ace";
import * as React from "react";
import { Modal } from "reactjs-components";

import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";

import { DataTriple } from "#SRC/js/components/SchemaForm";
import * as JobSchema from "#SRC/js/schemas/JobSchema";
import Job from "#SRC/js/structs/Job";
import JobForm from "#SRC/js/components/JobForm";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ToggleButton from "#SRC/js/components/ToggleButton";

interface ModalTitleProps {
  heading: string;
  errorMessage: React.ReactNode;
  handleInputModeToggle: () => void;
  jsonMode: boolean;
}
interface ModalFooterProps {
  submitLabel: string;
  handleSubmit: () => void;
  handleCancel: () => void;
}

const ModalFooter = ({
  submitLabel,
  handleSubmit,
  handleCancel
}: ModalFooterProps) => {
  return (
    <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-small">
      <button
        className="button button-primary-link flush-left"
        onClick={handleCancel}
      >
        Cancel
      </button>
      <button className="button button-primary" onClick={handleSubmit}>
        {submitLabel}
      </button>
    </div>
  );
};

const ModalTitle = ({
  heading,
  errorMessage,
  handleInputModeToggle,
  jsonMode
}: ModalTitleProps) => {
  return (
    <div>
      <div className="header-flex">
        <div className="header-left">
          <ModalHeading align="left" level={4}>
            {heading}
          </ModalHeading>
        </div>
        <div className="header-right">
          <ToggleButton
            className="modal-form-title-label flush-bottom"
            checkboxClassName="toggle-button"
            checked={jsonMode}
            onChange={handleInputModeToggle}
          >
            JSON mode
          </ToggleButton>
        </div>
      </div>
      <div className="header-full-width">{errorMessage}</div>
    </div>
  );
};

interface JobFormModalProps {
  errorMessage: React.ReactNode;
  handleCancel: () => void;
  handleFormChange: (event: { model: object }) => void;
  handleInputModeToggle: () => void;
  handleJSONEditorChange: (jsonDefinition: string) => void;
  handleSubmit: () => void;
  handleTriggerSubmit: (submitFunction: () => DataTriple) => void;
  isEdit: boolean;
  isOpen: boolean;
  job: Job;
  jobFormModel: object | null;
  jobJsonString: string | null;
  jsonMode: boolean;
}
interface JobFormModalState {
  defaultTab: string;
}

export default class JobFormModal extends React.Component<
  JobFormModalProps,
  JobFormModalState
> {
  public static defaultProps: Partial<JobFormModalProps> = {
    isEdit: false,
    job: new Job()
  };

  constructor() {
    super(...arguments);

    this.state = {
      defaultTab: ""
    };

    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(tab: string) {
    this.setState({ defaultTab: tab });
  }

  render() {
    const {
      isEdit,
      isOpen,
      job,
      handleSubmit,
      handleCancel,
      handleInputModeToggle,
      errorMessage,
      jsonMode,
      jobFormModel,
      jobJsonString,
      handleJSONEditorChange,
      handleFormChange,
      handleTriggerSubmit
    } = this.props;

    const { defaultTab } = this.state;

    return (
      <Modal
        backdropClass="modal-backdrop default-cursor"
        modalWrapperClass="multiple-form-modal modal-form"
        open={isOpen}
        scrollContainerClass="multiple-form-modal-body"
        showHeader={true}
        footer={
          <ModalFooter
            submitLabel={isEdit ? "Save Job" : "Create Job"}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
          />
        }
        header={
          <ModalTitle
            heading={isEdit ? `Edit Job (${job.getName()})` : " New Job"}
            errorMessage={errorMessage}
            handleInputModeToggle={handleInputModeToggle}
            jsonMode={jsonMode}
          />
        }
        showFooter={true}
        useGemini={false}
      >
        {jsonMode ? (
          <Ace
            editorProps={{ $blockScrolling: true }}
            mode="json"
            onChange={handleJSONEditorChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="100%"
            value={jobJsonString}
            width="100%"
          />
        ) : (
          <JobForm
            defaultTab={defaultTab}
            onTabChange={this.handleTabChange}
            onChange={handleFormChange}
            getTriggerSubmit={handleTriggerSubmit}
            model={jobFormModel}
            isEdit={isEdit}
            schema={JobSchema}
          />
        )}
      </Modal>
    );
  }
}
