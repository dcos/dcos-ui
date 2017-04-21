import React from "react";

import BarChart from "../../components/charts/BarChart";
import Chart from "../../components/charts/Chart";
import Config from "../../config/Config";
import ResourcesUtil from "../../utils/ResourcesUtil";
import Units from "../../utils/Units";
import Util from "../../utils/Util";

// number to fit design of width vs. height ratio
const WIDTH_HEIGHT_RATIO = 4.5;

class ResourceChart extends React.Component {
  getResourceChart(resource, totalResources) {
    const colorIndex = ResourcesUtil.getResourceColor(resource);
    const resourceLabel = ResourcesUtil.getResourceLabel(resource);
    const resourceData = [
      {
        name: "Alloc",
        colorIndex,
        values: totalResources[resource]
      }
    ];
    const resourceValue = Units.formatResource(
      resource,
      Util.last(totalResources[resource]).value
    );

    const axisConfiguration = {
      x: { hideMatch: /^0$/ },
      y: { showPercentage: false, suffix: "%" }
    };

    let maxY = 5;
    totalResources[resource].forEach(function(resourceTotal) {
      if (resourceTotal.percentage > maxY) {
        maxY = resourceTotal.percentage;
      }
    });

    maxY *= 1.5; // Multiply by 150%
    maxY /= 10; // Divide so that we can round to nearest tenth
    maxY = Math.round(maxY); // Round
    maxY *= 10; // Multiply so that we get a percentage number between 0-100
    maxY = Math.min(100, maxY); // Don't let it be greater than 100%

    return (
      <div key={resource} className="column-12">
        <h4 className="flush-top flush-bottom">
          {resourceValue}
        </h4>
        <div
          className={`side-panel-resource-label
            text-color-${colorIndex}`}
        >
          {resourceLabel.toUpperCase()}
        </div>

        <Chart
          calcHeight={function(w) {
            return w / WIDTH_HEIGHT_RATIO;
          }}
          delayRender={true}
        >
          <BarChart
            axisConfiguration={axisConfiguration}
            data={resourceData}
            margin={{ top: 0, left: 43, right: 10, bottom: 40 }}
            maxY={maxY}
            refreshRate={Config.getRefreshRate()}
            ticksY={3}
            xGridLines={0}
            y="percentage"
          />
        </Chart>
      </div>
    );
  }

  render() {
    const props = this.props;

    return (
      <div className={props.className}>
        <div className="row chart">
          {this.getResourceChart(props.resourceName, props.resources)}
        </div>
      </div>
    );
  }
}

ResourceChart.defaultProps = {
  className: "column-12 column-small-4"
};

ResourceChart.propTypes = {
  className: React.PropTypes.string,
  resourceName: React.PropTypes.string,
  resources: React.PropTypes.object
};

module.exports = ResourceChart;
