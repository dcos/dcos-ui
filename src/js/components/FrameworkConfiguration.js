import React, { PropTypes, Component } from "react";
import { Confirm } from "reactjs-components";
import deepEqual from "deep-equal";

import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader
  from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions
  from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle
  from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import FullScreenModalHeaderSubTitle
  from "#SRC/js/components/modals/FullScreenModalHeaderSubTitle";
import ToggleButton from "#SRC/js/components/ToggleButton";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import Icon from "#SRC/js/components/Icon";
import Util from "#SRC/js/utils/Util";
import StringUtil from "#SRC/js/utils/StringUtil";
import CosmosErrorMessage from "#SRC/js/components/CosmosErrorMessage";
import FrameworkConfigurationForm
  from "#SRC/js/components/FrameworkConfigurationForm";

export default class FrameworkConfiguration extends Component {
  constructor(props) {
    super(props);

    const schema = props.packageDetails.getConfig();
    const activeTab = Object.keys(schema.properties)[0];
    const focusField = Object.keys(schema.properties[activeTab].properties)[0];

    this.state = {
      reviewActive: props.isInitialDeploy,
      activeTab,
      focusField,
      jsonEditorActive: false,
      hasChangesApplied: false,
      isConfirmOpen: false,
      isOpen: true
    };
  }

  onFormDataChange(formData) {
    this.props.onFormDataChange(formData);

    this.setState({ hasChangesApplied: true });
  }

  onFormErrorChange(formErrors) {
    this.props.onFormErrorChange(formErrors);
  }

  onFocusFieldChange(activeTab, focusField) {
    if (deepEqual(focusField, this.state.focusField)) {
      return false;
    }

    this.setState({ focusField, activeTab });
  }

  onActiveTabChange(activeTab) {
    const { currentActiveTab } = this.state;
    const { packageDetails } = this.props;

    if (deepEqual(activeTab, currentActiveTab)) {
      return false;
    }

    const schema = packageDetails.getConfig();
    const focusField = Object.keys(schema.properties[activeTab].properties)[0];

    this.setState({ activeTab, focusField });
  }

  onReviewConfigurationRowClick(rowData) {
    const { tabViewID } = rowData;

    const keyPath = (tabViewID || "").split(".");
    if (keyPath.length < 2) {
      this.onEditConfigurationButtonClick();

      return false;
    }

    const activeTab = keyPath[0];
    const focusField = keyPath[1];

    this.setState({ reviewActive: false, focusField, activeTab });
  }

  onEditConfigurationButtonClick() {
    const { packageDetails } = this.props;

    const schema = packageDetails.getConfig();
    const activeTab = Object.keys(schema.properties)[0];
    const focusField = Object.keys(schema.properties[activeTab].properties)[0];

    this.setState({ reviewActive: false, activeTab, focusField });
  }

  getHashMapRenderKeys(formData, renderKeys) {
    if (!Util.isObject(formData)) {
      return false;
    }

    Object.keys(formData).forEach(key => {
      const formattedKey = key
        .toLowerCase()
        .split("_")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");

      renderKeys[key] = formattedKey;
      this.getHashMapRenderKeys(formData[key], renderKeys);
    });
  }

  handleJSONToggle() {
    this.setState({ jsonEditorActive: !this.state.jsonEditorActive });
  }

  handleCloseConfirmModal() {
    this.setState({ isConfirmOpen: false });
  }

  handleGoBack() {
    const { reviewActive, hasChangesApplied } = this.state;

    if (reviewActive && hasChangesApplied) {
      this.setState({ reviewActive: false });
    } else if (hasChangesApplied) {
      this.setState({ isConfirmOpen: true });
    } else {
      this.handleConfirmGoBack();
    }
  }

  handleServiceReview() {
    const { handleRun } = this.props;
    const { reviewActive } = this.state;

    if (reviewActive) {
      handleRun();
    } else {
      this.setState({ reviewActive: true });
    }
  }

  handleConfirmGoBack() {
    const { handleGoBack } = this.props;

    this.setState({ isConfirmOpen: false, isOpen: false }, () => {
      // Once state is set, start a timer for the length of the animation and
      // navigate away once the animation is over.
      setTimeout(handleGoBack, 300);
    });
  }

  getSecondaryActions() {
    const { reviewActive, hasChangesApplied } = this.state;

    return [
      {
        className: "button-stroke",
        clickHandler: this.handleGoBack.bind(this),
        label: reviewActive && hasChangesApplied ? " Back" : "Cancel"
      }
    ];
  }

  getPrimaryActions() {
    const { jsonEditorActive, reviewActive, hasChangesApplied } = this.state;
    const { deployErrors, formErrors } = this.props;

    let label = "Review & Run";
    if (reviewActive) {
      label = "Run Service";
    }

    const hasFormErrors = Object.keys(formErrors).reduce(
      (sum, tab) => sum + formErrors[tab],
      0
    );

    const actions = [
      {
        className: "button-primary flush-vertical",
        clickHandler: this.handleServiceReview.bind(this),
        label,
        disabled: hasFormErrors ||
          (reviewActive && deployErrors && !hasChangesApplied)
      }
    ];

    if (!reviewActive) {
      actions.unshift({
        node: (
          <ToggleButton
            className="flush"
            checkboxClassName="toggle-button toggle-button-align-left"
            checked={jsonEditorActive}
            onChange={this.handleJSONToggle.bind(this)}
            key="json-editor"
          >
            JSON Editor
          </ToggleButton>
        )
      });
    }

    return actions;
  }

