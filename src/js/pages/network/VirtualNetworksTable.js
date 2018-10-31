import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import classNames from "classnames";
import { routerShape, Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Table } from "reactjs-components";

import OverlayList from "../../structs/OverlayList";

const headerMapping = {
  name: i18nMark("Name"),
  subnet: i18nMark("IP Subnet"),
  prefix: i18nMark("Agent Prefix Length")
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
          if (overlay.getSubnet() && overlay.getSubnet6()) {
            return (
              <span>
                IPv4: {overlay.getSubnet()}
                <br />IPv6: {overlay.getSubnet6()}
              </span>
            );
          }

          return overlay.getSubnet() || overlay.getSubnet6();
        },
        headerClassName: getClassName,
        heading,
        prop: "subnet",
        sortable: false
      },
      {
        className: getClassName,
        getValue(overlay) {
          if (overlay.getPrefix() && overlay.getPrefix6()) {
            return (
              <span>
                IPv4: {overlay.getPrefix()}
                <br />IPv6: {overlay.getPrefix6()}
              </span>
            );
          }

          return overlay.getPrefix() || overlay.getPrefix6();
        },
        headerClassName: getClassName,
        heading,
        prop: "prefix",
        sortable: false
      }
    ];
  }

  renderHeading(prop) {
    return (
      <Trans
        id={headerMapping[prop]}
        render="span"
        className="table-header-title"
      />
    );
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
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
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
  overlays: PropTypes.instanceOf(OverlayList)
};

module.exports = VirtualNetworksTable;
