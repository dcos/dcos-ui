import { Trans, Plural } from "@lingui/macro";
import isEqual from "lodash.isequal";
import { List } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import { Link } from "react-router";

import ServiceStatusIcon from "./ServiceStatusIcon";

const ServiceList = createReactClass({
  displayName: "ServiceList",

  propTypes: {
    services: PropTypes.array.isRequired
  },

  contextTypes: {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  },

  getDefaultProps() {
    return {
      services: []
    };
  },

  shouldComponentUpdate(nextProps, nextState) {
    var changedState =
      nextState !== undefined && !isEqual(this.state, nextState);

    return !isEqual(this.props, nextProps) || changedState;
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
    this.context.router.push(`/services/detail/${id}`);
  },

  getServices(services) {
    return services.map(service => {
      const instancesCount = service.getInstancesCount();
      const runningInstances = service.getRunningInstancesCount();

      const tooltipContent = (
        <Plural
          render="span"
          value={runningInstances}
          one={`# instance running out of ${instancesCount}`}
          other={`# instances running out of ${instancesCount}`}
        />
      );

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
              <ServiceStatusIcon
                key="icon"
                service={service}
                showTooltip={true}
                tooltipContent={tooltipContent}
              />
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
        <Trans render="h3" className="flush-top text-align-center">
          No Services Running
        </Trans>
        <Trans render="p" className="flush text-align-center">
          Click the <Link to="/services">Services tab</Link> to install{" "}
          services.
        </Trans>
      </div>
    );
  },

  getList() {
    const props = this.props;

    return (
      <div className="dashboard-health-list">
        <List
          className="list list-unstyled"
          content={this.getServices(props.services)}
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
