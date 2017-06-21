import classNames from "classnames";
import React from "react";

import BarChart from "./BarChart";
import Chart from "./Chart";
import ResourcesUtil from "../../utils/ResourcesUtil";

// number to fit design of width vs. height ratio
const WIDTH_HEIGHT_RATIO = 4.5;

const ResourceBarChart = React.createClass({
  displayName: "ResourceBarChart",

  propTypes: {
    onResourceSelectionChange: React.PropTypes.func.isRequired,
    itemCount: React.PropTypes.number.isRequired,
    resources: React.PropTypes.object.isRequired,
    refreshRate: React.PropTypes.number.isRequired,
    resourceType: React.PropTypes.string,
    selectedResource: React.PropTypes.string.isRequired,
    totalResources: React.PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      itemCount: 0,
      totalResources: {},
      y: "percentage",
      refreshRate: 0,
      resourceType: ""
    };
  },

  getData() {
    const props = this.props;

    if (props.itemCount === 0) {
      return [];
    }

    const selectedResource = props.selectedResource;

    return [
      {
        id: "used_resources",
        name: selectedResource + " allocated",
        colorIndex: ResourcesUtil.getResourceColor(selectedResource),
        values: props.resources[selectedResource]
      }
    ];
  },

  getMaxY() {
    if (this.props.totalResources[this.props.selectedResource]) {
      return 100;
    } else {
      return 0;
    }
  },

  handleSelectedResourceChange(selectedResource) {
    this.props.onResourceSelectionChange(selectedResource);
  },

  getModeButtons() {
    const selectedResource = this.props.selectedResource;

    const resourceColors = ResourcesUtil.getResourceColors();
    const resourceLabels = ResourcesUtil.getResourceLabels();

    return ResourcesUtil.getDefaultResources().map(resource => {
      const classSet = classNames("button button-stroke", {
        active: selectedResource === resource
      });

      return (
        <button
          key={resource}
          className={`${classSet} path-color-${resourceColors[resource]}`}
          onClick={this.handleSelectedResourceChange.bind(this, resource)}
        >
          {resourceLabels[resource]}
        </button>
      );
    });
  },

  getBarChart() {
    return (
      <Chart
        calcHeight={function(w) {
          return w / WIDTH_HEIGHT_RATIO;
        }}
      >
        <BarChart
          data={this.getData()}
          maxY={this.getMaxY()}
          ticksY={4}
          y={this.props.y}
          refreshRate={this.props.refreshRate}
        />
      </Chart>
    );
  },

  getHeadline(resource) {
    const label = ResourcesUtil.getResourceLabel(resource);
    const headline = `${label} Allocation Rate`;

    return (
      <div>
        <h4 className="flush">
          {headline}
        </h4>
        <p className="flush">
          {this.props.itemCount + " Total " + this.props.resourceType}
        </p>
      </div>
    );
  },

  render() {
    return (
      <div className="pod flush-top flush-right flush-left">
        <div className="chart panel">
          <div className="panel-cell panel-header panel-cell-borderless flush-bottom text-align-center">
            <div className="panel-options button-group">
              {this.getModeButtons()}
            </div>
            <div>
              {this.getHeadline(this.props.selectedResource)}
            </div>
          </div>
          <div className="panel-cell panel-content" ref="panelContent">
            {this.getBarChart()}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ResourceBarChart;
