import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import Icon from '../Icon';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
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
      truncatedPreinstallNotes: true
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
        truncatedPreinstallNotes: true
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
    if (!SchemaUtil.validateSchema(cosmosPackage.get('config'))) {
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
    let {name, version} = CosmosPackagesStore
      .getPackageDetails().get('package');
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
    let truncatedPreinstallNotes = !this.state.truncatedPreinstallNotes;
    this.setState({truncatedPreinstallNotes});
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
        SchemaUtil.schemaToMultipleDefinition(cosmosPackage.get('config'))
      );
    }

    return {};
  }

  getLoadingScreen() {
    return (
      <div className="container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getInstallErrorScreen() {
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    let {pendingRequest, installError} = this.internalStorage_get();

    return (
      <div className="modal-content">
        <div className="modal-content-inner container container-pod container-pod-short horizontal-center">
          <CosmosErrorMessage
            className="text-error-state text-overflow-break-word"
            error={installError}
            wrapperClass="" />
        </div>
        <div className="modal-footer">
          <div className="container">
            <div className="button-collection horizontal-center flush-bottom">
              <button
                disabled={!cosmosPackage || pendingRequest}
                className="button flush-bottom button-wide"
                onClick={this.handleChangeTab.bind(this, 'advancedInstall')}>
                Edit Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getPreinstallNotes(notes, truncated) {
    if (!notes) {
      return null;
    }

    if (truncated) {
      notes = notes.slice(0, PREINSTALL_NOTES_CHAR_LIMIT);
    }

    return (
      <p className="small flush-bottom">
        <span className="mute">
          {notes}{this.getPreinstallNotesToggle(truncated, notes)}
        </span>
      </p>
    );
  }

  getPreinstallNotesToggle(truncated, notes) {
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
    let preinstallNotes = cosmosPackage.getPreinstallNotes();
    let {name, version} = cosmosPackage.get('package');
    let truncated = this.state.truncatedPreinstallNotes;
    let packageVersionClasses = classNames({
      'flush-bottom': !preinstallNotes
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
        <div className="modal-content">
          <div className="modal-content-inner modal-content-inner-tall horizontal-center">
            <div className="icon icon-jumbo icon-image-container icon-app-container">
              <img src={cosmosPackage.getIcons()['icon-large']} />
            </div>
            <p className="h2 short-top short-bottom">{name}</p>
            <p className={packageVersionClasses}>{version}</p>
            {this.getPreinstallNotes(preinstallNotes, truncated)}
            {error}
          </div>
        </div>
        <div className="modal-footer">
          <div className="container">
            <div className="button-collection horizontal-center flush-bottom">
              <button
                disabled={!cosmosPackage || pendingRequest || descriptionError}
                className="button button-success flush-bottom button-wide flush-top flush-bottom"
                onClick={this.handleInstallPackage}>
                {buttonText}
              </button>
              <button
                disabled={!cosmosPackage || pendingRequest}
                className="button flush-bottom button-link button-primary clickable"
                onClick={this.handleChangeTab.bind(this, 'advancedInstall')}>
                Advanced Installation
              </button>
            </div>
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
        <div className="container">
          <div className="button-collection flush-bottom">
            <button
              className="button button-large flush-top flush-bottom"
              onClick={this.handleChangeTab.bind(this, 'defaultInstall')}>
              Back
            </button>
            <button
              disabled={!cosmosPackage || pendingRequest || hasFormErrors}
              className="button button-large button-success flush-bottom"
              onClick={this.handleChangeTab.bind(this, 'reviewAdvancedConfig')}>
              Review and Install
            </button>
          </div>
        </div>
      </div>
    );

  }

  renderReviewAdvancedConfigTabView() {
    let {pendingRequest} = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    let {name, version} = cosmosPackage.get('package');
    let buttonText = 'Install';

    if (pendingRequest) {
      buttonText = 'Installing...';
    }

    return (
      <div>
        <ReviewConfig
          packageIcon={cosmosPackage.getIcons()['icon-small']}
          packageName={name}
          packageVersion={version}
          configuration={this.getPackageConfiguration()} />
        <div className="modal-footer">
          <div className="container">
            <div className="button-collection flush-bottom">
              <button
                className="button button-large flush-top flush-bottom"
                onClick={this.handleChangeTab.bind(this, 'advancedInstall')}>
                Back
              </button>
              <button
                disabled={!cosmosPackage || pendingRequest}
                className="button button-success flush-bottom button-large"
                onClick={this.handleInstallPackage}>
                {buttonText}
              </button>
            </div>
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
        <div className="modal-content">
          <div className="horizontal-center modal-content-inner container container-pod container-pod-short text-align-center">
            <span className="text-success">
              <Icon id="ring-check" size="jumbo" />
            </span>
            <h2 className="short-top short-bottom">Success!</h2>
            <div
              style={{width: '100%', overflow: 'auto', wordWrap: 'break-word'}}
              dangerouslySetInnerHTML={parsedNotes} />
          </div>
        </div>
        <div className="modal-footer">
          <div className="container">
            <div className="button-collection horizontal-center flush-bottom">
              <button
                disabled={!cosmosPackage || pendingRequest}
                className="button button-success flush-bottom button-wide"
                onClick={this.props.onClose}>
                OK
              </button>
            </div>
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
      <div className="modal-content">
        <div className="modal-content-inner container container-pod container-pod-short horizontal-center">
          <h3>Invalid Configuration</h3>
          <p className="text-danger text-align-center">
            {errorText}
          </p>
        </div>
        <div className="modal-footer">
          <div className="container">
            <div className="button-collection horizontal-center flush-bottom">
              <button
                className="button flush-bottom button-wide"
                onClick={this.handleModalClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getModalContents() {
    let {currentTab, schemaIncorrect} = this.state;
    let {isLoading} = this.internalStorage_get();
    let cosmosPackage = CosmosPackagesStore.getPackageDetails();

    if (schemaIncorrect) {
      return this.getIncorrectSchemaWarning(cosmosPackage);
    }

    if (isLoading || !cosmosPackage) {
      return this.getLoadingScreen();
    }

    let {name, version} = cosmosPackage.get('package');
    let advancedConfigClasses = classNames({
      hidden: currentTab !== 'advancedInstall'
    });

    return (
      <div>
        <div className={advancedConfigClasses}>
          <SchemaForm
            packageIcon={cosmosPackage.getIcons()['icon-small']}
            packageName={name}
            packageVersion={version}
            schema={cosmosPackage.get('config')}
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

    let modalClasses = classNames('modal', {
      'modal-large': isAdvanced,
      'modal-narrow': !isAdvanced
    });

    let modalWrapperClasses = classNames({
      'multiple-form-modal': isAdvanced
    });

    return (
      <Modal
        backdropClass={backdropClasses}
        bodyClass=""
        closeByBackdropClick={!isAdvanced}
        maxHeightPercentage={1}
        modalClass={modalClasses}
        modalWrapperClass={modalWrapperClasses}
        onClose={this.handleModalClose}
        open={props.open}
        scrollContainerClass=""
        showCloseButton={false}
        showFooter={false}>
        {this.getModalContents()}
      </Modal>
    );
  }
}

InstallPackageModal.defaultProps = {
  onClose: function () {},
  open: false
};

InstallPackageModal.propTypes = {
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string,
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = InstallPackageModal;
