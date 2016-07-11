/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import MarathonStore from '../stores/MarathonStore';
import Util from './Util';

const TaskUtil = {

  getTaskEndpoints(task) {
    if (task == null || ((task.ports == null || task.ports.length === 0) &&
      (task.ipAddresses == null || task.ipAddresses.length === 0))) {
      return {hosts: [], ports: []};
    }

    let hosts = [task.host];
    let ports = task.ports || [];
    let service = MarathonStore.getServiceFromTaskID(task.id);

    if (service != null &&
      service.ipAddress != null &&
      service.ipAddress.discovery != null &&
      service.ipAddress.discovery.ports != null &&
      task.ipAddresses != null &&
      task.ipAddresses.length > 0) {
      hosts = task.ipAddresses;
      ports = service.ipAddress.discovery.ports;
    }

    return {hosts, ports};
  },

  getTaskStatusSlug(task) {
    return task.state.substring('TASK_'.length).toLowerCase();
  },

  getTaskStatusClassName(task) {
    let taskStatus = TaskUtil.getTaskStatusSlug(task);
    return `task-status-${taskStatus}`;
  },

  getPortMappings(task) {
    let container = task.container;
    if (!container || !container.type) {
      return null;
    }

    let portMappings = Util.findNestedPropertyInObject(
      container,
      `${container.type.toLowerCase()}.port_mappings`
    );

    if (!Array.isArray(portMappings)) {
      return null;
    }

    return portMappings;
  }

};

module.exports = TaskUtil;
