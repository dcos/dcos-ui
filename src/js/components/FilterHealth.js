var classNames = require('classnames');
var React = require('react');

var HealthLabels = require('../constants/HealthLabels');
var HealthTypes = require('../constants/HealthTypes');

const SELECTED_HEALTH_STATES = ['ALL', 'HEALTHY', 'UNHEALTHY'];
let buttonMap = SELECTED_HEALTH_STATES.reduce(function (acc, health) {
  acc[health] = HealthLabels[health];
  return acc;
}, {});

const HEALTH_STATUS_WITH_DOT = [
  HealthTypes.UNHEALTHY,
  HealthTypes.HEALTHY
];

var FilterHealth = React.createClass({

  displayName: 'FilterHealth',

  propTypes: {
    countByHealth: React.PropTypes.object.isRequired,
    healthFilter: React.PropTypes.number,
    handleFilterChange: React.PropTypes.func,
    servicesLength: React.PropTypes.number.isRequired
  },

  getDefaultProps: function () {
    return {
      countByHealth: {},
      healthFilter: null,
      handleFilterChange: function () {},
      servicesLength: 0
    };
  },

  getCountByHealth: function (key) {
    var props = this.props;
    var count = 0;
    if (key === 'ALL') {
      count = props.servicesLength;
    }
    if (props.countByHealth[HealthTypes[key]] != null) {
      count = props.countByHealth[HealthTypes[key]];
    }

    return count;
  },

  getFilterButtons: function () {
    var mode = this.props.healthFilter;

    return Object.keys(buttonMap).map((key) => {
      var health = HealthTypes[key];
      if (health === undefined) {
        health = null;
      }
      var classSet = classNames({
        'button button-stroke button-inverse': true,
        'active': mode === health
      });

      var dotClassSet = classNames({
        'dot': HEALTH_STATUS_WITH_DOT.includes(health),
        'danger': HealthTypes.UNHEALTHY === health,
        'success': HealthTypes.HEALTHY === health
      });

      return (
        <button
            key={key}
            className={classSet}
            onClick={this.props.handleFilterChange.bind(null, health)}>
          <span className="button-align-content">
            <span className={dotClassSet}></span>
            <span className="label">{buttonMap[key]}</span>
            <span className="badge">{this.getCountByHealth(key)}</span>
          </span>
        </button>
      );
    });
  },

  render: function () {
    return (
      <div className="button-group flush-bottom">
        {this.getFilterButtons()}
      </div>
    );
  }
});

module.exports = FilterHealth;
