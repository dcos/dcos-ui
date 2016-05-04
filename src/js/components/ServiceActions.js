import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import Framework from '../structs/Framework';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Service from '../structs/Service';
import UpdateConfigModal from './modals/UpdateConfigModal';

const METHODS_TO_BIND = [
  'handleEditConfigClick',
  'handleConfigModalClose'
];

class ServiceActions extends mixin(InternalStorageMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      editConfigModalOpen: false
    };

    this.internalStorage_set({
      servicePackage: null
    });

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

    if (this.props.service instanceof Framework) {
      let serviceMetadata = this.props.service.getMetadata();
      let {name, version} = serviceMetadata;

      CosmosPackagesStore.fetchPackageDescription(name, version);
    }
  }

  onCosmosPackagesStoreDescriptionError() {
    this.internalStorage_update({servicePackage: null});
    this.forceUpdate();
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    this.internalStorage_update({
      servicePackage: CosmosPackagesStore.getPackageDetails()
    });
    this.forceUpdate();
  }

  handleEditConfigClick() {
    let {servicePackage} = this.internalStorage_get();

    if (servicePackage != null) {
      this.setState({editConfigModalOpen: true});
    }
  }

  handleConfigModalClose() {
    this.setState({editConfigModalOpen: false});
  }

  render() {
    let {service} = this.props;
    let {editConfigModalOpen} = this.state;
    let {servicePackage} = this.internalStorage_get();

    let editButotnClasses = classNames('button button-inverse button-stroke', {
      'disabled': servicePackage == null
    });

    let serviceActions = [
      <a className={editButotnClasses} key="edit-config"
        onClick={this.handleEditConfigClick}>
        Edit
        <UpdateConfigModal open={editConfigModalOpen}
          onClose={this.handleConfigModalClose} service={service}
          servicePackage={servicePackage} />
      </a>
    ];

    if (service.getWebURL && service.getWebURL()) {
      serviceActions.unshift(
        <a className="button button-primary" href={service.getWebURL()}
          target="_blank" key="open-service">
          Open Service
        </a>
      );
    }

    return (
      <div className="button-collection flush-bottom">
        {serviceActions}
      </div>
    );
  }
}

ServiceActions.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceActions;
