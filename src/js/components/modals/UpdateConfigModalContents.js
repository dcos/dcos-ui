import React from 'react';

import AdvancedConfig from '../AdvancedConfig';
import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import Service from '../../structs/Service';
import ServicePlan from '../../structs/ServicePlan';
import UniversePackage from '../../structs/UniversePackage';

const METHODS_TO_BIND = [
  'handleAdvancedFormChange',
  'handleConfigSave',
  'getConfigSubmit'
];

class UpdateConfigModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      hasFormErrors: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
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
      // TODO: Create the proper action for updating the configuration,
      // install is not the correct action.
      // https://mesosphere.atlassian.net/browse/DCOS-6729
      CosmosPackagesStore.installPackage(name, version, model);
      this.props.setPendingRequest(true);
    }
  }

  getConfigSubmit(triggerSubmit) {
    this.triggetConfigSubmit = triggerSubmit;
  }

  getUpdateErrorContent() {
    let {updateError} = this.props;

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
    // https://mesosphere.atlassian.net/browse/DCOS-6639
    return null;
  }

  getPackageConfigurationModalFooter() {
    let {hasFormErrors} = this.state;
    let {pendingRequest, updateError, updateSuccess} = this.props;

    if (updateError) {
      return (
        <div className="button-collection horizontal-center flush-bottom">
          <button
            disabled={pendingRequest}
            className="button flush-bottom button-wide"
            onClick={this.props.handleErrorConfigEditClick}>
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
            onClick={this.props.onClose}>
            <i className="icon icon-sprite icon-sprite-mini
              icon-sprite-mini-white icon-check-mark" />
          </button>
        </div>
      );
    }

    return (
      <div className="button-collection flush-bottom">
        <button className="button button-large"
          onClick={this.props.onClose}>
          Back
        </button>
        <button disabled={hasFormErrors}
          className="button button-large button-success"
          onClick={this.handleConfigSave}>
          Save Configuration
        </button>
      </div>
    );
  }

  getPackageConfigurationModalContents(service) {
    // TODO: The currentConfiguration needs to be populated with the package's
    // current configuration.
    // https://mesosphere.atlassian.net/browse/DCOS-6638
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

  render() {
    let {servicePackage, updateError} = this.props;
    let modalContent;

    if (!servicePackage) {
      return null;
    }

    if (updateError) {
      modalContent = this.getUpdateErrorContent();
    } else if (servicePackage instanceof UniversePackage) {
      modalContent = this.getPackageConfigurationModalContents(servicePackage);
    } else {
      modalContent = this.getMarathonConfigurationModalContents(servicePackage);
    }

    return (
      <div>
        {modalContent}
        <div className="modal-footer">
          {this.getPackageConfigurationModalFooter()}
        </div>
      </div>
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
  servicePlan: React.PropTypes.instanceOf(ServicePlan),
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = UpdateConfigModal;
