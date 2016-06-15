import classNames from 'classnames';
import deepEqual from 'deep-equal';
import {List, Tooltip} from 'reactjs-components';
const React = require('react');

import Cluster from '../utils/Cluster';
import Config from '../config/Config';
const HealthLabels = require('../constants/HealthLabels');
const HealthStatus = require('../constants/HealthStatus');
const HealthTypesDescription = require('../constants/HealthTypesDescription');

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
      nextState !== undefined && !deepEqual(this.state, nextState);

    return !deepEqual(this.props, nextProps) || changedState;
  },

  handleServiceClick: function (service, event) {
    // Open service in new window/tab if service has a web URL
    if (service.getWebURL && service.getWebURL() &&
      (event.ctrlKey || event.shiftKey || event.metaKey)) {
      return;
    }

    // Modifier key not pressed or service didn't have a web URL, open detail
    event.preventDefault();
    this.context.router.transitionTo(
      'services-detail',
      {id: encodeURIComponent(service.getId())}
    );
  },

  getServices: function (services, healthProcessed) {
    return services.map((service) => {
      let appHealth = service.getHealth();
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
            className: 'dashboard-health-list-item-description',
            content: (
              <a key="title"
                onClick={this.handleServiceClick.bind(this, service)}
                href={Cluster.getServiceLink(service.getName())}
                className="dashboard-health-list-item-cell h4 inverse flush-top
                  flush-bottom clickable text-overflow">
                {service.getName()}
              </a>
            ),
            tag: 'span'
          },
          {
            className: 'dashboard-health-list-health-label',
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
    });
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
      <div className="dashboard-health-list">
        <List
          className="list list-unstyled"
          content={this.getServices(props.services, props.healthProcessed)}
          transition={false}
          transitionName="something" />
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
