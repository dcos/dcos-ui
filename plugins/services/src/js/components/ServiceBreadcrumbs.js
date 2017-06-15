import ReactDOM from "react-dom";
import React from "react";
import { Link } from "react-router";

import { DCOSStore } from "foundation-ui";
import Breadcrumb from "../../../../../src/js/components/Breadcrumb";
import BreadcrumbSupplementalContent
  from "../../../../../src/js/components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent
  from "../../../../../src/js/components/BreadcrumbTextContent";
import HealthBar from "./HealthBar";
import PageHeaderBreadcrumbs
  from "../../../../../src/js/components/PageHeaderBreadcrumbs";
import ServiceStatusWarningWithDebugInformation
  from "./ServiceStatusWarningWithDebugInstruction";
import ServiceTree from "../structs/ServiceTree";
import Util from "../../../../../src/js/utils/Util";

// The breadcrumb's margin is hardcoded to avoid calling #getComputedStyle.
const BREADCRUMB_CONTENT_MARGIN = 7;
const METHODS_TO_BIND = ["checkBreadcrumbOverflow", "handleViewportResize"];

class ServiceBreadcrumbs extends React.Component {
  constructor() {
    super();

    this.breadcrumbStatusRef = null;
    this.primaryBreadcrumbTextRef = null;
    this.lastStatusWidth = 0;

    this.state = {
      shouldRenderServiceStatus: true
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.handleViewportResize = Util.debounce(this.handleViewportResize, 100);
  }

  componentDidMount() {
    this.checkBreadcrumbOverflow();
    global.addEventListener("resize", this.handleViewportResize);
  }

  componentDidUpdate() {
    this.checkBreadcrumbOverflow();
  }

  componentWillUnmount() {
    global.removeEventListener("resize", this.handleViewportResize);
  }

  handleViewportResize() {
    this.checkBreadcrumbOverflow();
  }

  /**
   * Check if the breadcrumbs are overflowing their container. If they are,
   * we hide the service's status bar.
   */
  checkBreadcrumbOverflow() {
    if (this.primaryBreadcrumbTextRef != null) {
      const availableWidth = this.getAvailableBreadcrumbWidth();
      const statusBarWidth = this.getBreadcrumbStatusBarWidth();

      if (availableWidth <= 0 && this.state.shouldRenderServiceStatus) {
        // Hide the status bar when the breadcrumbs are wider than the
        // container's width.
        this.setState({ shouldRenderServiceStatus: false });
      } else if (
        availableWidth > statusBarWidth &&
        !this.state.shouldRenderServiceStatus
      ) {
        // Show the status bar if its width is less than the amount of available
        // space.
        this.setState({ shouldRenderServiceStatus: true });
      }
    }
  }

  /**
   * Calculates the number of unused pixels after the last breadcrumb.
   *
   * @returns {Number} width in pixels
   */
  getAvailableBreadcrumbWidth() {
    const breadcrumbsNode = ReactDOM.findDOMNode(this);
    const breadcrumbsDimensions = breadcrumbsNode.getBoundingClientRect();
    const lastBreadcrumbNode = breadcrumbsNode.querySelector(
      ".breadcrumb:last-child"
    );
    const lastBreadcrumbDimensions = lastBreadcrumbNode.getBoundingClientRect();

    return (
      breadcrumbsDimensions.left +
      breadcrumbsDimensions.width -
      lastBreadcrumbDimensions.right
    );
  }

  /**
   * Calculates the width of the status indicator, plus its sibling's margin.
   *
   * @returns {Number} width in pixels
   */
  getBreadcrumbStatusBarWidth() {
    if (this.breadcrumbStatusRef != null) {
      this.lastStatusWidth =
        ReactDOM.findDOMNode(this.breadcrumbStatusRef).clientWidth +
        BREADCRUMB_CONTENT_MARGIN;
    }

    return this.lastStatusWidth;
  }

  getHealthStatus(service) {
    if (service == null || !this.state.shouldRenderServiceStatus) {
      return null;
    }

    const serviceStatus = service.getStatus();
    const tasksSummary = service.getTasksSummary();
    const runningTasksCount = tasksSummary.tasksRunning;
    const instancesCount = service.getInstancesCount();
    const isDeploying = serviceStatus === "Deploying";

    if (instancesCount === 0) {
      return null;
    }

    return (
      <BreadcrumbSupplementalContent
        ref={ref => (this.breadcrumbStatusRef = ref)}
      >
        <BreadcrumbSupplementalContent>
          <span className="muted">
            {serviceStatus} ({runningTasksCount} of {instancesCount})
          </span>
          <ServiceStatusWarningWithDebugInformation item={service} />
        </BreadcrumbSupplementalContent>
        <BreadcrumbSupplementalContent hasStatusBar={true}>
          <HealthBar
            key="status-bar"
            instancesCount={instancesCount}
            isDeploying={isDeploying}
            tasksSummary={tasksSummary}
          />
        </BreadcrumbSupplementalContent>
      </BreadcrumbSupplementalContent>
    );
  }

  getServiceImage(service, serviceLink) {
    if (service == null || service instanceof ServiceTree) {
      return null;
    }

    return (
      <BreadcrumbSupplementalContent>
        <Link to={`/services/overview/${serviceLink}`}>
          <span className="icon icon-small icon-image-container icon-app-container">
            <img src={service.getImages()["icon-small"]} />
          </span>
        </Link>
      </BreadcrumbSupplementalContent>
    );
  }

  render() {
    const { serviceID, taskID, taskName, extra } = this.props;

    let crumbs = [
      <Breadcrumb key={-1} title="Services">
        <BreadcrumbTextContent>
          <Link to="/services">Services</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];

    let aggregateIDs = "";
    const trimmedServiceID = decodeURIComponent(serviceID).replace(/^\//, "");
    const ids = trimmedServiceID.split("/");

    if (serviceID != null && trimmedServiceID.length > 0) {
      const serviceCrumbs = ids.map((id, index) => {
        let breadcrumbHealth = null;
        let serviceImage = null;

        aggregateIDs += encodeURIComponent(`/${id}`);

        if (index === ids.length - 1) {
          const service = DCOSStore.serviceTree.findItemById(serviceID);

          breadcrumbHealth = this.getHealthStatus(service);
          serviceImage = this.getServiceImage(service, aggregateIDs);
        }

        return (
          <Breadcrumb key={index} title={ids.slice(0, index + 1).join("/")}>
            {serviceImage}
            <BreadcrumbTextContent
              ref={ref => (this.primaryBreadcrumbTextRef = ref)}
            >
              <Link to={`/services/overview/${aggregateIDs}`}>
                {id}
              </Link>
            </BreadcrumbTextContent>
            {breadcrumbHealth}
          </Breadcrumb>
        );
      });

      crumbs.push(...serviceCrumbs);
    }

    if (taskID != null && taskName != null) {
      const encodedTaskID = encodeURIComponent(taskID);
      crumbs.push(
        <Breadcrumb key={trimmedServiceID.length + 1} title={taskID}>
          <BreadcrumbTextContent>
            <Link
              to={`/services/overview/${aggregateIDs}/tasks/${encodedTaskID}`}
              index={taskID}
            >
              {taskName}
            </Link>
          </BreadcrumbTextContent>
        </Breadcrumb>
      );
    }

    if (Array.isArray(extra)) {
      crumbs = crumbs.concat(extra);
    }

    return (
      <PageHeaderBreadcrumbs
        iconID="services"
        iconRoute="/services"
        breadcrumbs={crumbs}
      />
    );
  }
}

ServiceBreadcrumbs.defaultProps = {
  serviceID: ""
};

ServiceBreadcrumbs.propTypes = {
  extra: React.PropTypes.arrayOf(React.PropTypes.node),
  serviceID: React.PropTypes.string,
  taskID: React.PropTypes.string,
  taskName: React.PropTypes.string
};

module.exports = ServiceBreadcrumbs;
