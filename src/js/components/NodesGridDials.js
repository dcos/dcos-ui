var _ = require('underscore');
var React = require('react');
import {Tooltip} from 'reactjs-components';

var Chart = require('./charts/Chart');
var DialChart = require('./charts/DialChart');
var ResourceTypes = require('../constants/ResourceTypes');

var colors = {
  error: 2,
  unused: 'unused'
};

var NodesGridDials = React.createClass({

  displayName: 'NodesGridDials',

  propTypes: {
    hosts: React.PropTypes.array.isRequired,
    // enum: ['cpus', 'mem', 'disk']
    selectedResource: React.PropTypes.string.isRequired,
    serviceColors: React.PropTypes.object.isRequired,
    showServices: React.PropTypes.bool.isRequired,
    resourcesByFramework: React.PropTypes.object.isRequired
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  handleDialClick: function (nodeID) {
    // Using handler, since Link in arrays cannot get router context
    this.context.router.transitionTo('nodes-grid-panel', {nodeID});
  },

  getServiceSlicesConfig: function (node) {
    var config = [];
    var props = this.props;
    var resourcesByFramework = props.resourcesByFramework[node.get('id')];

    if (!resourcesByFramework) {
      return config;
    }

    _.each(resourcesByFramework, function (fwkResources, fwkId) {
      var percentage = fwkResources[props.selectedResource] * 100;
      percentage /= node.getUsageStats(props.selectedResource).total;

      config.push({
        colorIndex: props.serviceColors[fwkId],
        name: fwkId,
        percentage: percentage
      });
    });

    return config;
  },

  getUsedSliceConfig: function (node) {
    var props = this.props;
    var resourceConfig = ResourceTypes[props.selectedResource];
    var serviceSlices = this.getServiceSlicesConfig(node);
    var percentage;

    if (serviceSlices.length > 0) {
      percentage = _.foldl(serviceSlices, function (memo, slice) {
        return memo + slice.percentage;
      }, 0);
    } else {
      percentage = node.getUsageStats(props.selectedResource).percentage;
    }

    return [{
      colorIndex: resourceConfig.colorIndex,
      name: resourceConfig.label,
      percentage: percentage
    }];
  },

  getActiveSliceData: function (node) {
    var config;
    var props = this.props;

    if (props.showServices) {
      config = this.getServiceSlicesConfig(node);
    } else {
      config = this.getUsedSliceConfig(node);
    }

    var percentage = _.reduce(config, function (memo, slice) {
      memo += slice.percentage;
      return memo;
    }, 0);
    percentage = Math.round(percentage);

    config.push({
      colorIndex: colors.unused,
      name: 'Unused',
      percentage: 100 - percentage
    });

    return {
      data: config,
      usedPercentage: percentage
    };
  },

  getInactiveSliceData: function () {
    return [
      {
        colorIndex: colors.error,
        name: 'Error',
        percentage: 100
      }
    ];
  },

  getDialConfig: function (node) {
    var resourceConfig = ResourceTypes[this.props.selectedResource];

    if (node.isActive()) {
      var sliceData = this.getActiveSliceData(node);
      return {
        data: sliceData.data,
        description: [
          <span className="unit" key={'unit'}>
            {sliceData.usedPercentage}%
          </span>,
          <span className="unit-label text-muted" key={'unit-label'}>
            {resourceConfig.label}
          </span>
        ]
      };
    } else {
      return {
        data: this.getInactiveSliceData(),
        description: (
          <span className="error">
            <i className="icon icon-sprite icon-sprite-medium icon-sprite-medium-white icon-alert" />
          </span>
        )
      };
    }
  },

  getDials: function () {
    return _.map(this.props.hosts, function (node) {
      var config = this.getDialConfig(node);
      let description = (
        <div className="description">
          {config.description}
        </div>
      );

      if (!node.isActive()) {
        description = (
          <Tooltip content="Connection to node lost"
            wrapperClassName="tooltip-wrapper text-align-center description">
            {config.description}
          </Tooltip>
        );
      }

      return (
        <a className="nodes-grid-dials-item clickable"
          onClick={this.handleDialClick.bind(this, node.get('id'))}
          key={node.get('id')}>
          <div className="chart">
            <Chart calcHeight={function (w) { return w; }}>
              <DialChart data={config.data}
                value="percentage">
                {description}
              </DialChart>
            </Chart>
          </div>
        </a>
      );
    }, this);
  },

  // Zero-height spacer items force dial charts in the last line of the flex layout
  // not to spread themselves across the line.
  getSpacers: function () {
    return _.times(30, function (n) {
      return <div className="nodes-grid-dials-spacer" key={n}></div>;
    });
  },

  render: function () {
    return (
      <div className="nodes-grid-dials">
        {this.getDials()}
        {this.getSpacers()}
      </div>
    );
  }

});

module.exports = NodesGridDials;