  getPageContents() {
    const {
      reviewActive,
      jsonEditorActive,
      focusField,
      activeTab
    } = this.state;
    const {
      packageDetails,
      deployErrors,
      formErrors,
      isInitialDeploy,
      formData
    } = this.props;

    if (!reviewActive) {
      return (
        <FrameworkConfigurationForm
          packageDetails={packageDetails}
          jsonEditorActive={jsonEditorActive}
          formData={formData}
          formErrors={formErrors}
          focusField={focusField}
          activeTab={activeTab}
          deployErrors={deployErrors}
          onFormDataChange={this.onFormDataChange.bind(this)}
          onFormErrorChange={this.onFormErrorChange.bind(this)}
          onActiveTabChange={this.onActiveTabChange.bind(this)}
          onFocusFieldChange={this.onFocusFieldChange.bind(this)}
        />
      );
    }

    const fileName = "config.json";
    const configString = JSON.stringify(formData, null, 2);
    const ieDownloadConfig = () => {
      // Download if on IE
      if (global.navigator.msSaveOrOpenBlob) {
        const blob = new Blob([configString], { type: "application/json" });
        global.navigator.msSaveOrOpenBlob(blob, fileName);
      }
    };

    const renderKeys = {};
    this.getHashMapRenderKeys(formData, renderKeys);

    // todo, truncate if over three lines
    const preInstallNotes = packageDetails.getPreInstallNotes();
    let preinstall = null;
    if (preInstallNotes && isInitialDeploy) {
      const preInstallNotesParsed = StringUtil.parseMarkdown(preInstallNotes);
      preInstallNotesParsed.__html =
        "<strong>Preinstall Notes: </strong>" + preInstallNotesParsed.__html;

      preinstall = (
        <div
          dangerouslySetInnerHTML={preInstallNotesParsed}
          className="flush-bottom message message-warning"
        />
      );
    }

    let errorsAlert = null;
    if (deployErrors) {
      errorsAlert = <CosmosErrorMessage error={deployErrors} />;
    }

    // todo use Michaels empty state component instead of hardcoded u2014
    // todo use Bills href getResourceDownloadPath helper when it merges
    return (
      <div className="flex-item-grow-1">
        <div className="container container-wide">
          {errorsAlert}
          {preinstall}
          <div className="row">
            <div className="column-4">
              <h1 className="flush-top">Configuration</h1>
            </div>
            <div className="column-8 text-align-right">
              <button
                className="button button-primary-link button-inline-flex"
                onClick={this.onEditConfigurationButtonClick.bind(this)}
              >
                <Icon id="pencil" size="mini" family="system" />
                <span className="form-group-heading-content">
                  {"Edit Config"}
                </span>
              </button>
              <a
                className="button button-primary-link flush-right"
                download={fileName}
                onClick={ieDownloadConfig}
                href={`data:attachment/json;content-disposition=attachment;filename=${fileName};charset=utf-8,${encodeURIComponent(configString)}`}
              >
                <Icon id="download" size="mini" family="system" />
                <span className="form-group-heading-content">
                  {"Download Config"}
                </span>
              </a>
            </div>
          </div>
          <HashMapDisplay
            hash={formData}
            renderKeys={renderKeys}
            onEditClick={this.onReviewConfigurationRowClick.bind(this)}
            headlineClassName={"text-capitalize"}
            emptyValue={"\u2014"}
          />
        </div>
      </div>
    );
  }

  getHeader() {
    const { reviewActive } = this.state;
    const { packageDetails } = this.props;

    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={this.getSecondaryActions()}
          type="secondary"
        />
        <FullScreenModalHeaderTitle className="modal-full-screen-header-with-sub-title">
          {reviewActive ? "Review Configuration" : "Edit Configuration"}
          <FullScreenModalHeaderSubTitle>
            {packageDetails.description + " " + packageDetails.version}
          </FullScreenModalHeaderSubTitle>
        </FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={this.getPrimaryActions()}
          type="primary"
        />
      </FullScreenModalHeader>
    );
  }

  render() {
    const { isConfirmOpen, isOpen } = this.state;

    return (
      <FullScreenModal header={this.getHeader()} useGemini={true} open={isOpen}>
        {this.getPageContents()}
        <Confirm
          closeByBackdropClick={true}
          header={<ModalHeading>Discard Changes?</ModalHeading>}
          open={isConfirmOpen}
          onClose={this.handleCloseConfirmModal.bind(this)}
          leftButtonText="Cancel"
          leftButtonCallback={this.handleCloseConfirmModal.bind(this)}
          rightButtonText="Discard"
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleConfirmGoBack.bind(this)}
          showHeader={true}
        >
          <p>
            Are you sure you want to leave this page? Any data you entered will be lost.
          </p>
        </Confirm>
      </FullScreenModal>
    );
  }
}

FrameworkConfiguration.propTypes = {
  formData: PropTypes.object.isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  packageDetails: PropTypes.instanceOf(UniversePackage).isRequired,
  handleRun: PropTypes.func.isRequired,
  handleGoBack: PropTypes.func.isRequired,
  isInitialDeploy: PropTypes.bool.isRequired,
  deployErrors: PropTypes.object
};
