import React from 'react';

import DescriptionList from './DescriptionList';
import MarathonStore from '../stores/MarathonStore';

class MarathonTaskDetailsList extends React.Component {
  getTaskEndpoints(task) {
    if ((task.ports == null || task.ports.length === 0) &&
        (task.ipAddresses == null || task.ipAddresses.length === 0)) {
      return 'None';
    }

    let service = MarathonStore.getServiceFromTaskID(task.id);

    if (service != null &&
      service.ipAddress != null &&
      service.ipAddress.discovery != null &&
      service.ipAddress.discovery.ports != null &&
      task.ipAddresses != null &&
      task.ipAddresses.length > 0) {

      let ports = service.ipAddress.discovery.ports;
      let endpoints = task.ipAddresses.reduce(function (memo, address) {
        ports.forEach(function (port) {
          memo.push(`${address.ipAddress}:${port.number}`);
        });

        return memo;
      }, []);

      if (endpoints.length) {
        return endpoints.map(function (endpoint, index) {
          return (
            <a key={index} className="visible-block" href={`//${endpoint}`} target="_blank">
              {endpoint}
            </a>
          );
        });
      }

      return 'n/a';
    }

    return task.ports.map(function (port, index) {
      let endpoint = `${task.host}:${port}`;
      return (
        <a key={index} className="visible-block" href={`//${endpoint}`} target="_blank">
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
    return (
      <time dateTime={time} title={time}>
        {new Date(time).toLocaleString()}
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

  render() {
    const marathonTask = MarathonStore.getTaskFromTaskID(this.props.taskID);

    return this.getMarathonTaskDetailsDescriptionList(marathonTask);
  }
};

MarathonTaskDetailsList.propTypes = {
  taskID: React.PropTypes.string.isRequired
};

module.exports = MarathonTaskDetailsList;
