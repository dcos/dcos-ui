import React from 'react';

import DescriptionList from './DescriptionList';
import MarathonStore from '../stores/MarathonStore';
import Util from '../utils/Util';

class MarathonTaskDetailsList extends React.Component {
  getHostList(task) {
    let {ipAddresses} = task;
    if (ipAddresses && ipAddresses.length) {
      return ipAddresses.map(function (address) {
        return address.ipAddress;
      });
    }

    if (!task.host) {
      return [];
    }

    return [task.host];
  }

  getPortList(task) {
    let service = MarathonStore.getServiceFromTaskID(task.id);
    let ports = Util.findNestedPropertyInObject(
      service,
      'ipAddress.discovery.ports'
    );

    // If there are no service ports, use task ports
    if (!ports || !ports.length) {
      return task.ports;
    }

    return ports.map(function (port) {
      return port.number;
    });
  }

  getTaskEndpoints(task) {
    let hosts = this.getHostList(task) || [];
    let ports = this.getPortList(task) || [];
    if (!hosts.length && !ports.length) {
      return 'None';
    }

    // If there are no ports, return list of ip addresses
    if (!ports.length && hosts.length) {
      return hosts.join(', ');
    }

    // Map each port onto a host, to create endpoint list
    let endpoints = hosts.reduce(function (memo, host) {
      ports.forEach(function (port) {
        memo.push(`${host}:${port}`);
      });

      return memo;
    }, []);

    return endpoints.map(function (endpoint, index) {
      return (
        <a
          className="visible-block"
          href={`//${endpoint}`}
          key={index}
          target="_blank">
          {endpoint}
        </a>
      );
    });
  }

  getTaskStatus(task) {
    if (task == null || task.status == null) {
      return 'Unknown';
    }
    return task.status;
  }

  getTimeField(time) {
    let timeString = 'Never';

    if (time != null) {
      timeString = new Date(time).toLocaleString();
    }

    return (
      <time dateTime={time} title={time}>
        {timeString}
      </time>
    );
  }

  getMarathonTaskDetailsDescriptionList(task) {
    if (task == null) {
      return null;
    }

    let headerValueMapping = {
      'Host': task.host,
      'Ports': task.ports.join(', '),
      'Endpoints': this.getTaskEndpoints(task),
      'Status': this.getTaskStatus(task),
      'Staged at': this.getTimeField(task.stagedAt),
      'Started at': this.getTimeField(task.startedAt),
      'Version': task.version
    };

    return (
      <DescriptionList
        className="container container-fluid flush container-pod container-pod-super-short flush-top"
        hash={headerValueMapping}
        headline="Marathon Task Configuration" />
    );
  }

  getMarathonTaskHealthCheckResults(task) {
    if (task == null || task.healthCheckResults == null) {

      return null;
    }

    return task.healthCheckResults.map((result, i) =>{
      let consecutiveFailures = result.consecutiveFailures;
      let alive = 'Yes';

      if (consecutiveFailures == null) {
        consecutiveFailures = 'None';
      }

      if (!result.alive) {
        alive = 'No';
      }

      const headerValueMapping = {
        'First success': this.getTimeField(result.firstSuccess),
        'Last success': this.getTimeField(result.lastSuccess),
        'Last failure': this.getTimeField(result.lastFailure),
        'Consecutive failures': consecutiveFailures,
        'Alive': alive
      };

      return (
        <DescriptionList
          key={i}
          className="container container-fluid flush container-pod container-pod-super-short flush-top"
          hash={headerValueMapping}
          headline={`Health Check Result ${i+1}`} />
      );
    });
  }

  render() {
    const marathonTask = MarathonStore.getTaskFromTaskID(this.props.taskID);
    const taskConfiguration =
      this.getMarathonTaskDetailsDescriptionList(marathonTask);
    const healthCheckResults =
      this.getMarathonTaskHealthCheckResults(marathonTask);
    return (
      <div>
        {taskConfiguration}
        {healthCheckResults}
      </div>
    );
  }
};

MarathonTaskDetailsList.propTypes = {
  taskID: React.PropTypes.string.isRequired
};

module.exports = MarathonTaskDetailsList;
