import classNames from "classnames";
import deepEqual from "deep-equal";
import { List, Tooltip } from "reactjs-components";
import React from "react";
import { Link, routerShape } from "react-router";

import HealthLabels from "../constants/HealthLabels";
import HealthStatus from "../constants/HealthStatus";
import HealthTypesDescription from "../constants/HealthTypesDescription";
import Loader from "../../../../../src/js/components/Loader";

const ServiceList = React.createClass({
  displayName: "ServiceList",

  propTypes: {
    services: React.PropTypes.array.isRequired,
    healthProcessed: React.PropTypes.bool.isRequired
  },

  contextTypes: {
    router: routerShape
  },

  getDefaultProps() {
    return {
      services: []
    };
  },

  shouldComponentUpdate(nextProps, nextState) {
    var changedState =
      nextState !== undefined && !deepEqual(this.state, nextState);

    return !deepEqual(this.props, nextProps) || changedState;
  },

  handleServiceClick(service, event) {
    // Open service in new window/tab if service has a web URL
    if (
      service.getWebURL() &&
      (event.ctrlKey || event.shiftKey || event.metaKey)
    ) {
      return;
    }
    const id = encodeURIComponent(service.getId());
    // Modifier key not pressed or service didn't have a web URL, open detail
    event.preventDefault();
    this.context.router.push(`/services/overview/${id}`);
  },

  getServices(services, healthProcessed) {
    return services.map(service => {
      const appHealth = service.getHealth();
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
        healthLabel = <Loader size="small" type="ballBeat" />;
      }

      const classSet = classNames("tooltip-wrapper", state.classNames);

      return {
        content: [
          {
            className: "dashboard-health-list-item-description text-overflow",
            content: (
              <a
                key="title"
                onClick={this.handleServiceClick.bind(this, service)}
                href={service.getWebURL()}
                className="dashboard-health-list-item-cell emphasis"
              >
                {service.getName()}
              </a>
            ),
            tag: "span"
          },
          {
            className: "dashboard-health-list-health-label",
            content: (
              <Tooltip
                anchor="end"
                content={tooltipContent}
                key="health"
                wrapperClassName={classSet}
                wrapText={true}
                width={200}
              >
                {healthLabel}
              </Tooltip>
            ),
            tag: "div"
          }
        ]
      };
    });
  },

  getNoServicesMessage() {
    return (
      <div>
        <h3 className="flush-top text-align-center">No Services Running</h3>
        <p className="flush text-align-center">
          {"Click the "}
          <Link to="/services">Services tab</Link>
          {" to install services."}
        </p>
      </div>
    );
  },

  getList() {
    const props = this.props;

    return (
      <div className="dashboard-health-list">
        <List
          className="list list-unstyled"
          content={this.getServices(props.services, props.healthProcessed)}
          transition={false}
          transitionName="something"
        />
      </div>
    );
  },

  getContent() {
    if (this.props.services.length === 0) {
      return this.getNoServicesMessage();
    } else {
      return this.getList();
    }
  },

  render() {
    return this.getContent();
  }
});

module.exports = ServiceList;
