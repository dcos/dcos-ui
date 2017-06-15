import classNames from "classnames";
import { Link } from "react-router";
import PureRender from "react-addons-pure-render-mixin";
import React from "react";
import { ResourceTableUtil } from "foundation-ui";
import { Table, Tooltip } from "reactjs-components";

import Icon from "../../../../../src/js/components/Icon";
import Loader from "../../../../../src/js/components/Loader";
import NodesTableHeaderLabels
  from "../../../../../src/js/constants/NodesTableHeaderLabels";
import StatusBar from "../../../../../src/js/components/StatusBar";
import StringUtil from "../../../../../src/js/utils/StringUtil";
import TableUtil from "../../../../../src/js/utils/TableUtil";
import UnitHealthUtil from "../../../../../src/js/utils/UnitHealthUtil";

const COLOR_CLASSNAMES = {
  cpus: "color-1",
  mem: "color-2",
  disk: "color-3"
};

var NodesTable = React.createClass({
  displayName: "NodesTable",

  mixins: [PureRender],

  propTypes: {
    hosts: React.PropTypes.array.isRequired
  },

  getDefaultProps() {
    return {
      hosts: []
    };
  },

  renderHeadline(prop, node) {
    let headline = node.get(prop);

    if (!node.isActive()) {
      headline = (
        <Tooltip anchor="start" content="Connection to node lost">
          <Icon
            className="icon-alert icon-margin-right"
            color="neutral"
            id="yield"
            size="mini"
          />
          {headline}
        </Tooltip>
      );
    }

    const nodeID = node.get("id");

    return (
      <Link className="table-cell-link-primary" to={`/nodes/${nodeID}`}>
        {headline}
      </Link>
    );
  },

  renderHealth(prop, node) {
    const requestReceived = this.props.receivedNodeHealthResponse;

    if (!requestReceived) {
      return <Loader size="small" type="ballBeat" />;
    }

    const health = node.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  },

  renderStats(prop, node) {
    var value = node.getUsageStats(prop).percentage;

    return (
      <span className="status-bar-with-label-wrapper">
        <StatusBar
          data={[{ value, className: COLOR_CLASSNAMES[prop] }]}
          scale={100}
        />
        <span className="label">{value}%</span>
      </span>
    );
  },

  getColumns() {
    const className = ResourceTableUtil.getClassName;
    const heading = ResourceTableUtil.renderHeading(NodesTableHeaderLabels);
    const sortFunction = TableUtil.getSortFunction("hostname", function(
      node,
      prop
    ) {
      if (prop === "cpus" || prop === "mem" || prop === "disk") {
        return node.getUsageStats(prop).percentage;
      }

      if (prop === "health") {
        return UnitHealthUtil.getHealthSorting(node);
      }

      return node.get(prop);
    });

    return [
      {
        className,
        headerClassName: className,
        prop: "hostname",
        render: this.renderHeadline,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "health",
        render: this.renderHealth,
        sortable: true,
        sortFunction,
        heading: ResourceTableUtil.renderHeading({ health: "HEALTH" })
      },
      {
        className,
        headerClassName: className,
        prop: "TASK_RUNNING",
        render: ResourceTableUtil.renderTask,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "cpus",
        render: this.renderStats,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "mem",
        render: this.renderStats,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "disk",
        render: this.renderStats,
        sortable: true,
        sortFunction,
        heading
      }
    ];
  },

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{ width: "100px" }} />
        <col style={{ width: "110px" }} />
        <col className="hidden-small-down" style={{ width: "135px" }} />
        <col className="hidden-small-down" style={{ width: "135px" }} />
        <col className="hidden-small-down" style={{ width: "135px" }} />
      </colgroup>
    );
  },

  getRowAttributes(node) {
    return {
      className: classNames({
        danger: node.isActive() === false
      })
    };
  },

  render() {
    return (
      <Table
        buildRowOptions={this.getRowAttributes}
        className="node-table table table-borderless-outer table-borderless-inner-columns flush-bottom"
        colGroup={this.getColGroup()}
        columns={this.getColumns()}
        containerSelector=".gm-scroll-view"
        data={this.props.hosts.slice()}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "health", order: "asc" }}
      />
    );
  }
});

module.exports = NodesTable;
