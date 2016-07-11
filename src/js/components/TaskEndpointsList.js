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
      isExpanded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getEndpointsList(hosts, ports) {
    let totalPortCount = ports.length;
    let {portLimit} = this.props;

    return hosts.map((host, hostIndex) => {
      let showHideLink = null;

      if (this.state.isExpanded) {
        portLimit = ports.length;
      }

      let renderedPorts = ports.splice(0, portLimit);

      if (renderedPorts.length < totalPortCount || this.state.isExpanded) {
        showHideLink = this.getShowHideLink();
      }

      let portLinks = this.getPortsList(renderedPorts, host, hostIndex);

      return (
        <div key={hostIndex}>
          {host}: [{portLinks}{showHideLink}]
        </div>
      );
    });
  }

  getPortsList(ports, host, hostIndex) {
    return ports.map((port, portIndex) => {
      let separator = ', ';

      if (portIndex === ports.length - 1
        || (portIndex === this.props.portLimit - 1
          && !this.state.isExpanded)) {
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

  getShowHideLink() {
    let showHideText = 'more...';

    if (this.state.isExpanded) {
      showHideText = 'less';
    }

    return (
      <span>
        {', '}
        <a className="clickable" onClick={this.handlePortsToggle}>
          {showHideText}
        </a>
      </span>
    );
  }

  handlePortsToggle() {
    this.setState({isExpanded: !this.state.isExpanded});
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

module.exports = TaskEndpointsList;
