/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import defaultServiceImage from '../../../img/icon-service-default-medium@2x.png';
import jsonServiceImage from '../../../img/service-image-json-medium@2x.png';
import CosmosPackagesStore from '../../../../../../src/js/stores/CosmosPackagesStore';
import Image from '../../../../../../src/js/components/Image';
import Panel from '../../../../../../src/js/components/Panel';

class NewCreateServiceModalServicePicker extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };
  }

  handleServiceSelect(service) {
    this.props.onServiceSelect(service);
  }

  getCustomServiceGrid() {
    let customOptions = [{
      icon: (
        <Image fallbackSrc={defaultServiceImage} src={defaultServiceImage} />
      ),
      label: 'Use the Form',
      type: 'app'
    }, {
      icon: (
        <Image fallbackSrc={jsonServiceImage} src={jsonServiceImage} />
      ),
      label: 'Enter JSON',
      type: 'json'
    }].map((item, index) => {
      return this.getServiceOption(
        this.getServiceOptionIconWrapper(item.icon),
        item.label,
        index,
        item
      );
    });

    return (
      <div className="create-service-modal-service-picker-options panel-grid row">
        {customOptions}
      </div>
    );
  }

  getPackageIcon(cosmosPackage) {
    return (
      <Image
        fallbackSrc={defaultServiceImage}
        src={cosmosPackage.getIcons()['icon-medium']} />
    );
  }

  getServiceDeployOptions() {
    // TODO: Implement the correct copy when received. DCOS-11807
    return (
      <div className="create-service-modal-service-picker container text-align-center">
        <h4 className="short flush-top">
          Run your own Service
        </h4>
        <p className="lead tall">
          Create a containerized service or run a command in one of two ways: use our form to be guided through the correct configuration, or enter your JSON configuration directly.
        </p>
        {this.getCustomServiceGrid()}
      </div>
    );
  }

  getServiceOption(icon, title, index, service) {
    return (
      <div className="create-service-modal-service-picker-option panel-grid-item column-12 column-small-4 column-large-3"
        key={index}>
        <Panel className="panel-interactive clickable"
          contentClass={[
            'horizontal-center panel-cell-short flush-top',
            {
              'panel-cell-shorter': false
            }
          ]}
          heading={icon}
          headingClass={[
            'panel-cell-borderless horizontal-center panel-cell-short',
            {
              'panel-cell-light': false,
              'panel-cell-shorter': false
            }
          ]}
          onClick={this.handleServiceSelect.bind(this, service)}>
          <h5 className="flush text-align-center">
            {title}
          </h5>
        </Panel>
      </div>
    );
  }

  getServiceOptionIconWrapper(icon) {
    return (
      <div className="icon icon-jumbo icon-image-container icon-app-container icon-default-white">
        {icon}
      </div>
    );
  }

  getUniversePackagesGrid() {
    const packages = CosmosPackagesStore.getAvailablePackages();
    let packagesGrid = packages.getItems().map((cosmosPackage, index) => {
      return this.getServiceOption(
        this.getServiceOptionIconWrapper(this.getPackageIcon(cosmosPackage)),
        cosmosPackage.getName(),
        index,
        cosmosPackage
      );
    });

    return (
      <div className="panel-grid row">
        {packagesGrid}
      </div>
    );
  }

  render() {
    return this.getServiceDeployOptions();
  }
}

NewCreateServiceModalServicePicker.propTypes = {
  onServiceSelect: React.PropTypes.func
};

module.exports = NewCreateServiceModalServicePicker;
