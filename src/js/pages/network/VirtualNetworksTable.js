import classNames from "classnames";
import { routerShape, Link } from "react-router";
import React from "react";
import { Table } from "reactjs-components";

import OverlayList from "../../structs/OverlayList";

const headerMapping = {
  name: "Name",
  subnet: "IP Subnet",
  prefix: "Agent Prefix Length"
};

class VirtualNetworksTable extends React.Component {
  getClassName(prop, sortBy) {
    return classNames({
      active: prop === sortBy.prop
    });
  }

  getColumns() {
    const getClassName = this.getClassName;
    const heading = this.renderHeading;

    return [
      {
        className: getClassName,
        getValue(overlay) {
          return overlay.getName();
        },
        headerClassName: getClassName,
        heading,
        prop: "name",
        render: this.renderName,
        sortable: false
      },
      {
        className: getClassName,
        getValue(overlay) {
          return overlay.getSubnet();
        },
        headerClassName: getClassName,
        heading,
        prop: "subnet",
        sortable: false
      },
      {
        className: getClassName,
        getValue(overlay) {
          return overlay.getPrefix();
        },
        headerClassName: getClassName,
        heading,
        prop: "prefix",
        sortable: false
      }
    ];
  }

  renderHeading(prop) {
    return <span className="table-header-title">{headerMapping[prop]}</span>;
  }

  renderName(prop, overlay) {
    const overlayName = overlay.getName();

    return (
      <Link
        className="table-cell-link-primary"
        title={overlayName}
        to={`/networking/networks/${overlayName}`}
      >
        {overlayName}
      </Link>
    );
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "30%" }} />
        <col />
        <col />
      </colgroup>
    );
  }

  render() {
    return (
      <Table
        className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.overlays.getItems()}
      />
    );
  }
}

VirtualNetworksTable.contextTypes = {
  router: routerShape
};

VirtualNetworksTable.propTypes = {
  overlays: React.PropTypes.instanceOf(OverlayList)
};

module.exports = VirtualNetworksTable;
