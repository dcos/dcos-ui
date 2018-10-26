import { i18nMark } from "@lingui/react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Table } from "reactjs-components";

import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import StringUtil from "../utils/StringUtil";
import TableUtil from "../utils/TableUtil";
import UnitHealthUtil from "../utils/UnitHealthUtil";

const METHODS_TO_BIND = ["renderHealth", "renderNode", "renderNodeRole"];

class UnitHealthNodesTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    }, this);
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "25%" }} />
        <col />
        <col style={{ width: "25%" }} />
      </colgroup>
    );
  }

  getColumns() {
    const classNameFn = ResourceTableUtil.getClassName;
    const headings = ResourceTableUtil.renderHeading({
      health: i18nMark("Health"),
      host_ip: i18nMark("Node"),
      role: i18nMark("Role")
    });

    const sortFunction = TableUtil.getSortFunction("host_ip", function(
      node,
      prop
    ) {
      if (prop === "health") {
        return UnitHealthUtil.getHealthSorting(node);
      }

      return node.get(prop);
    });

    return [
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: "health",
        render: this.renderHealth,
        sortable: true,
        sortFunction
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: "host_ip",
        render: this.renderNode,
        sortable: true,
        sortFunction
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: "role",
        render: this.renderNodeRole,
        sortable: true,
        sortFunction
      }
    ];
  }

  getNodeLink(node, linkText) {
    const { unitID } = this.props.params;
    const unitNodeID = node.get("host_ip");

    return (
      <Link
        className="table-cell-link-primary text-overflow"
        to={`/components/${unitID}/nodes/${unitNodeID}`}
      >
        {linkText}
      </Link>
    );
  }

  renderHealth(prop, node) {
    const health = node.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  }

  renderNode(prop, node) {
    return this.getNodeLink(node, node.get(prop));
  }

  renderNodeRole(prop, node) {
    return StringUtil.capitalize(node.get(prop));
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer
          table-borderless-inner-columns table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={this.props.nodes}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "health", order: "asc" }}
      />
    );
  }
}

UnitHealthNodesTable.propTypes = {
  nodes: PropTypes.array.isRequired,
  params: PropTypes.object
};

module.exports = UnitHealthNodesTable;
