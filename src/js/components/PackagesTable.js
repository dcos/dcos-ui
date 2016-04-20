import classNames from 'classnames';
import {Confirm, Table} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosMessages from '../constants/CosmosMessages';
import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import Config from '../config/Config';
import PackagesTableHeaderLabels from '../constants/PackagesTableHeaderLabels';
import PackageUpgradeOverview from './PackageUpgradeOverview';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TableUtil from '../utils/TableUtil';
import UniversePackagesList from '../structs/UniversePackagesList';
import UpgradePackageModal from './modals/UpgradePackageModal';

const METHODS_TO_BIND = [
  'getHeadline',
  'getUpgradeCell',
  'getUninstallButton',
  'handleOpenConfirm',
  'handleUninstallCancel',
  'handleUninstallPackage',
  'handleUpgradeCancel',
  'handleUpgradeClick'
];

class PackagesTable extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      packageToUpgrade: null,
      packageToUninstall: null,
      packageUninstallError: null,
      pendingUninstallRequest: false,
      pendingUpgradeRequest: false
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

  onCosmosPackagesStoreUninstallError(error) {
    this.setState({packageUninstallError: error, pendingUninstallRequest: false});
  }

  onCosmosPackagesStoreUninstallSuccess() {
    this.setState({
      packageToUninstall: null,
      packageUninstallError: null,
      pendingUninstallRequest: false
    });
    CosmosPackagesStore.fetchInstalledPackages();
  }

  handleOpenConfirm(packageToUninstall) {
    this.setState({packageToUninstall});
  }

  handleUninstallCancel() {
    this.setState({packageToUninstall: null});
  }

  handleUninstallPackage() {
    let {packageToUninstall} = this.state;
    let {name, version} = packageToUninstall.get('packageDefinition');
    CosmosPackagesStore.uninstallPackage(
      name,
      version,
      packageToUninstall.get('appId')
    );

    this.setState({pendingUninstallRequest: true});
  }

  handleUpgradeClick(packageToUpgrade) {
    this.setState({packageToUpgrade});
  }

  handleUpgradeCancel() {
    this.setState({packageToUpgrade: null});
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'highlight': prop === sortBy.prop,
      'clickable': prop === 'appId' && row == null // this is a header
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = ResourceTableUtil.renderHeading(PackagesTableHeaderLabels);
    let sortFunction = TableUtil
      .getSortFunction('appId', function (cosmosPackage, prop) {
        if (prop === 'appId') {
          return cosmosPackage.get('appId');
        }

        return cosmosPackage.get('packageDefinition')[prop];
      });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'appId',
        render: this.getHeadline,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'version',
        render: function (prop, cosmosPackage) {
          return cosmosPackage.get('packageDefinition')[prop];
        },
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading: function () {},
        prop: 'uninstall',
        render: this.getUpgradeCell,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '330px'}} />
      </colgroup>
    );
  }

  getHeadline(prop, cosmosPackage) {
    let packageImages = cosmosPackage.getIcons();
    let name = cosmosPackage.get('appId');
    // Remove initial slash if present
    if (name.charAt(0) === '/') {
      name = name.slice(1);
    }
    return (
      <div className="package-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box">
        <span className="icon icon-small icon-image-container icon-app-container">
          <img src={packageImages['icon-small']} />
        </span>
        <span className="headline text-overflow">
          {name}
        </span>
      </div>
    );
  }

  getUpgradeCell(prop, cosmosPackage) {
    return (
      <div className="button-collection flush flex-align-right">
        {this.getUninstallButton(cosmosPackage)}
        <PackageUpgradeOverview cosmosPackage={cosmosPackage}
          onUpgradeClick={this.handleUpgradeClick} />
      </div>
    );
  }

  getErrorMessage() {
    let {packageUninstallError} = this.state;
    if (!packageUninstallError) {
      return null;
    }

    let error = CosmosMessages[packageUninstallError.type] ||
      CosmosMessages.default;
    return (
      <p className="text-error-state">
       {error.getMessage(packageUninstallError.name)}
      </p>
    );
  }

  getUninstallButton(cosmosPackage) {
    if (cosmosPackage.isUpgrading()) {
      return null;
    }

    return (
      <a className="button button-link button-danger flush-bottom
        table-display-on-row-hover"
        onClick={this.handleOpenConfirm.bind(this, cosmosPackage)}>
        Uninstall
      </a>
    );
  }

  getUninstallModalContent() {
    let {packageToUninstall} = this.state;
    let packageLabel = 'This package';
    if (packageToUninstall) {
      packageLabel = packageToUninstall.get('packageDefinition').name;
    }

    return (
      <div className="container-pod container-pod-short text-align-center">
        <h3 className="flush-top">Are you sure?</h3>
        <p>
          {`${packageLabel} will be uninstalled from ${Config.productName}. All tasks belonging to this package will be killed.`}
        </p>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    let {state} = this;
    let packageName;
    let packageToUpgrade = state.packageToUpgrade;
    let packageVersion;

    let isUpgradeModalOpen = !!packageToUpgrade;
    let isUninstallModalOpen = !!state.packageToUninstall;

    if (isUpgradeModalOpen) {
      packageName = packageToUpgrade.getName();
      packageVersion = packageToUpgrade.getCurrentVersion();
    }

    return (
      <div>
        <Table
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.packages.getItems().slice()}
          sortBy={{prop: 'name', order: 'desc'}} />
        <UpgradePackageModal
          cosmosPackage={packageToUpgrade}
          onClose={this.handleUpgradeCancel}
          open={isUpgradeModalOpen}
          packageName={packageName}
          packageVersion={packageVersion} />
        <Confirm
          closeByBackdropClick={true}
          disabled={state.pendingUninstallRequest}
          footerContainerClass="container container-pod container-pod-short
            container-pod-fluid flush-top flush-bottom"
          open={isUninstallModalOpen}
          onClose={this.handleUninstallCancel}
          leftButtonCallback={this.handleUninstallCancel}
          rightButtonCallback={this.handleUninstallPackage}
          rightButtonClassName="button button-danger"
          rightButtonText="Uninstall">
          {this.getUninstallModalContent()}
        </Confirm>
      </div>
    );
  }
}

PackagesTable.defaultProps = {
  packages: new UniversePackagesList()
};

PackagesTable.propTypes = {
  packages: React.PropTypes.object.isRequired
};

module.exports = PackagesTable;
