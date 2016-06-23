import classNames from 'classnames';
import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Config from '../../config/Config';
import CosmosErrorMessage from '../CosmosErrorMessage';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import Icon from '../Icon';

const METHODS_TO_BIND = [
  'handleClose',
  'handleUninstallPackage'
];

class UninstallPackageModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      uninstallSuccess: false,
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
    let {handleUninstallFinish} = this.props;
    this.setState(
      {
        uninstallSuccess: true,
        packageUninstallError: null,
        pendingUninstallRequest: false
      },
      handleUninstallFinish
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

  getPostUninstallNotes() {
    let {cosmosPackage} = this.props;

    if (!cosmosPackage) {
      return this.getEmptyNode();
    }

    let name = cosmosPackage.getAppIdName();
    let notes = cosmosPackage.getPostUninstallNotes();

    return (
      <div className="container-pod container-pod-short text-align-center">
        <span className="text-success">
          <Icon id="ring-check" size="jumbo" />
        </span>
        <h3 className="short-top">{`${name} Uninstalled`}</h3>
        <p className="small flush-bottom">
          {notes}
        </p>
      </div>
    );
  }

  getUninstallModalContent() {
    let {props: {cosmosPackage}, state: {uninstallSuccess}} = this;

    if (uninstallSuccess) {
      return this.getPostUninstallNotes();
    }

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
    let {
      handleClose,
      props: {open},
      state: {pendingUninstallRequest, uninstallSuccess}
    } = this;

    let rightButtonClassName = classNames('button button-danger', {
      'hidden': uninstallSuccess
    });

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={pendingUninstallRequest}
        footerContainerClass="container container-pod container-pod-short
          container-pod-fluid flush-top flush-bottom"
        open={open}
        onClose={handleClose}
        leftButtonCallback={handleClose}
        leftButtonText="Close"
        rightButtonClassName={rightButtonClassName}
        rightButtonCallback={this.handleUninstallPackage}
        rightButtonClassName={rightButtonClassName}
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
