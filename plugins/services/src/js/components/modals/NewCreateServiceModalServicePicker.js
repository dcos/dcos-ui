import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../../../../../../src/js/stores/CosmosPackagesStore';
import defaultServiceImage from '../../../img/icon-service-default-medium@2x.png';
import Image from '../../../../../../src/js/components/Image';
import Loader from '../../../../../../src/js/components/Loader';
import Panel from '../../../../../../src/js/components/Panel';

class NewCreateServiceModalServicePicker extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorMessage: null,
      isLoading: true
    };

    this.store_listeners = [
      {
        name: 'cosmosPackages',
        events: ['availableError', 'availableSuccess'],
        suppressUpdate: true
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchAvailablePackages();
  }

  onCosmosPackagesStoreAvailableError(errorMessage) {
    this.setState({errorMessage});
  }

  onCosmosPackagesStoreAvailableSuccess() {
    this.setState({errorMessage: null, isLoading: false});
  }

  handleServiceSelect(service) {
    this.props.onServiceSelect(service);
  }

  getCustomServiceGrid() {
    let customOptions = [{
      icon: (
        <Image fallbackSrc={defaultServiceImage} src={defaultServiceImage} />
      ),
      label: 'Container Service'
    }, {
      icon: (
        <Image fallbackSrc={defaultServiceImage} src={defaultServiceImage} />
      ),
      label: 'Docker Compose'
    }, {
      icon: (
        <Image fallbackSrc={defaultServiceImage} src={defaultServiceImage} />
      ),
      label: 'JSON Configuration'
    }, {
      icon: (
        <Image fallbackSrc={defaultServiceImage} src={defaultServiceImage} />
      ),
      label: 'Kubernetes YAML'
    }].map((item, index) => {
      return this.getServiceOption(
        this.getServiceOptionIconWrapper(item.icon),
        item.label,
        index,
        item
      );
    });

    return (
      <div className="panel-grid row">
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
    return (
      <div className="container">
        <div className="pod pod-taller flush-top flush-right flush-left">
          <h3 className="short flush-top">
            Run your own Service
          </h3>
          <p className="lead tall">
            Create serice from one or more containers, run a command, or run from
            Docker Compose.
          </p>
          {this.getCustomServiceGrid()}
        </div>
        <div>
          <h3 className="short flush-top">
            or, Run a DC/OS Service from Universe
          </h3>
          <p className="lead tall">
            Don't see the service you were looking for? Contact your
            administrator to make it available.
          </p>
          {this.getUniversePackagesGrid()}
        </div>
      </div>
    );
  }

  getServiceOption(icon, title, index, service) {
    return (
      <div className="panel-grid-item column-6 column-small-4 column-large-3"
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
    let packages = CosmosPackagesStore.getAvailablePackages();
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
    if (this.state.isLoading) {
      return (
        <div className="flex-item-grow-1">
          <Loader className="inverse" />
        </div>
      );
    }

    if (this.state.errorMessage != null) {
      return this.state.errorMessage;
    }

    return this.getServiceDeployOptions();
  }
}

NewCreateServiceModalServicePicker.propTypes = {
  onServiceSelect: React.PropTypes.func
};

module.exports = NewCreateServiceModalServicePicker;
