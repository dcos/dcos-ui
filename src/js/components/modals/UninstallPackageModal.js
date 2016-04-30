import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Config from '../../config/Config';
import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';

const METHODS_TO_BIND = [
  'handleClose',
  'handleUninstallPackage'
];

class UninstallPackageModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      packageUninstallError: null,
      pendingUninstallRequest: false
    };

    this.store_listeners = [
      {
        name: 'cosmosPackages',
        events: ['uninstallError', 'uninstallSuccess'],
        unmountWhen: function () {
          return true;
        },
        listenAlways: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreUninstallError(packageUninstallError) {
    this.setState({packageUninstallError, pendingUninstallRequest: false});
  }

  onCosmosPackagesStoreUninstallSuccess() {
    this.setState(
      {packageUninstallError: null, pendingUninstallRequest: false},
      this.props.handleUninstallFinish
    );
  }

  handleClose() {
    this.setState({
      uninstallSuccess: false,
      packageUninstallError: null,
      pendingUninstallRequest: false
    });
    this.props.onClose();
  }

  handleUninstallPackage() {
    let {cosmosPackage} = this.props;
    let appId;
    let packageName;
    let packageVersion;
    if (cosmosPackage) {
      appId = cosmosPackage.getAppId();
      packageName = cosmosPackage.getName();
      packageVersion = cosmosPackage.getCurrentVersion();
    }

    CosmosPackagesStore.uninstallPackage(
      packageName,
      packageVersion,
      appId
    );

    this.setState({pendingUninstallRequest: true});
  }

  getEmptyNode() {
    return <div />;
  }

  getErrorMessage() {
    let {packageUninstallError} = this.state;
    if (!packageUninstallError) {
      return null;
    }

    return (
      <CosmosErrorMessage
        className="text-error-state text-overflow-break-word"
        error={packageUninstallError}
        header="" />
    );
  }

  getUninstallModalContent() {
    let {cosmosPackage} = this.props;
    if (!cosmosPackage) {
      return this.getEmptyNode();
    }

    return (
      <div className="container-pod container-pod-short text-align-center">
        <h3 className="flush-top">Are you sure?</h3>
        <p>
          {`${cosmosPackage.getAppIdName()} will be uninstalled from ${Config.productName}. All tasks belonging to this package will be killed.`}
        </p>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    let {props: {onClose, open}, state: {pendingUninstallRequest}} = this;
    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={pendingUninstallRequest}
        footerContainerClass="container container-pod container-pod-short
          container-pod-fluid flush-top flush-bottom"
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        rightButtonCallback={this.handleUninstallPackage}
        rightButtonClassName="button button-danger"
        rightButtonText="Uninstall">
        {this.getUninstallModalContent()}
      </Confirm>
    );
  }
}

UninstallPackageModal.defaultProps = {
  handleUninstallFinish: function () {},
  onClose: function () {},
  open: false
}

UninstallPackageModal.propTypes = {
  cosmosPackage: React.PropTypes.object,
  handleUninstallFinish: React.PropTypes.func,
  onClose: React.PropTypes.func,
  open: React.PropTypes.bool
}

module.exports = UninstallPackageModal;
