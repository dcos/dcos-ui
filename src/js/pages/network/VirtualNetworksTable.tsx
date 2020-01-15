import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import classNames from "classnames";
import { routerShape, Link } from "react-router";
import * as React from "react";
import { Table } from "reactjs-components";
import { Overlay } from "src/js/structs/Overlay";

const headerMapping = {
  name: i18nMark("Name"),
  subnet: i18nMark("IP Subnet"),
  prefix: i18nMark("Agent Prefix Length")
};

export default class VirtualNetworksTable extends React.Component<{
  overlays: Overlay[];
}> {
  static contextTypes = { router: routerShape };

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
        getValue: overlay => overlay.name,
        headerClassName: getClassName,
        heading,
        prop: "name",
        render: this.renderName,
        sortable: false
      },
      {
        className: getClassName,
        getValue(overlay) {
          if (overlay.subnet && overlay.subnet6) {
            return (
              <span>
                IPv4: {overlay.subnet}
                <br />
                IPv6: {overlay.subnet6}
              </span>
            );
          }

          return overlay.subnet || overlay.subnet6;
        },
        headerClassName: getClassName,
        heading,
        prop: "subnet",
        sortable: false
      },
      {
        className: getClassName,
        getValue: overlay =>
          overlay.prefix && overlay.prefix6 ? (
            <span>
              IPv4: {overlay.prefix}
              <br />
              IPv6: {overlay.prefix6}
            </span>
          ) : (
            overlay.prefix || overlay.prefix6
          ),
        headerClassName: getClassName,
        heading,
        prop: "prefix",
        sortable: false
      }
    ];
  }

  renderHeading(prop) {
    return <Trans id={headerMapping[prop]} className="table-header-title" />;
  }

  renderName(_prop: unknown, overlay: Overlay) {
    return (
      <Link
        className="table-cell-link-primary"
        title={overlay.name}
        to={`/networking/networks/${overlay.name}/tasks`}
      >
        {overlay.name}
      </Link>
    );
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={
          <colgroup>
            <col style={{ width: "30%" }} />
            <col />
            <col />
          </colgroup>
        }
        data={this.props.overlays}
      />
    );
  }
}
