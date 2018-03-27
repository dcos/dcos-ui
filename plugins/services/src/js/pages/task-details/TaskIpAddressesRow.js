import React from "react";
import PropTypes from "prop-types";

import Application from "#PLUGINS/services/src/js/structs/Application";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import Pod from "#PLUGINS/services/src/js/structs/Pod";

export default class TaskIpAddressesRow extends React.Component {
  getIPAddressesForTask(service, taskId) {
    if (service instanceof Application) {
      const marathonTask = service.findTaskById(taskId) || { ipAddresses: [] };

      return marathonTask.ipAddresses.map(ipAddress => ipAddress.ipAddress);
    }

    if (service instanceof Pod) {
      const instance = service.findInstanceByTaskId(taskId);

      return instance ? instance.getIpAddresses() : [];
    }

    return [];
  }

  render() {
    const { taskId } = this.props;

    if (taskId == null) {
      return null;
    }

    const service = DCOSStore.serviceTree.getServiceFromTaskID(taskId);

    return (
      <ConfigurationMapRow>
        <ConfigurationMapLabel>
          IP Addresses
        </ConfigurationMapLabel>
        <ConfigurationMapValue>
          {this.getIPAddressesForTask(service, taskId).join(", ")}
        </ConfigurationMapValue>
      </ConfigurationMapRow>
    );
  }
}

TaskIpAddressesRow.propTypes = {
  taskId: PropTypes.string.isRequired
};
