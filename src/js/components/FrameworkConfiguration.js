import React, { PropTypes } from "react";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Confirm } from "reactjs-components";
import { routerShape } from "react-router";
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
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Icon from "#SRC/js/components/Icon";
import Util from "#SRC/js/utils/Util";
import FrameworkConfigurationForm
  from "#SRC/js/components/FrameworkConfigurationForm";
import Loader from "#SRC/js/components/Loader";
import deepEqual from "deep-equal";
import Alert from "#SRC/js/components/Alert";

export default class FrameworkConfiguration extends mixin(StoreMixin) {
  constructor(props) {
    super(props);

    this.state = {
      reviewActive: false,
      packageDetails: null,
      jsonEditorActive: false,
      formData: null,
      hasChangesApplied: false,
      isConfirmOpen: false,
      isOpen: true,
      tabErrors: {},
      focusFieldPath: [],
      updateError: null
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: [
          "serviceDescriptionError",
          "serviceDescriptionSuccess",
          "serviceUpdateSuccess",
          "serviceUpdateError"
        ]
      }
    ];

    CosmosPackagesStore.fetchServiceDescription(props.params.id);
  }

  onCosmosPackagesStoreServiceDescriptionSuccess() {
    const fullPackage = CosmosPackagesStore.getServiceDetails();
    const packageDetails = fullPackage.package;

    const schema = packageDetails.config;
    const activeTab = Object.keys(schema.properties)[0];
    const firstField = Object.keys(schema.properties[activeTab].properties)[0];
    const focusFieldPath = [activeTab, firstField];

    // re-order the keys in resolvedOptions to same order as the JSON schema
    // ugh...this is bad
    const formData = this.reorderResolvedOptions(
      fullPackage.resolvedOptions,
      packageDetails
    );

    this.setState({ packageDetails, formData, focusFieldPath });
  }

  onCosmosPackagesStoreServiceDescriptionError() {
    // todo figure out what this response looks like and what we should do
  }

  // this will only be meaningful in runtimes with deterministic key order
  reorderResolvedOptions(resolvedOptions, packageDetails) {
    const order = Object.keys(packageDetails.config.properties);
    const orderedResolvedOptions = {};
    order.forEach(tab => {
      orderedResolvedOptions[tab] = resolvedOptions[tab];
    });

    return orderedResolvedOptions;
  }

  onCosmosPackagesStoreServiceUpdateSuccess() {
    this.setState({ updateError: null });
    this.handleConfirmGoBack();
  }

  onCosmosPackagesStoreServiceUpdateError(response) {
    const updateError = [response.message];

    this.setState({ updateError });
  }

  onFormDataChange(formData) {
    if (deepEqual(formData, this.state.formData, { strict: true })) {
      return;
    }

    this.setState({ formData, hasChangesApplied: true, updateError: null });
  }

  onFormErrorChange(tabErrors) {
    if (deepEqual(tabErrors, this.state.tabErrors)) {
      return;
    }

    this.setState({ tabErrors });
  }

  onFocusFieldPathChange(focusFieldPath) {
    if (deepEqual(focusFieldPath, this.state.focusFieldPath)) {
      return;
    }

    this.setState({ focusFieldPath });
  }

  onActiveTabChange(activeTab) {
    const { packageDetails, focusFieldPath } = this.state;
    const currentActiveTab = focusFieldPath[0];

    if (deepEqual(activeTab, currentActiveTab)) {
      return;
    }

    const schema = packageDetails.config;
    const firstField = Object.keys(schema.properties[activeTab].properties)[0];
    const newFocusFieldPath = [activeTab, firstField];

    this.setState({ focusFieldPath: newFocusFieldPath });
  }

  onReviewConfigurationRowClick(rowData) {
    const { tabViewID } = rowData;

    const focusFieldPath = tabViewID.split(".");

    this.setState({ reviewActive: false, focusFieldPath });
  }

  onEditConfigurationButtonClick() {
    const { packageDetails } = this.state;

    const schema = packageDetails.config;
    const activeTab = Object.keys(schema.properties)[0];
    const firstField = Object.keys(schema.properties[activeTab].properties)[0];
    const focusFieldPath = [activeTab, firstField];

    this.setState({ reviewActive: false, focusFieldPath });
  }

  getHashMapRenderKeys(formData, renderKeys) {
    if (!Util.isObject(formData)) {
      return;
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

  getPageContents() {
    const {
      reviewActive,
      packageDetails,
      jsonEditorActive,
      formData,
      tabErrors,
      focusFieldPath,
      updateError
    } = this.state;

    if (reviewActive) {
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

      let errorsAlert = null;
      if (updateError) {
        const errorItems = updateError.map((message, index) => {
          return (
            <li key={index} className="short">
              {message}
            </li>
          );
        });

        errorsAlert = (
          <Alert>
            <strong>There is an error with your configuration</strong>
            <div className="pod pod-narrower-left pod-shorter-top flush-bottom">
              <ul className="short flush-bottom">
                {errorItems}
              </ul>
            </div>
          </Alert>
        );
      }

      return (
        <div className="flex-item-grow-1">
          <div className="container container-wide">
            {errorsAlert}
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
    } else {
      return (
        <FrameworkConfigurationForm
          {...this.props}
          packageDetails={packageDetails}
          jsonEditorActive={jsonEditorActive}
          onFormDataChange={this.onFormDataChange.bind(this)}
          onFormErrorChange={this.onFormErrorChange.bind(this)}
          onActiveTabChange={this.onActiveTabChange.bind(this)}
          formData={formData}
          tabErrors={tabErrors}
          focusFieldPath={focusFieldPath}
          onFocusFieldPathChange={this.onFocusFieldPathChange.bind(this)}
          updateError={updateError}
        />
      );
    }
  }

  getSecondaryActions() {
    const { reviewActive } = this.state;

    let label = "Cancel";
    if (reviewActive) {
      label = "Back";
    }

    return [
      {
        className: "button-stroke",
        clickHandler: this.handleGoBack.bind(this),
        label
      }
    ];
  }

  handleJSONToggle() {
    this.setState({ jsonEditorActive: !this.state.jsonEditorActive });
  }

  hasErrors() {
    const { tabErrors } = this.state;

    return (
      Object.keys(tabErrors).reduce((sum, tab) => sum + tabErrors[tab], 0) > 0
    );
  }

  getPrimaryActions() {
    const { jsonEditorActive, reviewActive, updateError } = this.state;

    let label = "Review & Run";
    if (reviewActive) {
      label = "Run Service";
    }

    const actions = [
      {
        className: "button-primary flush-vertical",
        clickHandler: this.handleServiceReview.bind(this),
        label,
        disabled: this.hasErrors() || (updateError && reviewActive)
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

  handleCloseConfirmModal() {
    this.setState({ isConfirmOpen: false });
  }

  handleGoBack() {
    const { reviewActive, hasChangesApplied } = this.state;

    if (reviewActive) {
      this.setState({ reviewActive: false });
    } else if (hasChangesApplied) {
      this.setState({ isConfirmOpen: true });
    } else {
      this.handleConfirmGoBack();
    }
  }

  handleServiceReview() {
    const { reviewActive, formData } = this.state;
    const { params } = this.props;

    if (reviewActive) {
      CosmosPackagesStore.updateService(params.id, formData);
    } else {
      this.setState({ reviewActive: true });
    }
  }

  handleConfirmGoBack() {
    this.setState({ isConfirmOpen: false, isOpen: false }, () => {
      // Once state is set, start a timer for the length of the animation and
      // navigate away once the animation is over.
      setTimeout(this.context.router.goBack, 300);
    });
  }

  getHeader() {
    const { packageDetails, reviewActive } = this.state;

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
    const { packageDetails, isConfirmOpen, isOpen } = this.state;

    if (packageDetails == null) {
      return <Loader className="vertical-center" />;
    }

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

FrameworkConfiguration.contextTypes = {
  router: routerShape
};

FrameworkConfiguration.propTypes = {
  params: PropTypes.object.isRequired
};
