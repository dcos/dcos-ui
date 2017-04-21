import React from "react";
import deepEqual from "deep-equal";

import TaskUtil from "../utils/TaskUtil";

const METHODS_TO_BIND = [
  "getEndpointsList",
  "getPortsList",
  "getShowHideLink",
  "handlePortsToggle"
];

class TaskEndpointsList extends React.Component {
  constructor() {
    super();

    this.state = {
      expandedHosts: []
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !deepEqual(this.props.task, nextProps.task) ||
      !deepEqual(this.state, nextState)
    );
  }

  getNullList() {
    return <span>N/A</span>;
  }

  getEndpointsList(hosts, ports = []) {
    const totalPortCount = ports.length;

    return hosts.map((host, hostIndex) => {
      const isExpanded = this.state.expandedHosts.includes(host);
      let { portLimit } = this.props;
      let portsEl = null;
      let showHideLink = null;

      if (isExpanded) {
        portLimit = totalPortCount;
      }

      const renderedPorts = ports.slice(0, portLimit);

      if (renderedPorts.length < totalPortCount || isExpanded) {
        showHideLink = this.getShowHideLink(
          totalPortCount - portLimit,
          host,
          isExpanded
        );
      }

      const portLinks = this.getPortsList(
        renderedPorts,
        host,
        hostIndex,
        isExpanded
      );

      if (totalPortCount > 0) {
        portsEl = <span>: [{portLinks}{showHideLink}]</span>;
      } else {
        host = <a href={`//${host}`} target="_blank">{host}</a>;
      }

      return (
        <div key={hostIndex}>
          {host}{portsEl}
        </div>
      );
    });
  }

  getPortsList(ports, host, hostIndex, isExpanded) {
    return ports.map((port, portIndex) => {
      let separator = ", ";

      if (
        portIndex === ports.length - 1 ||
        (portIndex === this.props.portLimit - 1 && !isExpanded)
      ) {
        separator = null;
      }

      return (
        <span key={`${hostIndex}:${portIndex}`}>
          <a href={`//${host}:${port}`} target="_blank">{port}</a>
          {separator}
        </span>
      );
    });
  }

  getShowHideLink(remainingPorts, host, isExpanded) {
    let showHideText = `${remainingPorts} more...`;

    if (isExpanded) {
      showHideText = "less";
    }

    return (
      <span>
        {", "}
        <a
          className="clickable"
          onClick={this.handlePortsToggle.bind(this, host)}
        >
          {showHideText}
        </a>
      </span>
    );
  }

  handlePortsToggle(host) {
    // Prevent mutating state.
    const expandedHosts = Object.assign([], this.state.expandedHosts);
    const hostIndex = expandedHosts.indexOf(host);

    if (hostIndex > -1) {
      expandedHosts.splice(hostIndex, 1);
    } else {
      expandedHosts.push(host);
    }

    this.setState({ expandedHosts });
  }

  render() {
    const { node, task } = this.props;
    if (task == null) {
      return this.getNullList();
    }

    const { hosts, ports } = TaskUtil.getHostAndPortList(task, node);
    const totalPortCount = ports.length;

    if (hosts.length === 0 && totalPortCount === 0) {
      return this.getNullList();
    }

    let content = null;

    if (hosts.length === 1 && totalPortCount === 1) {
      const url = `${hosts[0]}:${ports[0]}`;
      content = <a href={`//${url}`} target="_blank">{url}</a>;
    } else {
      content = this.getEndpointsList(hosts, ports);
    }

    return <div className="task-endpoint-list">{content}</div>;
  }
}

TaskEndpointsList.defaultProps = {
  portLimit: 3
};

TaskEndpointsList.propTypes = {
  portLimit: React.PropTypes.number,
  task: React.PropTypes.object,
  node: React.PropTypes.object
};

module.exports = TaskEndpointsList;
