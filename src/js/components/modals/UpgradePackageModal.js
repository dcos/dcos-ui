import {Dropdown, Modal} from 'reactjs-components';
import React from 'react';

const METHODS_TO_BIND = ['handleUpgradeStart', 'handleVersionSelection'];

class UpgradePackageModal extends React.Component {
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
      upgradeVersion = this.getLatestVersion(this.props.cosmosPackage);
    }

    console.log(`starting upgrade to ${upgradeVersion}`);
  }

  handleVersionSelection(version) {
    this.setState({upgradeVersion: version.id});
  }

  getLatestVersion(cosmosPackage) {
    let availableVersions = cosmosPackage.getUpgradeVersions();
    return availableVersions[availableVersions.length - 1];
  }

  getVersionDropdownItems(availableVersions) {
    return availableVersions.map(function (version) {
      return {id: version, html: `Version ${version}`};
    });
  }

  getModalContents() {
    if (!this.props.open) {
      return null;
    }

    let {cosmosPackage, packageName, packageVersion} = this.props;

    return (
      <div>
        <div className="modal-content">
          <div className="modal-content-inner container container-pod
            container-pod-short horizontal-center">
            <div className="icon icon-jumbo icon-image-container
              icon-app-container">
              <img src={cosmosPackage.getIcons()['icon-large']} />
            </div>
            <h2 className="short">{packageName}</h2>
            <p className="flush">
              {packageName} {packageVersion}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <div className="container">
            <div className="button-collection button-collection-stacked">
              <Dropdown
                buttonClassName="button button-wide dropdown-toggle
                  text-align-center flush"
                dropdownMenuClassName="dropdown-menu"
                dropdownMenuListClassName="dropdown-menu-list"
                initialID={this.getLatestVersion(cosmosPackage)}
                items={this.getVersionDropdownItems(
                  cosmosPackage.getUpgradeVersions()
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
          </div>
        </div>
      </div>
    );
  }

  render() {
    let {props} = this;

    return (
      <Modal
        bodyClass="modal-content allow-overflow"
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass="modal modal-narrow"
        onClose={props.onClose}
        open={props.open}
        showCloseButton={false}
        useGemini={false}>
        {this.getModalContents()}
      </Modal>
    );
  }
}

UpgradePackageModal.defaultProps = {
  onClose: function () {},
  open: false
};

UpgradePackageModal.propTypes = {
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string,
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = UpgradePackageModal;
