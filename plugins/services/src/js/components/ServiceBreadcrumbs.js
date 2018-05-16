import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbSupplementalContent
  from "#SRC/js/components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import Util from "#SRC/js/utils/Util";
import deepEqual from "deep-equal";
import React from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router";
import ServiceTree from "../structs/ServiceTree";
import HealthBar from "./HealthBar";
import ServiceStatusWarningWithDebugInformation
  from "./ServiceStatusWarningWithDebugInstruction";

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

  shouldComponentUpdate(nextProps) {
    const hasServiceIDChanged = this.props.serviceID !== nextProps.serviceID;
    const hasTaskIDChanged = this.props.taskID !== nextProps.taskID;
    const hasTaskNameChanged = this.props.taskName !== nextProps.taskName;
    const hasExtraNotChanged =
      this.props.extra === nextProps.extra ||
      deepEqual(this.props.extra, nextProps.extra);

    return (
      hasServiceIDChanged ||
      hasTaskIDChanged ||
      hasTaskNameChanged ||
      !hasExtraNotChanged
    );
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
    const runningTasksCount = service.getRunningInstancesCount();
    const instancesCount = service.getInstancesCount();
    const isDeploying = serviceStatus === "Deploying";

    if (instancesCount === 0) {
      return null;
    }

    const taskCountDetails = runningTasksCount === instancesCount
      ? `(${runningTasksCount})`
      : `(${runningTasksCount} of ${instancesCount})`;

    return (
      <BreadcrumbSupplementalContent
        ref={ref => (this.breadcrumbStatusRef = ref)}
      >
        <BreadcrumbSupplementalContent>
          <span className="muted">
            {serviceStatus} {taskCountDetails}
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

  getServiceImage(service, aggregateIDs) {
    if (service == null || service instanceof ServiceTree) {
      return null;
    }

    return (
      <BreadcrumbSupplementalContent>
        <Link to={"/services/detail/" + aggregateIDs}>
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
        let routePath = "/services/overview/" + aggregateIDs;
        if (index === ids.length - 1) {
          const service = DCOSStore.serviceTree.findItemById(serviceID);
          // Make sure to change to detail route if service is not a group
          if (!(service instanceof ServiceTree)) {
            routePath = "/services/detail/" + aggregateIDs;
          }
          breadcrumbHealth = this.getHealthStatus(service);
          serviceImage = this.getServiceImage(service, aggregateIDs);
        }

        return (
          <Breadcrumb key={index} title={ids.slice(0, index + 1).join("/")}>
            {serviceImage}
            <BreadcrumbTextContent
              ref={ref => (this.primaryBreadcrumbTextRef = ref)}
            >
              <Link to={routePath}>
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
              to={`/services/detail/${aggregateIDs}/tasks/${encodedTaskID}`}
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
