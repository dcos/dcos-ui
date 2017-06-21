import classNames from "classnames";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import Config from "../../config/Config";
import CosmosErrorMessage from "../CosmosErrorMessage";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import Icon from "../Icon";

const METHODS_TO_BIND = ["handleClose", "handleUninstallPackage"];

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
        name: "cosmosPackages",
        events: ["uninstallError", "uninstallSuccess"],
        listenAlways: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreUninstallError(packageUninstallError) {
    this.setState({ packageUninstallError, pendingUninstallRequest: false });
  }

  onCosmosPackagesStoreUninstallSuccess() {
    const { handleUninstallFinish } = this.props;
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
    const { cosmosPackage } = this.props;
    let appId;
    let packageName;
    let packageVersion;
    if (cosmosPackage) {
      appId = cosmosPackage.getAppId();
      packageName = cosmosPackage.getName();
      packageVersion = cosmosPackage.getCurrentVersion();
    }

    CosmosPackagesStore.uninstallPackage(packageName, packageVersion, appId);

    this.setState({ pendingUninstallRequest: true });
  }

  getEmptyNode() {
    return <div />;
  }

  getErrorMessage() {
    const { packageUninstallError } = this.state;
    if (!packageUninstallError) {
      return null;
    }

    return (
      <CosmosErrorMessage error={packageUninstallError} flushBottom={true} />
    );
  }

  getPostUninstallNotes() {
    const { cosmosPackage } = this.props;

    if (!cosmosPackage) {
      return this.getEmptyNode();
    }

    const name = cosmosPackage.getAppIdName();
    const notes = cosmosPackage.getPostUninstallNotes();

    return (
      <div className="pod pod-short flush-right flush-left text-align-center">
        <span className="text-success">
          <Icon id="circle-check" size="large" color="green" />
        </span>
        <h3 className="short-top">{`${name} Uninstalled`}</h3>
        <p className="small flush-bottom">
          {notes}
        </p>
      </div>
    );
  }

  getUninstallModalContent() {
    const { props: { cosmosPackage }, state: { uninstallSuccess } } = this;

    if (uninstallSuccess) {
      return this.getPostUninstallNotes();
    }

    if (!cosmosPackage) {
      return this.getEmptyNode();
    }

    const errorMessage = this.getErrorMessage();
    const paragraphTagClasses = classNames({
      "flush-bottom": errorMessage == null
    });

    return (
      <div className="text-align-center">
        <h3 className="flush-top">Are you sure?</h3>
        {errorMessage}
        <p className={paragraphTagClasses}>
          {`${cosmosPackage.getAppIdName()} will be uninstalled from ${Config.productName}. All tasks belonging to this package will be killed.`}
        </p>
      </div>
    );
  }

  render() {
    const {
      handleClose,
      props: { open },
      state: { pendingUninstallRequest, uninstallSuccess }
    } = this;

    const rightButtonClassName = classNames("button button-danger", {
      hidden: uninstallSuccess
    });

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={pendingUninstallRequest}
        open={open}
        onClose={handleClose}
        leftButtonCallback={handleClose}
        leftButtonText="Close"
        rightButtonCallback={this.handleUninstallPackage}
        rightButtonClassName={rightButtonClassName}
        rightButtonText="Uninstall"
      >
        {this.getUninstallModalContent()}
      </Confirm>
    );
  }
}

UninstallPackageModal.defaultProps = {
  handleUninstallFinish() {},
  onClose() {},
  open: false
};

UninstallPackageModal.propTypes = {
  cosmosPackage: React.PropTypes.object,
  handleUninstallFinish: React.PropTypes.func,
  onClose: React.PropTypes.func,
  open: React.PropTypes.bool
};

module.exports = UninstallPackageModal;
