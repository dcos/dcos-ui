import classNames from "classnames";
import { Link } from "react-router";
import PureRender from "react-addons-pure-render-mixin";
import React from "react";
import { Table, Tooltip } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import Loader from "#SRC/js/components/Loader";
import NodesTableHeaderLabels from "#SRC/js/constants/NodesTableHeaderLabels";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";
import TableUtil from "#SRC/js/utils/TableUtil";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";

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

  renderRegion(_prop, node) {
    return (
      <span>
        {node.getRegionName()}
      </span>
    );
  },

  renderZone(_prop, node) {
    return (
      <span>
        {node.getZoneName()}
      </span>
    );
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
        {health.title}
      </span>
    );
  },

  renderTask(prop, node) {
    return (
      <span>
        {node[prop]}
      </span>
    );
  },

  renderStats(prop, node) {
    var value = node.getUsageStats(prop).percentage;

    return (
      <span className="status-bar-with-label-wrapper">
        <ProgressBar
          className="hidden-medium-down"
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
    const getHealthSorting = TableUtil.getHealthSortingOrder;
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

      if (prop === "region") {
        return node.getRegionName();
      }
      if (prop === "zone") {
        return node.getZoneName();
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
        prop: "region",
        render: this.renderRegion,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "zone",
        render: this.renderZone,
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
        sortFunction: getHealthSorting,
        heading: ResourceTableUtil.renderHeading({ health: "Health" })
      },
      {
        className,
        headerClassName: className,
        prop: "TASK_RUNNING",
        render: this.renderTask,
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
        <col />
        <col />
        <col style={{ width: "150px" }} />
        <col style={{ width: "90px" }} />
        <col className="hidden-small-down" />
        <col className="hidden-small-down" />
        <col className="hidden-small-down" />
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
        className="node-table table table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
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
