import {Dropdown, Modal} from 'reactjs-components';
import React from 'react';

const METHODS_TO_BIND = ['handleUpgradeStart', 'handleVersionSelection'];

class PackageUpgradeConfirmation extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      upgradeVersion: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleUpgradeStart() {
    let upgradeVersion = this.state.upgradeVersion;
    if (!upgradeVersion) {
      upgradeVersion = this.getLatestVersion(this.props.servicePlan);
    }

    console.log(`starting upgrade to ${upgradeVersion}`);
  }

  handleVersionSelection(version) {
    this.setState({upgradeVersion: version.id});
  }

  getLatestVersion(servicePlan) {
    let availableVersions = servicePlan.getUpgradeVersions();
    return availableVersions[availableVersions.length - 1];
  }

  getVersionDropdownItems(availableVersions) {
    return availableVersions.map(function (version) {
      return {id: version, html: `Version ${version}`};
    });
  }

  getModalContents() {
    let {servicePlan} = this.props;
    let packageName = servicePlan.getName();
    let packageVersion = servicePlan.getCurrentVersion();

    return (
      <div className="modal-content">
        <div className="modal-content-inner container container-pod
          container-pod-short horizontal-center">
          <div className="icon icon-jumbo icon-image-container
            icon-app-container">
            <img src={servicePlan.getIcons()['icon-large']} />
          </div>
          <h2 className="short">{packageName}</h2>
          <p className="flush">
            {packageName} {packageVersion}
          </p>
        </div>
      </div>
    );
  }

  getModalFooter() {
    let servicePlan = this.props.servicePlan;

    return (
      <div className="button-collection button-collection-stacked">
        <Dropdown
          buttonClassName="button button-wide dropdown-toggle
            text-align-center flush"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          initialID={this.getLatestVersion(servicePlan)}
          items={this.getVersionDropdownItems(
            servicePlan.getUpgradeVersions()
          )}
          onItemSelection={this.handleVersionSelection}
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="dropdown dropdown-wide
            button-collection-spacing" />
        <button
          disabled={this.props.pendingRequest}
          className="button button-success button-wide"
          onClick={this.handleUpgradeStart}>
          Start Upgrade
        </button>
      </div>
    );
  }

  render() {
    let {props} = this;

    if (!props.open) {
      return null;
    }

    return (
      <Modal
        bodyClass="modal-content allow-overflow"
        footer={this.getModalFooter()}
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass="modal modal-narrow"
        onClose={props.onClose}
        open={props.open}
        showCloseButton={false}
        showFooter={true}
        useGemini={false}>
        {this.getModalContents()}
      </Modal>
    );
  }
}

PackageUpgradeConfirmation.defaultProps = {
  onClose: function () {},
  open: false
};

PackageUpgradeConfirmation.propTypes = {
  onClose: React.PropTypes.func,
  open: React.PropTypes.bool
};

module.exports = PackageUpgradeConfirmation;
