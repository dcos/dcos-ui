import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AdvancedConfig from '../AdvancedConfig';
import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import Service from '../../structs/Service';
import StringUtil from '../../utils/StringUtil';
import UniversePackage from '../../structs/UniversePackage';
import Util from '../../utils/Util';

const METHODS_TO_BIND = [
  'handleAdvancedFormChange',
  'handleConfigSave',
  'handleErrorConfigEditClick',
  'handleModalClose',
  'getConfigSubmit'
];

class UpdateConfigModal extends mixin(InternalStorageMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.internalStorage_set({
      hasFormErrors: false,
      updateError: null,
      pendingRequest: false,
      updateSuccess: false
    });

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
    this.internalStorage_update({
      updateError: error,
      pendingRequest: false,
      updateSuccess: false
    });
    this.forceUpdate();
  }

  onCosmosPackagesStoreInstallSuccess() {
    this.internalStorage_update({
      updateError: null,
      pendingRequest: false,
      updateSuccess: true
    });
    this.forceUpdate();
  }

  handleAdvancedFormChange(formData) {
    this.internalStorage_update({hasFormErrors: !formData.isValidated});
    this.forceUpdate();
  }

  handleConfigSave() {
    let serviceMetadata = this.props.service.getMetadata();
    let {name, version} = serviceMetadata;

    let {isValidated, model} = this.triggetConfigSubmit();

    if (isValidated) {
      CosmosPackagesStore.installPackage(name, version, model);
    }

    this.internalStorage_update({pendingRequest: true});
    this.forceUpdate();
  }

  handleErrorConfigEditClick() {
    this.internalStorage_update({updateError: null});
    this.forceUpdate();
  }

  handleModalClose() {
    this.internalStorage_update({
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
    let {updateError} = this.internalStorage_get();

    return (
      <CosmosErrorMessage
        className="text-error-state text-overflow-break-word text-align-center"
        error={updateError}
        wrapperClass="modal-content-inner container container-pod
          container-pod-short horizontal-center" />
    );
  }

  getModalContents() {
    let {updateError, updateSuccess} = this.internalStorage_get();
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

  getMarathonConfigurationModalContents() {
    // TODO: The marathon configuration modal content needs to be returned.
    // JIRA Task DCOS-6639
    return null;
  }

  getPackageConfigurationModalFooter() {
    let {hasFormErrors, pendingRequest,
      updateError, updateSuccess} = this.internalStorage_get();

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
          onClick={function () {}}>
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
    let {name, version} = service.get('package');
    let icon = service.getIcons()['icon-small'];
    let schema = service.get('config');

    return (
      <AdvancedConfig model={currentConfiguration} packageIcon={icon}
        packageName={name} packageVersion={version} schema={schema}
        onChange={this.handleAdvancedFormChange}
        getTriggerSubmit={this.getConfigSubmit} />
    );
  }

  getUpdateSuccessContent() {
    let {servicePackage} = this.props;

    let notes = Util.findNestedPropertyInObject(
      servicePackage.get('package'),
      'postInstallNotes'
    );

    let parsedNotes = StringUtil.parseMarkdown(notes);

    return (
      <div className="horizontal-center modal-content-inner container
        container-pod container-pod-short text-align-center">
        <h2 className="flush-top short-bottom">Success!</h2>
        <div style={{width: '100%', overflow: 'auto', wordWrap: 'break-word'}}
          dangerouslySetInnerHTML={parsedNotes} />
      </div>
    );
  }

  render() {
    let {updateError, updateSuccess} = this.internalStorage_get();

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

UpdateConfigModal.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = UpdateConfigModal;
