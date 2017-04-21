import { Table } from "reactjs-components";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import defaultServiceImage
  from "../../../plugins/services/src/img/icon-service-default-medium@2x.png";
import Image from "./Image";

const METHODS_TO_BIND = ["getDeployButton", "getHeadline"];

class DisplayPackagesTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getColumns() {
    const heading = this.getHeader;

    return [
      {
        heading,
        prop: "name",
        render: this.getHeadline,
        sortable: false
      },
      {
        heading,
        prop: "deploy",
        render: this.getDeployButton,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{ width: "120px" }} />
      </colgroup>
    );
  }

  getHeadline(prop, cosmosPackage) {
    const packageImages = cosmosPackage.getIcons();
    let name = cosmosPackage.getName();

    // Remove initial slash if present
    if (name.charAt(0) === "/") {
      name = name.slice(1);
    }

    return (
      <div
        className="media-object-spacing-wrapper media-object-spacing-super-narrow clickable"
        onClick={this.props.onDetailOpen.bind(this, cosmosPackage)}
      >
        <div className="media-object media-object-align-middle">
          <div className="media-object-item">
            <div className="icon icon-margin-right icon-large icon-image-container icon-app-container icon-default-white">
              <Image
                fallbackSrc={defaultServiceImage}
                src={packageImages["icon-large"]}
              />
            </div>
          </div>
          <div className="media-object-item">
            <h2 className="flush">
              {name}
            </h2>
            <p className="flush-bottom">
              {cosmosPackage.getCurrentVersion()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  getHeader() {
    return null;
  }

  getDeployButton(prop, packageToDeploy) {
    return (
      <div className="flex-align-right">
        <button
          className="button button-success"
          onClick={this.props.onDeploy.bind(this, packageToDeploy)}
        >
          Install
        </button>
      </div>
    );
  }

  render() {
    return (
      <Table
        className="table table-hover table-hide-header table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.packages.getItems().slice()}
      />
    );
  }
}

DisplayPackagesTable.defaultProps = {
  onDeploy() {},
  onDetailOpen() {}
};

DisplayPackagesTable.propTypes = {
  onDeploy: React.PropTypes.func,
  onDetailOpen: React.PropTypes.func,
  packages: React.PropTypes.object.isRequired
};

module.exports = DisplayPackagesTable;
