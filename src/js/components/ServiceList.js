const _ = require('underscore');
import classNames from 'classnames';
import {List, Tooltip} from 'reactjs-components';
const React = require('react');

import Config from '../config/Config';
const HealthLabels = require('../constants/HealthLabels');
const HealthStatus = require('../constants/HealthStatus');
const HealthTypesDescription = require('../constants/HealthTypesDescription');
const MarathonStore = require('../stores/MarathonStore');

let ServiceList = React.createClass({

  displayName: 'ServiceList',

  propTypes: {
    services: React.PropTypes.array.isRequired,
    healthProcessed: React.PropTypes.bool.isRequired
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      services: []
    };
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    var changedState =
      nextState !== undefined && !_.isEqual(this.state, nextState);

    return !_.isEqual(this.props, nextProps) || changedState;
  },

  handleServiceClick: function (serviceName) {
    this.context.router.transitionTo('dashboard-panel', {serviceName});
  },

  getServices: function (services, healthProcessed) {
    return _.map(services, function (service) {
      let appHealth = MarathonStore.getServiceHealth(service.name);
      let state = HealthStatus.NA;
      let tooltipContent;

      if (appHealth != null) {
        state = HealthStatus[appHealth.key];

        if (appHealth.key === HealthStatus.HEALTHY.key) {
          tooltipContent = HealthTypesDescription.HEALTHY;
        } else if (appHealth.key === HealthStatus.UNHEALTHY.key) {
          tooltipContent = HealthTypesDescription.UNHEALTHY;
        } else if (appHealth.key === HealthStatus.IDLE.key) {
          tooltipContent = HealthTypesDescription.IDLE;
        } else if (appHealth.key === HealthStatus.NA.key) {
          tooltipContent = HealthTypesDescription.NA;
        }
      }

      let healthLabel = HealthLabels[state.key];
      if (!healthProcessed) {
        healthLabel = (
          <div className="loader-small ball-beat">
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
      }

      let classSet = classNames(
        'tooltip-wrapper h4 inverse flush-top flush-bottom',
        state.classNames
      );

      return {
        content: [
          {
            className: 'text-overflow',
            content: (
              <a key="title"
                onClick={this.handleServiceClick.bind(this, service.name)}
                className="h4 inverse flush-top flush-bottom clickable text-overflow">
                {service.name}
              </a>
            ),
            tag: 'span'
          },
          {
            className: 'service-list-component-health-label text-align-right',
            content: (
              <Tooltip anchor="end" content={tooltipContent} key="health"
                wrapperClassName={classSet} wrapText={true} width={200}>
                {healthLabel}
              </Tooltip>
            ),
            tag: 'div'
          }
        ]
      };
    }, this);
  },

  getNoServicesMessage: function () {
    return (
      <div>
        <h3 className="flush-top inverse text-align-center">No Services Running</h3>
        <p className="inverse flush text-align-center">Use the {Config.productName} command line tools to find and install services.</p>
      </div>
    );
  },

  getList: function () {
    let props = this.props;

    return (
      <div className="service-list-component">
        <List
          className="list list-unstyled"
          content={this.getServices(props.services, props.healthProcessed)}
          transition={false} />
      </div>
    );
  },

  getContent: function () {
    if (this.props.services.length === 0) {
      return this.getNoServicesMessage();
    } else {
      return this.getList();
    }
  },

  render: function () {
    return (
      <div>
        {this.getContent()}
      </div>
    );
  }
});

module.exports = ServiceList;
