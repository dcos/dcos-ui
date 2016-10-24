import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import defaultServiceImage from '../../../img/services/icon-service-default-large@2x.png';
import Icon from '../Icon';
import Image from '../Image';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import Loader from '../Loader';
import MetadataStore from '../../stores/MetadataStore';
import ReviewConfig from '../ReviewConfig';
import SchemaForm from '../SchemaForm';
import SchemaUtil from '../../utils/SchemaUtil';
import StringUtil from '../../utils/StringUtil';
import TabsMixin from '../../mixins/TabsMixin';

const PREINSTALL_NOTES_CHAR_LIMIT = 140;

const METHODS_TO_BIND = [
  'getAdvancedSubmit',
  'handleChangeTab',
  'handleInstallPackage',
  'handleAdvancedFormChange',
  'handleModalClose',
  'handleModalRef',
  'handleModalUpdateRequest',
  'handlePreinstallNotesToggle'
];

class InstallPackageModal extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      defaultInstall: 'DefaultInstall',
      advancedInstall: 'AdvancedInstall',
      reviewAdvancedConfig: 'ReviewAdvancedConfig',
      packageInstalled: 'PackageInstalled'
    };

    this.internalStorage_set({
      descriptionError: null,
      hasFormErrors: false,
      installError: null,
      isLoading: true,
      pendingRequest: false
    });

    this.state = {
      currentTab: 'defaultInstall',
      schemaIncorrect: false,
      truncatedPreInstallNotes: true
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: [
        'descriptionError',
        'descriptionSuccess',
        'installError',
        'installSuccess'
      ]
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.modalRef = undefined;
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    let {props} = this;
    if (props.open) {
      CosmosPackagesStore.fetchPackageDescription(
        props.packageName,
        props.packageVersion
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    let {props} = this;
    if (props.open && !nextProps.open) {
      this.internalStorage_set({
        descriptionError: null,
        installError: null,
        isLoading: true,
        pendingRequest: false
      });
      // Reset our trigger submit for advanced install
      this.triggerAdvancedSubmit = undefined;
      this.setState({
        currentTab: 'defaultInstall',
        truncatedPreInstallNotes: true
      });
    }

    if (!props.open && nextProps.open) {
      CosmosPackagesStore.fetchPackageDescription(
        nextProps.packageName,
        nextProps.packageVersion
      );
    }
  }

  componentDidUpdate() {
    if (this.triggerAdvancedSubmit) {
      // Trigger submit upfront to validate fields and potentially disable buttons
      let {isValidated} = this.triggerAdvancedSubmit();
      this.internalStorage_update({hasFormErrors: !isValidated});
    }
  }

  onCosmosPackagesStoreDescriptionError(descriptionError) {
    this.internalStorage_update({descriptionError});
    this.forceUpdate();
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    if (!SchemaUtil.validateSchema(cosmosPackage.getConfig())) {
      this.setState({schemaIncorrect: true});
      return;
    }

    this.internalStorage_update({
      hasError: false,
      isLoading: false
    });
    this.setState({schemaIncorrect: false});
  }

  onCosmosPackagesStoreInstallError(installError) {
    this.internalStorage_update({
      installError,
      pendingRequest: false
    });
    this.setState({currentTab: 'defaultInstall'});
  }

  onCosmosPackagesStoreInstallSuccess() {
    this.internalStorage_update({
      installError: null,
      pendingRequest: false
    });
    this.setState({currentTab: 'packageInstalled'});
  }

  handleAdvancedFormChange(formObject) {
    this.internalStorage_update({hasFormErrors: !formObject.isValidated});
    this.forceUpdate();
  }

  handleChangeTab(currentTab) {
    let newState = {installError: null};
    if (currentTab === 'advancedInstall') {
      // Change back to previous state and clean up stored config
      newState.advancedConfiguration = null;
    }

    if (currentTab === 'reviewAdvancedConfig') {
      let {isValidated, model} = this.triggerAdvancedSubmit();

      // Change state if form fields are validated and store configuration
      // for submission
      if (isValidated) {
        newState.advancedConfiguration = model;
      }
    }

    this.internalStorage_update(newState);
    this.tabs_handleTabClick(currentTab);
  }

  handleInstallPackage() {
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    let name = cosmosPackage.getName();
    let version = cosmosPackage.getCurrentVersion();
    let configuration = this.getPackageConfiguration();

    CosmosPackagesStore.installPackage(name, version, configuration);
    this.internalStorage_update({pendingRequest: true});
    this.forceUpdate();
  }

  handleModalClose() {
    this.setState({schemaIncorrect: false});
    this.props.onClose();
  }

  handlePreinstallNotesToggle() {
    let truncatedPreInstallNotes = !this.state.truncatedPreInstallNotes;
    this.setState({truncatedPreInstallNotes});
  }

  handleModalRef(modal) {
    this.modalRef = modal;
  }

  handleModalUpdateRequest() {
    if (this.modalRef) {
      this.modalRef.forceUpdate();
    }
  }

  getAdvancedSubmit(triggerSubmit) {
    this.triggerAdvancedSubmit = triggerSubmit;
  }

  getPackageConfiguration() {
    let {advancedConfiguration} = this.internalStorage_get();
    let {currentTab} = this.state;
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();

    let isAdvancedInstall = currentTab === 'advancedInstall' ||
      currentTab === 'reviewAdvancedConfig';

    if (isAdvancedInstall && advancedConfiguration) {
      return advancedConfiguration;
    }

    if (isAdvancedInstall && !advancedConfiguration) {
      return SchemaUtil.definitionToJSONDocument(
        SchemaUtil.schemaToMultipleDefinition({
          schema: cosmosPackage.getConfig()
        })
      );
    }

    return {};
  }

  getLoadingScreen() {
    return (
      <div className="modal-content-loading-indicator">
        <Loader />
      </div>
    );
  }

  getInstallErrorScreen() {
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    let {pendingRequest, installError} = this.internalStorage_get();

    return (
      <div>
        <div className="modal-body">
          <CosmosErrorMessage
            onResized={this.handleModalUpdateRequest}
            className="text-error-state text-overflow-break-word"
            error={installError}
            wrapperClass="" />
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked">
            <button
              disabled={!cosmosPackage || pendingRequest}
              className="button button-block"
              onClick={this.handleChangeTab.bind(this, 'advancedInstall')}>
              Edit Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  getPreInstallNotes(notes, truncated) {
    if (!notes) {
      return null;
    }

    if (truncated) {
      notes = notes.slice(0, PREINSTALL_NOTES_CHAR_LIMIT);
    }

    return (
      <p className="small flush-bottom">
        {notes}{this.getPreInstallNotesToggle(truncated, notes)}
      </p>
    );
  }

  getPreInstallNotesToggle(truncated, notes) {
    if (notes.length < PREINSTALL_NOTES_CHAR_LIMIT) {
      return null;
    }

    let ellipses = '';
    let textTruncationToggleWord = 'collapse';

    if (truncated) {
      ellipses = '...';
      textTruncationToggleWord = 'expand';
    }

    return (
      <span>
        {ellipses} (
          <span
            className="clickable"
            onClick={this.handlePreinstallNotesToggle}>
            <u>{textTruncationToggleWord}</u>
          </span>
        )
      </span>
    );
  }

  renderDefaultInstallTabView() {
    let {
      descriptionError,
      pendingRequest,
      installError
    } = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    let preInstallNotes = cosmosPackage.getPreInstallNotes();
    let name = cosmosPackage.getName();
    let version = cosmosPackage.getCurrentVersion();
    let truncated = this.state.truncatedPreInstallNotes;
    let packageVersionClasses = classNames({
      'flush-bottom': !preInstallNotes
    });

    let error;
    if (descriptionError) {
      error = (
        <p className="text-danger text-small text-align-center">
          {descriptionError}
        </p>
      );
    }

    if (installError) {
      return this.getInstallErrorScreen();
    }

    let buttonText = 'Install Package';

    if (pendingRequest) {
      buttonText = 'Installing...';
    }

    return (
      <div>
        <div className="modal-body">
          <div className="horizontal-center">
            <div className="icon icon-jumbo icon-image-container icon-app-container">
              <Image
                fallbackSrc={defaultServiceImage}
                src={cosmosPackage.getIcons()['icon-large']} />
            </div>
            <p className="h2 short-top short-bottom">{name}</p>
            <p className={packageVersionClasses}>{version}</p>
            {this.getPreInstallNotes(preInstallNotes, truncated)}
            {error}
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked">
            <button
              disabled={!cosmosPackage || pendingRequest || descriptionError}
              className="button button-success button-block"
              onClick={this.handleInstallPackage}>
              {buttonText}
            </button>
            <button
              disabled={!cosmosPackage || pendingRequest}
              className="button button-link button-primary button-block"
              onClick={this.handleChangeTab.bind(this, 'advancedInstall')}>
              Advanced Installation
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderAdvancedInstallTabView() {
    let {pendingRequest, hasFormErrors} = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();

    // Only return footer, we always render SchemaForm, but just change
    // the hidden class in render
    return (
      <div className="modal-footer">
        <div className="button-collection flush-bottom">
          <button
            className="button button-large"
            onClick={this.handleChangeTab.bind(this, 'defaultInstall')}>
            Back
          </button>
          <button
            disabled={!cosmosPackage || pendingRequest || hasFormErrors}
            className="button button-large button-success"
            onClick={this.handleChangeTab.bind(this, 'reviewAdvancedConfig')}>
            Review and Install
          </button>
        </div>
      </div>
    );

  }

  renderReviewAdvancedConfigTabView() {
    let {pendingRequest} = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    let name = cosmosPackage.getName();
    let version = cosmosPackage.getCurrentVersion();
    let buttonText = 'Install';

    if (pendingRequest) {
      buttonText = 'Installing...';
    }

    return (
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        <ReviewConfig
          packageIcon={cosmosPackage.getIcons()['icon-small']}
          packageName={name}
          packageVersion={version}
          configuration={this.getPackageConfiguration()} />
        <div className="modal-footer">
          <div className="button-collection flush">
            <button
              className="button button-large flush"
              onClick={this.handleChangeTab.bind(this, 'advancedInstall')}>
              Back
            </button>
            <button
              disabled={!cosmosPackage || pendingRequest}
              className="button button-success button-large flush"
              onClick={this.handleInstallPackage}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderPackageInstalledTabView() {
    let {pendingRequest} = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();

    let notes = cosmosPackage.getPostInstallNotes();

    let parsedNotes = StringUtil.parseMarkdown(notes);

    return (
      <div>
        <div className="modal-body">
          <div className="text-align-center">
            <span className="text-success">
              <Icon id="ring-check" size="large" />
            </span>
            <h2 className="short-top short-bottom">Success!</h2>
            <div className="install-package-modal-package-notes text-overflow-break-word"
              dangerouslySetInnerHTML={parsedNotes} />
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked horizontal-center">
            <button
              disabled={!cosmosPackage || pendingRequest}
              className="button button-success button-block"
              onClick={this.props.onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  getIncorrectSchemaWarning(cosmosPackage) {
    let errorText = 'The schema for this package is not properly configured. ' +
      'If you are the package owner, please check your configuration.';

    let maintainer = cosmosPackage.getMaintainer();
    if (maintainer) {
      errorText = (
        <span>
          {`${errorText} Or you may contact the maintainer: `}
          <a href={`mailto:${maintainer}`}>{maintainer}</a>
        </span>
      );
    }

    return (
      <div>
        <div className="modal-body horizontal-center">
          <h3>Invalid Configuration</h3>
          <p className="text-danger text-align-center">
            {errorText}
          </p>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked horizontal-center">
            <button
              className="button button-wide button-block"
              onClick={this.handleModalClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  getCLIPackageInfo(cosmosPackage) {
    return (
      <div>
        <div className="modal-content">
          <div className="modal-content-inner modal-content-inner-tall horizontal-center">
            <div className="icon icon-jumbo icon-image-container icon-app-container">
              <Image
                fallbackSrc={defaultServiceImage}
                src={cosmosPackage.getIcons()['icon-large']} />
            </div>
            <p className="h2 short-top short-bottom">
              {cosmosPackage.getName()}
            </p>
            <p>CLI Only Package</p>
            <p className="flush-bottom">
              This package can only be installed using the CLI. See the <a href={MetadataStore.buildDocsURI('/usage/managing-services/install/#installing-a-service-using-the-cli')} target="_blank">documentation</a>.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection horizontal-center flush-bottom">
            <button
              className="button flush-bottom button-wide"
              onClick={this.handleModalClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  getModalContents() {
    let {currentTab, schemaIncorrect} = this.state;
    let {isLoading} = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();

    if (cosmosPackage && cosmosPackage.isCLIOnly()) {
      return this.getCLIPackageInfo(cosmosPackage);
    }

    if (schemaIncorrect) {
      return this.getIncorrectSchemaWarning(cosmosPackage);
    }

    if (isLoading || !cosmosPackage) {
      return this.getLoadingScreen();
    }

    let name = cosmosPackage.getName();
    let version = cosmosPackage.getCurrentVersion();
    let advancedConfigClasses = classNames('modal-install-package-body-and-header', {
      hidden: currentTab !== 'advancedInstall'
    });

    return (
      <div className="modal-install-package-tab-form-wrapper">
        <div className={advancedConfigClasses}>
          <SchemaForm
            packageIcon={cosmosPackage.getIcons()['icon-small']}
            packageName={name}
            packageVersion={version}
            schema={cosmosPackage.getConfig()}
            onChange={this.handleAdvancedFormChange}
            getTriggerSubmit={this.getAdvancedSubmit} />
        </div>
        {this.tabs_getTabView()}
      </div>
    );
  }

  render() {
    let {props, state} = this;
    let {currentTab} = state;

    let isAdvanced = currentTab === 'advancedInstall' ||
      currentTab === 'reviewAdvancedConfig';

    let backdropClasses = classNames({
      'modal-backdrop': true,
      'default-cursor': isAdvanced
    });

    let modalClasses = classNames('modal modal-install-package', {
      'modal-large modal-install-package-advanced-view': isAdvanced,
      'modal-small': !isAdvanced
    });

    let modalWrapperClasses = classNames({
      'multiple-form-modal modal-form': isAdvanced
    });

    return (
      <Modal
        ref={this.handleModalRef}
        backdropClass={backdropClasses}
        closeByBackdropClick={!isAdvanced}
        modalClass={modalClasses}
        modalWrapperClass={modalWrapperClasses}
        onClose={this.handleModalClose}
        open={props.open}
        scrollContainerClass="modal-install-package-scroll-container"
        showFooter={false}
        useGemini={false}>
        {this.getModalContents()}
      </Modal>
    );
  }
}

InstallPackageModal.defaultProps = {
  onClose() {},
  open: false
};

InstallPackageModal.propTypes = {
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string,
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = InstallPackageModal;
