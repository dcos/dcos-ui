import PropTypes from "prop-types";
import React, { Component } from "react";
import { Confirm } from "reactjs-components";
import { withI18n } from "@lingui/react";
import { t } from "@lingui/macro";

import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import FullScreenModalHeaderSubTitle from "#SRC/js/components/modals/FullScreenModalHeaderSubTitle";
import ToggleButton from "#SRC/js/components/ToggleButton";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import Util from "#SRC/js/utils/Util";
import { getFirstTabAndField } from "#SRC/js/utils/FrameworkConfigurationUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import CosmosErrorMessage from "#SRC/js/components/CosmosErrorMessage";
import FrameworkConfigurationForm from "#SRC/js/components/FrameworkConfigurationForm";
import FrameworkConfigurationReviewScreen from "#SRC/js/components/FrameworkConfigurationReviewScreen";

const METHODS_TO_BIND = [
  "handleJSONToggle",
  "handleGoBack",
  "handleServiceReview",
  "handleEditConfigurationButtonClick",
  "handleActiveTabChange",
  "handleFocusFieldChange",
  "handleCloseConfirmModal",
  "handleConfirmGoBack",
  "handleFormSubmit"
];

class FrameworkConfiguration extends Component {
  constructor(props) {
    super(props);

    const { packageDetails } = this.props;
    const { activeTab, focusField } = getFirstTabAndField(packageDetails);

    this.state = {
      reviewActive: false,
      activeTab,
      focusField,
      jsonEditorActive: false,
      isConfirmOpen: false,
      isOpen: true,
      liveValidate: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleFocusFieldChange(activeTab, focusField) {
    this.setState({ focusField, activeTab });
  }

  handleActiveTabChange(activeTab) {
    const { packageDetails } = this.props;
    const schema = packageDetails.getConfig();

    const [focusField] = Object.keys(
      Util.findNestedPropertyInObject(
        schema,
        `properties.${activeTab}.properties`
      )
    );

    this.setState({ activeTab, focusField });
  }

  handleEditConfigurationButtonClick() {
    const { activeTab, focusField } = getFirstTabAndField(
      this.props.packageDetails
    );

    this.setState({ reviewActive: false, activeTab, focusField });
  }

  handleJSONToggle() {
    this.setState({ jsonEditorActive: !this.state.jsonEditorActive });
  }

  handleCloseConfirmModal() {
    this.setState({ isConfirmOpen: false });
  }

  handleGoBack() {
    const { reviewActive } = this.state;

    if (reviewActive) {
      this.setState({ reviewActive: false });

      return;
    }

    this.setState({ isConfirmOpen: true });
  }

  handleServiceReview() {
    const { handleRun } = this.props;
    const { reviewActive } = this.state;

    if (reviewActive) {
      handleRun();

      return;
    }

    // Only live validate once the form is submitted.
    this.setState({ liveValidate: true }, () => {
      // This is the prescribed method for submitting a react-jsonschema-form
      // using an external control.
      // https://github.com/mozilla-services/react-jsonschema-form#tips-and-tricks
      this.submitButton.click();
    });
  }

  handleConfirmGoBack() {
    const { handleGoBack } = this.props;

    this.setState({ isConfirmOpen: false, isOpen: false }, () => {
      // Once state is set, start a timer for the length of the animation and
      // navigate away once the animation is over.
      setTimeout(handleGoBack, 300);
    });
  }

  handleFormSubmit() {
    this.setState({ liveValidate: false, reviewActive: true });
  }

  getSecondaryActions() {
    const { reviewActive } = this.state;

    return [
      {
        className: "button-primary-link button-flush-horizontal",
        clickHandler: this.handleGoBack,
        label: reviewActive ? " Back" : "Cancel"
      }
    ];
  }

  getPrimaryActions() {
    const { jsonEditorActive, reviewActive } = this.state;
    const { formErrors } = this.props;

    const actions = [
      {
        className: "button-primary flush-vertical",
        clickHandler: this.handleServiceReview,
        label: reviewActive ? "Run Service" : "Review & Run",
        disabled: Object.keys(formErrors).some(tab => formErrors[tab] > 0)
      }
    ];

    if (!reviewActive) {
      actions.unshift({
        node: (
          <ToggleButton
            className="flush"
            checkboxClassName="toggle-button toggle-button-align-left"
            checked={jsonEditorActive}
            onChange={this.handleJSONToggle}
            key="json-editor"
          >
            JSON Editor
          </ToggleButton>
        )
      });
    }

    return actions;
  }

  getTermsAndConditions() {
    const { packageDetails } = this.props;

    const termsUrl = packageDetails.isCertified()
      ? "https://mesosphere.com/catalog-terms-conditions/#certified-services"
      : "https://mesosphere.com/catalog-terms-conditions/#community-services";

    return {
      __html: `By running this service you agree to the <a href=${termsUrl} target='_blank' title='Terms and Conditions'>terms and conditions</a>.`
    };
  }

  getWarningMessage() {
    const { packageDetails } = this.props;

    const preInstallNotes = packageDetails.getPreInstallNotes();
    if (preInstallNotes) {
      const message = StringUtil.parseMarkdown(preInstallNotes);
      message.__html = `<strong>Preinstall Notes: </strong>${message.__html} ${
        this.getTermsAndConditions().__html
      }`;

      return (
        <div
          dangerouslySetInnerHTML={message}
          className="pre-install-notes message message-warning"
        />
      );
    }

    return (
      <div
        dangerouslySetInnerHTML={this.getTermsAndConditions()}
        className="pre-install-notes message message-warning"
      />
    );
  }

  getReviewScreen() {
    const {
      deployErrors,
      isInitialDeploy,
      formData,
      defaultConfigWarning
    } = this.props;

    let warningMessage = null;
    if (isInitialDeploy) {
      warningMessage = this.getWarningMessage();
    }

    let defaultConfigWarningMessage = null;
    if (defaultConfigWarning) {
      const message = {};
      message.__html = `<strong>Warning: </strong>${defaultConfigWarning}`;
      defaultConfigWarningMessage = (
        <div
          dangerouslySetInnerHTML={message}
          className="message message-warning"
        />
      );
    }

    let errorsAlert = null;
    if (deployErrors) {
      errorsAlert = <CosmosErrorMessage error={deployErrors} />;
    }

    return (
      <div className="flex-item-grow-1">
        <div className="container">
          {errorsAlert}
          {warningMessage}
          {defaultConfigWarningMessage}
          <FrameworkConfigurationReviewScreen
            frameworkData={formData}
            onEditClick={this.handleEditConfigurationButtonClick}
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
            {StringUtil.capitalize(packageDetails.getName()) +
              " " +
              packageDetails.getVersion()}
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
    const {
      isConfirmOpen,
      isOpen,
      reviewActive,
      jsonEditorActive,
      focusField,
      activeTab
    } = this.state;
    const {
      packageDetails,
      deployErrors,
      formErrors,
      formData,
      onFormDataChange,
      onFormErrorChange,
      defaultConfigWarning,
      i18n
    } = this.props;

    let pageContents;
    if (reviewActive) {
      pageContents = this.getReviewScreen();
    } else {
      pageContents = (
        <FrameworkConfigurationForm
          jsonEditorActive={jsonEditorActive}
          focusField={focusField}
          activeTab={activeTab}
          handleActiveTabChange={this.handleActiveTabChange}
          handleFocusFieldChange={this.handleFocusFieldChange}
          formData={formData}
          formErrors={formErrors}
          packageDetails={packageDetails}
          deployErrors={deployErrors}
          onFormDataChange={onFormDataChange}
          onFormErrorChange={onFormErrorChange}
          onFormSubmit={this.handleFormSubmit}
          defaultConfigWarning={defaultConfigWarning}
          submitRef={el => (this.submitButton = el)} // ref forwarding https://reactjs.org/docs/forwarding-refs.html
          liveValidate={this.state.liveValidate}
        />
      );
    }

    return (
      <FullScreenModal
        header={this.getHeader()}
        useGemini={reviewActive}
        open={isOpen}
      >
        {pageContents}
        <Confirm
          closeByBackdropClick={true}
          header={<ModalHeading>Discard Changes?</ModalHeading>}
          open={isConfirmOpen}
          onClose={this.handleCloseConfirmModal}
          leftButtonText={i18n._(t`Cancel`)}
          leftButtonCallback={this.handleCloseConfirmModal}
          rightButtonText={i18n._(t`Discard`)}
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleConfirmGoBack}
          showHeader={true}
        >
          <p>
            Are you sure you want to leave this page? Any data you entered will
            be lost.
          </p>
        </Confirm>
      </FullScreenModal>
    );
  }
}

FrameworkConfiguration.propTypes = {
  formData: PropTypes.object.isRequired,
  formErrors: PropTypes.object.isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  onFormErrorChange: PropTypes.func.isRequired,
  packageDetails: PropTypes.instanceOf(UniversePackage).isRequired,
  handleRun: PropTypes.func.isRequired,
  handleGoBack: PropTypes.func.isRequired,
  isInitialDeploy: PropTypes.bool,
  deployErrors: PropTypes.object,
  defaultConfigWarning: PropTypes.string
};

export default withI18n()(FrameworkConfiguration);
