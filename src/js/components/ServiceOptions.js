import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import Framework from '../structs/Framework';
import Service from '../structs/Service';
import UpdateConfigModal from './modals/UpdateConfigModal'

const METHODS_TO_BIND = [
  'handleEditConfigClick',
  'handleConfigModalClose'
];

class ServiceOptions extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      editConfigModalOpen: false,
      packageFetched: false
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: [
        'descriptionError',
        'descriptionSuccess'
      ]
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    let service = this.props.service;

    if (service instanceof Framework) {
      let {name, version} = service.getMetadata();
      CosmosPackagesStore.fetchPackageDescription(name, version);
    }
  }

  onCosmosPackagesStoreDescriptionError() {
    this.setState({packageFetched: false});
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    this.setState({packageFetched: true});
  }

  handleEditConfigClick() {
    if (CosmosPackagesStore.getPackageDetails() != null) {
      this.setState({editConfigModalOpen: true});
    }
  }

  handleConfigModalClose() {
    this.setState({editConfigModalOpen: false});
  }

  getServiceOptionButtons(service) {
    let {props, state} = this;

    let editButtonClasses = classNames('button button-inverse button-stroke', {
      'disabled': !state.packageFetched
    });

    let buttons = [
      <a className={editButtonClasses} key="edit-config"
        onClick={this.handleEditConfigClick}>
        Edit
        <UpdateConfigModal open={state.editConfigModalOpen}
          onClose={this.handleConfigModalClose} service={props.service}
          servicePackage={CosmosPackagesStore.getPackageDetails()} />
      </a>
    ];

    if (service.getWebURL && service.getWebURL()) {
      buttons.unshift(
        <a className="button button-primary" href={service.getWebURL()}
          target="_blank" key="open-service">
          Open Service
        </a>
      );
    }

    return buttons;
  }

  render() {
    let {service} = this.props;

    return (
      <div className="button-collection flush-bottom">
        {this.getServiceOptionButtons(service)}
      </div>
    );
  }
}

ServiceOptions.propTypes = {
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Framework),
    React.PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceOptions;
