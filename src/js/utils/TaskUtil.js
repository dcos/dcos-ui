/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import Util from './Util';

const TaskUtil = {
  /**
   * Returns a list of ips or hosts from task
   * @param  {object} task to return ip or host list from
   * @return {Array.<string>} an array of ip addresses or hosts
   */
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
  },

  /**
   * Returns a list of ports, if ports is available on service it will return
   * those, otherwise it will fall back on ports on the task
   * @param  {object} task to return ports from
   * @param  {Service} service to get ports from
   * @return {Array.<number>} an array of port numbers
   */
  getPortList(task, service) {
    let ports = Util.findNestedPropertyInObject(
      service.getIpAddress(),
      'discovery.ports'
    );

    // If there are no service ports, use task ports
    if (!ports || !ports.length) {
      return task.ports || [];
    }

    return ports.map(function (port) {
      return port.number;
    });
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
