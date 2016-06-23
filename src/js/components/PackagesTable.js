import classNames from 'classnames';
import React from 'react';
import {Table} from 'reactjs-components';

import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import PackagesTableHeaderLabels from '../constants/PackagesTableHeaderLabels';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TableUtil from '../utils/TableUtil';
import UniversePackagesList from '../structs/UniversePackagesList';
import UninstallPackageModal from './modals/UninstallPackageModal';

const METHODS_TO_BIND = [
  'getHeadline',
  'getUninstallButton',
  'handleUninstallClick',
  'handleUninstallClose',
  'handleUninstallFinish'
];

class PackagesTable extends React.Component {
  constructor() {
    super();

    this.state = {
      packageToUninstall: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleUninstallClick(packageToUninstall) {
    this.setState({packageToUninstall});
  }

  handleUninstallClose() {
    this.setState({packageToUninstall: null});
  }

  handleUninstallFinish() {
    CosmosPackagesStore.fetchInstalledPackages();
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'highlight': prop === sortBy.prop,
      'clickable': prop === 'appId' && row == null, // this is a header
      'text-align-right': prop === 'uninstall'
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = ResourceTableUtil.renderHeading(PackagesTableHeaderLabels);
    let sortFunction = TableUtil
      .getSortFunction('appId', function (cosmosPackage) {
        return cosmosPackage.getAppId();
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
          return cosmosPackage.getCurrentVersion();
        },
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading: function () {},
        prop: 'uninstall',
        render: this.getUninstallButton,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '120px'}} />
      </colgroup>
    );
  }

  getHeadline(prop, cosmosPackage) {
    let packageImages = cosmosPackage.getIcons();
    let name = cosmosPackage.getAppIdName();

    return (
      <div className="package-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box">
        <span className="icon icon-margin-right icon-small icon-image-container icon-app-container">
          <img src={packageImages['icon-small']} />
        </span>
        <span className="headline text-overflow">
          {name}
        </span>
      </div>
    );
  }

  getUninstallButton(prop, cosmosPackage) {
    return (
      <a className="button button-link button-danger flush-bottom
        table-display-on-row-hover"
        onClick={this.handleUninstallClick.bind(this, cosmosPackage)}>
        Uninstall
      </a>
    );
  }

  render() {
    let {packageToUninstall} = this.state;
    let isUninstallModalOpen = !!packageToUninstall;

    return (
      <div>
        <Table
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.packages.getItems().slice()}
          sortBy={{prop: 'appId', order: 'desc'}} />
        <UninstallPackageModal
          cosmosPackage={packageToUninstall}
          handleUninstallFinish={this.handleUninstallFinish}
          onClose={this.handleUninstallClose}
          open={isUninstallModalOpen} />
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
