import classNames from "classnames";
import React from "react";
import { ResourceTableUtil } from "foundation-ui";
import { Table } from "reactjs-components";

import CosmosPackagesStore from "../stores/CosmosPackagesStore";
import defaultServiceImage
  from "../../../plugins/services/src/img/icon-service-default-small@2x.png";
import Image from "./Image";
import PackagesTableHeaderLabels from "../constants/PackagesTableHeaderLabels";
import TableUtil from "../utils/TableUtil";
import UninstallPackageModal from "./modals/UninstallPackageModal";
import UniversePackagesList from "../structs/UniversePackagesList";

const METHODS_TO_BIND = [
  "getHeadline",
  "getUninstallButton",
  "handleUninstallClick",
  "handleUninstallClose",
  "handleUninstallFinish"
];

class PackagesTable extends React.Component {
  constructor() {
    super();

    this.state = {
      packageToUninstall: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleUninstallClick(packageToUninstall) {
    this.setState({ packageToUninstall });
  }

  handleUninstallClose() {
    this.setState({ packageToUninstall: null });
  }

  handleUninstallFinish() {
    CosmosPackagesStore.fetchInstalledPackages();
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      active: prop === sortBy.prop,
      clickable: prop === "appId" && row == null, // this is a header
      "text-align-right": prop === "uninstall"
    });
  }

  getColumns() {
    const getClassName = this.getClassName;
    const heading = ResourceTableUtil.renderHeading(PackagesTableHeaderLabels);
    const sortFunction = TableUtil.getSortFunction("appId", function(
      cosmosPackage
    ) {
      return cosmosPackage.getAppId();
    });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "appId",
        render: this.getHeadline,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "version",
        render(prop, cosmosPackage) {
          return cosmosPackage.getCurrentVersion();
        },
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading() {},
        prop: "uninstall",
        render: this.getUninstallButton,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{ width: "120px" }} />
        <col style={{ width: "120px" }} />
      </colgroup>
    );
  }

  getHeadline(prop, cosmosPackage) {
    const packageImages = cosmosPackage.getIcons();
    const name = cosmosPackage.getAppIdName();

    return (
      <div className="package-table-heading table-cell-emphasized flex-box flex-box-align-vertical-center table-cell-flex-box">
        <span className="icon icon-margin-right icon-mini icon-image-container icon-app-container">
          <Image
            fallbackSrc={defaultServiceImage}
            src={packageImages["icon-small"]}
          />
        </span>
        <span className="headline text-overflow">
          {name}
        </span>
      </div>
    );
  }

  getUninstallButton(prop, cosmosPackage) {
    return (
      <a
        className="button button-link button-danger flush-bottom
        table-display-on-row-hover"
        onClick={this.handleUninstallClick.bind(this, cosmosPackage)}
      >
        Uninstall
      </a>
    );
  }

  render() {
    const { packageToUninstall } = this.state;
    const isUninstallModalOpen = !!packageToUninstall;

    return (
      <div>
        <Table
          className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.packages.getItems().slice()}
          sortBy={{ prop: "appId", order: "desc" }}
        />
        <UninstallPackageModal
          cosmosPackage={packageToUninstall}
          handleUninstallFinish={this.handleUninstallFinish}
          onClose={this.handleUninstallClose}
          open={isUninstallModalOpen}
        />
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
