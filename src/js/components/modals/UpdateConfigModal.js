import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AdvancedConfig from '../AdvancedConfig';
import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import Service from '../../structs/Service';
import StringUtil from '../../utils/StringUtil';
import UniversePackage from '../../structs/UniversePackage';

const METHODS_TO_BIND = [
  'handleAdvancedFormChange',
  'handleConfigSave',
  'handleErrorConfigEditClick',
  'handleModalClose',
  'getConfigSubmit'
];

class UpdateConfigModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      hasFormErrors: false,
      updateError: null,
      pendingRequest: false,
      updateSuccess: false
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: [
        'installError',
        'installSuccess'
      ]
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreInstallError(error) {
    this.setState({
      updateError: error,
      pendingRequest: false,
      updateSuccess: false
    });
  }

  onCosmosPackagesStoreInstallSuccess() {
    this.setState({
      updateError: null,
      pendingRequest: false,
      updateSuccess: true
    });
  }

  handleAdvancedFormChange(formData) {
    this.setState({hasFormErrors: !formData.isValidated});
  }

  handleConfigSave() {
    let serviceMetadata = this.props.service.getMetadata();
    let {name, version} = serviceMetadata;

    let {isValidated, model} = this.triggetConfigSubmit();

    if (isValidated) {
      CosmosPackagesStore.installPackage(name, version, model);
      this.setState({pendingRequest: true});
    }
  }

  handleErrorConfigEditClick() {
    this.setState({updateError: null});
  }

  handleModalClose() {
    this.setState({
      pendingRequest: false,
      updateError: null,
      updateSuccess: false
    });
    this.props.onClose();
  }

  getConfigSubmit(triggerSubmit) {
    this.triggetConfigSubmit = triggerSubmit;
  }

  getUpdateErrorContent() {
    let {updateError} = this.state;

    return (
      <CosmosErrorMessage
        className="text-error-state text-overflow-break-word text-align-center"
        error={updateError}
        wrapperClass="modal-content-inner container container-pod
          container-pod-short horizontal-center" />
    );
  }

  getMarathonConfigurationModalContents() {
    // TODO: The marathon configuration modal content needs to be returned.
    // JIRA Task DCOS-6639
    return null;
  }

  getPackageConfigurationModalFooter() {
    let {hasFormErrors, pendingRequest, updateError,
      updateSuccess} = this.state;

    if (updateError) {
      return (
        <div className="button-collection horizontal-center flush-bottom">
          <button
            disabled={pendingRequest}
            className="button flush-bottom button-wide"
            onClick={this.handleErrorConfigEditClick}>
            Edit Configuration
          </button>
        </div>
      );
    }

    if (updateSuccess) {
      return (
        <div className="button-collection horizontal-center flush-bottom">
          <button
            disabled={pendingRequest}
            className="button button-success flush-bottom button-wide"
            onClick={this.handleModalClose}>
            <i className="icon icon-sprite icon-sprite-mini
              icon-sprite-mini-white icon-check-mark" />
          </button>
        </div>
      );
    }

    return (
      <div className="button-collection flush-bottom">
        <button className="button button-large flush"
          onClick={this.handleModalClose}>
          Back
        </button>
        <button disabled={hasFormErrors}
          className="button button-large button-success flush-bottom"
          onClick={this.handleConfigSave}>
          Save Configuration
        </button>
      </div>
    );
  }

  getPackageConfigurationModalContents(service) {
    // TODO: The currentConfiguration needs to be populated with the package's
    // current configuration.
    // JIRA Task DCOS-6638
    let currentConfiguration = {};
    let {name, version} = service.getPackage();
    let icon = service.getIcons()['icon-small'];
    let schema = service.getConfig();

    return (
      <AdvancedConfig
        model={currentConfiguration}
        packageIcon={icon}
        packageName={name}
        packageVersion={version}
        schema={schema}
        onChange={this.handleAdvancedFormChange}
        getTriggerSubmit={this.getConfigSubmit} />
    );
  }

  getUpdateSuccessContent() {
    let {servicePackage} = this.props;
    let notes = servicePackage.getPostInstallNotes();
    let parsedNotes = StringUtil.parseMarkdown(notes);

    return (
      <div className="horizontal-center modal-content-inner container
        container-pod container-pod-short text-align-center">
        <h2 className="flush-top short-bottom">Success!</h2>
        <div className="text-overflow-break-word"
          dangerouslySetInnerHTML={parsedNotes} />
      </div>
    );
  }

  getModalContents() {
    let {updateError, updateSuccess} = this.state;
    let {servicePackage} = this.props;

    if (!servicePackage) {
      return null;
    }

    if (updateError) {
      return this.getUpdateErrorContent();
    }

    if (updateSuccess) {
      return this.getUpdateSuccessContent();
    }

    if (servicePackage instanceof UniversePackage) {
      return this.getPackageConfigurationModalContents(servicePackage);
    }

    return this.getMarathonConfigurationModalContents(servicePackage);
  }

  render() {
    let {updateError, updateSuccess} = this.state;

    let modalClasses = classNames('modal', {
      'modal-large': updateError == null && !updateSuccess,
      'modal-narrow': !!updateError || updateSuccess
    });

    return (
      <Modal
        backdropClass="modal-backdrop"
        bodyClass=""
        footer={this.getPackageConfigurationModalFooter()}
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass={modalClasses}
        modalWrapperClass="multiple-form-modal"
        onClose={this.handleModalClose}
        open={this.props.open}
        showCloseButton={false}
        showFooter={true}>
        {this.getModalContents()}
      </Modal>
    );
  }
}

UpdateConfigModal.defaultProps = {
  onClose: function () {},
  open: false
};

UpdateConfigModal.propTypes = {
  onClose: React.PropTypes.func,
  open: React.PropTypes.bool,
  servicePackage: React.PropTypes.instanceOf(UniversePackage),
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = UpdateConfigModal;
