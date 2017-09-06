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
import ToggleButton from "#SRC/js/components/ToggleButton";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Icon from "#SRC/js/components/Icon";
import Util from "#SRC/js/utils/Util";
import FrameworkConfigurationForm
  from "#SRC/js/components/FrameworkConfigurationForm";

export default class FrameworkConfiguration extends mixin(StoreMixin) {
  constructor(props) {
    super(props);

    this.state = {
      reviewActive: false,
      packageDetails: null,
      jsonEditorActive: false,
      formData: null,
      activeTab: null,
      hasChangesApplied: false,
      isConfirmOpen: false,
      isOpen: true
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["serviceDescriptionError", "serviceDescriptionSuccess"]
      }
    ];

    CosmosPackagesStore.fetchServiceDescription(props.params.id);
  }

  onCosmosPackagesStoreServiceDescriptionSuccess() {
    const packageDetails = CosmosPackagesStore.getServiceDetails();
    const activeTab = Object.keys(packageDetails.config.properties)[0];
    const formData = this.initializeFormData(packageDetails.config);

    this.setState({ packageDetails, activeTab, formData });
  }

  initializeFormData(value) {
    if (!Util.isObject(value)) {
      return value;
    }
    if (!value.properties) {
      return value.default;
    }

    const defaults = {};
    Object.keys(value.properties).forEach(property => {
      defaults[property] = this.initializeFormData(value.properties[property]);
    });

    return defaults;
  }

  onFormDataChange(formData) {
    this.setState({ formData, hasChangesApplied: true });
  }

  onReviewConfigurationRowClick(rowData) {
    const { tabViewID } = rowData;

    const activeTab = tabViewID.split(".")[0];

    this.setState({ reviewActive: false, activeTab });
  }

  onEditConfigurationButtonClick() {
    const { packageDetails } = this.state;
    const activeTab = Object.keys(packageDetails.config.properties)[0];

    this.setState({ reviewActive: false, activeTab });
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
      activeTab
    } = this.state;

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

    if (reviewActive) {
      return (
        <div className="flex-item-grow-1">
          <div className="container container-wide">
            <div className="row">
              <div className="column-4">
                <h1 className="flush-top">Configuration</h1>
              </div>
              <div className="column-8 text-align-right">
                <button
                  className="button button-primary-link inline-flex-button"
                  onClick={this.onEditConfigurationButtonClick.bind(this)}
                >
                  <Icon id="pencil" size="mini" family="system" />
                  <span className="form-group-heading-content">
                    {"Edit Config"}
                  </span>
                </button>
                <a
                  className="button button-primary-link"
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
          activeTab={activeTab}
          formData={formData}
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

  getPrimaryActions() {
    const { jsonEditorActive, reviewActive } = this.state;

    let label = "Review & Run";
    if (reviewActive) {
      label = "Run Service";
    }

    const actions = [
      {
        className: "button-primary flush-vertical",
        clickHandler: this.handleServiceReview.bind(this),
        label
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
    this.setState({ reviewActive: true });
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
        <FullScreenModalHeaderTitle>
          <div>
            {reviewActive ? "Review Configuration" : "Edit Configuration"}
            {": "}
            {packageDetails.description + " " + packageDetails.version}
          </div>
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
      return <div>loading</div>;
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
