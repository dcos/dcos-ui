import React from 'react';

import TaskUtil from '../utils/TaskUtil';

const METHODS_TO_BIND = [
  'getEndpointsList',
  'getPortsList',
  'getShowHideLink',
  'handlePortsToggle'
];

class TaskEndpointsList extends React.Component {
  constructor() {
    super();

    this.state = {
      expandedHosts: []
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getEndpointsList(hosts, ports) {
    let totalPortCount = ports.length;

    return hosts.map((host, hostIndex) => {
      let isExpanded = this.state.expandedHosts.includes(host);
      let {portLimit} = this.props;
      let showHideLink = null;

      if (isExpanded) {
        portLimit = ports.length;
      }

      let renderedPorts = ports.slice(0, portLimit);

      if (renderedPorts.length < totalPortCount || isExpanded) {
        showHideLink = this.getShowHideLink(
          totalPortCount - portLimit,
          host,
          isExpanded
        );
      }

      let portLinks = this.getPortsList(
        renderedPorts,
        host,
        hostIndex,
        isExpanded
      );

      return (
        <div key={hostIndex}>
          {host}: [{portLinks}{showHideLink}]
        </div>
      );
    });
  }

  getPortsList(ports, host, hostIndex, isExpanded) {
    return ports.map((port, portIndex) => {
      let separator = ', ';

      if (portIndex === ports.length - 1
        || (portIndex === this.props.portLimit - 1 && !isExpanded)) {
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
      showHideText = 'less';
    }

    return (
      <span>
        {', '}
        <a
          className="clickable"
          onClick={this.handlePortsToggle.bind(this, host)}>
          {showHideText}
        </a>
      </span>
    );
  }

  handlePortsToggle(host) {
    let {expandedHosts} = this.state;
    let hostIndex = expandedHosts.indexOf(host);

    if (hostIndex > -1) {
      expandedHosts.splice(hostIndex, 1);
    } else {
      expandedHosts.push(host);
    }

    this.setState({expandedHosts});
  }

  render() {
    let {hosts, ports} = TaskUtil.getTaskEndpoints(this.props.task);
    let totalPortCount = ports.length;

    if (hosts.length === 0 || totalPortCount === 0) {
      return <span>N/A</span>;
    }

    let content = null;

    if (hosts.length === 1 && totalPortCount === 1) {
      let url = `${hosts[0]}:${ports[0]}`;
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
  task: React.PropTypes.object.isRequired
};

module.exports = TaskEndpointsList;
