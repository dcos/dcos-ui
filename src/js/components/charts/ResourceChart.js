import React from 'react';

import BarChart from '../../components/charts/BarChart';
import Chart from '../../components/charts/Chart';
import Config from '../../config/Config';
import Icon from '../Icon';
import ResourceColors from '../../constants/ResourceColors';
import ResourceIcons from '../../constants/ResourceIcons';
import ResourcesUtil from '../../utils/ResourcesUtil';
import Units from '../../utils/Units';
import Util from '../../utils/Util';

// number to fit design of width vs. height ratio
const WIDTH_HEIGHT_RATIO = 4.5;

class ResourceChart extends React.Component {

  getResourceChart(resource, totalResources) {
    let colorIndex = ResourcesUtil.getResourceColor(resource);
    let resourceLabel = ResourcesUtil.getResourceLabel(resource);
    let resourceData = [{
      name: 'Alloc',
      colorIndex,
      values: totalResources[resource]
    }];
    let resourceValue = Units.formatResource(
      resource, Util.last(totalResources[resource]).value
    );

    let resourceKey = resourceLabel.toLowerCase();
    let iconID = ResourceIcons[resourceKey];
    let iconColor = ResourceColors[resourceKey];

    let axisConfiguration = {
      x: {hideMatch: /^0$/},
      y: {showPercentage: false, suffix: '%'}
    };

    let maxY = 5;
    totalResources[resource].forEach(function (resourceTotal) {
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
      <div key={resource} className="column-12
        flex-box-align-vertical-center
        container-pod
        container-pod-super-short
        flush-top">
        <div className="media-object-spacing-wrapper media-object-offset">
          <div className="media-object media-object-align-middle">
            <div className="media-object-item">
              <Icon color={iconColor} id={iconID} />
            </div>
            <div className="media-object-item">
              <h4 className="flush-top flush-bottom inverse">
                {resourceValue}
              </h4>
              <span className={`side-panel-resource-label
                  text-color-${colorIndex}`}>
                {resourceLabel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <Chart calcHeight={function (w) { return w / WIDTH_HEIGHT_RATIO; }}
          delayRender={true}>
          <BarChart
            axisConfiguration={axisConfiguration}
            data={resourceData}
            inverseStyle={true}
            margin={{top: 0, left: 43, right: 10, bottom: 40}}
            maxY={maxY}
            refreshRate={Config.getRefreshRate()}
            ticksY={3}
            xGridLines={0}
            y="percentage" />
        </Chart>
      </div>
    );
  }

  render() {
    let props = this.props;

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
  className: 'column-12 column-mini-4'
};

ResourceChart.propTypes = {
  className: React.PropTypes.string,
  resourceName: React.PropTypes.string,
  resources: React.PropTypes.object
};

module.exports = ResourceChart;
