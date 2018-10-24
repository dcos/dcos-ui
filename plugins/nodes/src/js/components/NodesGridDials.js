import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { Tooltip } from "reactjs-components";
import { Trans } from "@lingui/macro";

import Chart from "#SRC/js/components/charts/Chart";
import DialChart from "#SRC/js/components/charts/DialChart";
import Icon from "#SRC/js/components/Icon";
import ResourcesUtil from "#SRC/js/utils/ResourcesUtil";

var colors = {
  error: 2,
  unused: "unused"
};

var NodesGridDials = React.createClass({
  displayName: "NodesGridDials",

  propTypes: {
    hosts: PropTypes.array.isRequired,
    selectedResource: PropTypes.string.isRequired,
    serviceColors: PropTypes.object.isRequired,
    resourcesByFramework: PropTypes.object.isRequired
  },

  contextTypes: {
    router: routerShape
  },

  handleDialClick(nodeID) {
    // Using handler, since Link in arrays cannot get router context
    this.context.router.push(`/nodes/${nodeID}`);
  },

  getServiceSlicesConfig(node) {
    var config = [];
    var props = this.props;
    var resourcesByFramework = props.resourcesByFramework[node.get("id")];

    if (!resourcesByFramework) {
      return config;
    }

    Object.keys(resourcesByFramework).forEach(function(frameworkID) {
      const used =
        resourcesByFramework[frameworkID][props.selectedResource] || 0;
      const total = node.getUsageStats(props.selectedResource).total || 0;

      const percentage = total === 0 ? 0 : (used * 100) / total;

      config.push({
        colorIndex: props.serviceColors[frameworkID],
        name: frameworkID,
        percentage
      });
    });

    return config;
  },

  getActiveSliceData(node) {
    var config = this.getServiceSlicesConfig(node);

    var percentage = config.reduce(function(memo, slice) {
      memo += slice.percentage;

      return memo;
    }, 0);
    percentage = Math.round(percentage);

    config.push({
      colorIndex: colors.unused,
      name: "Unused",
      percentage: 100 - percentage
    });

    return {
      data: config,
      usedPercentage: percentage
    };
  },

  getInactiveSliceData() {
    return [
      {
        colorIndex: colors.error,
        name: "Error",
        percentage: 100
      }
    ];
  },

  getDialConfig(node) {
    const { selectedResource } = this.props;
    const resourceLabel = ResourcesUtil.getResourceLabel(selectedResource);

    if (node.isActive()) {
      var sliceData = this.getActiveSliceData(node);

      return {
        data: sliceData.data,
        description: [
          <span className="unit" key={"unit"}>
            {sliceData.usedPercentage}%
          </span>,
          <span className="unit-label text-muted" key={"unit-label"}>
            {resourceLabel}
          </span>
        ]
      };
    } else {
      return {
        data: this.getInactiveSliceData(),
        description: (
          <span className="error">
            <Icon id="yield" className="icon-alert" color="neutral" />
          </span>
        )
      };
    }
  },

  getDials() {
    return this.props.hosts.map(node => {
      var config = this.getDialConfig(node);
      let description = <div className="description">{config.description}</div>;

      if (!node.isActive()) {
        description = (
          <Tooltip
            content={<Trans render="span">Connection to node lost</Trans>}
            wrapperClassName="tooltip-wrapper text-align-center description"
          >
            {config.description}
          </Tooltip>
        );
      }

      return (
        <a
          className="nodes-grid-dials-item clickable"
          onClick={this.handleDialClick.bind(this, node.get("id"))}
          key={node.get("id")}
        >
          <div className="chart">
            <Chart
              calcHeight={function(w) {
                return w;
              }}
            >
              <DialChart data={config.data} value="percentage">
                {description}
              </DialChart>
            </Chart>
          </div>
        </a>
      );
    });
  },

  // Zero-height spacer items force dial charts in the last line of the flex layout
  // not to spread themselves across the line.
  getSpacers() {
    return Array(30)
      .fill()
      .map(function(v, index) {
        return <div className="nodes-grid-dials-spacer" key={index} />;
      });
  },

  render() {
    return (
      <div className="nodes-grid-dials">
        {this.getDials()}
        {this.getSpacers()}
      </div>
    );
  }
});

module.exports = NodesGridDials;
