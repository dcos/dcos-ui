import PropTypes from "prop-types";
import React from "react";

import CompositeState from "#SRC/js/structs/CompositeState";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import Units from "#SRC/js/utils/Units";

import TaskIpAddressesRow from "./TaskIpAddressesRow";
import MarathonTaskDetailsList from "../../components/MarathonTaskDetailsList";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";
import TaskUtil from "../../utils/TaskUtil";

class TaskDetailsTab extends React.Component {
  getContainerInfo(task) {
    if (task == null || !task.container) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Container Configuration
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <pre className="flex-item-grow-1 mute prettyprint flush-bottom">
            {JSON.stringify(task.container, null, 4)}
          </pre>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getMesosTaskDetails(mesosTask) {
    if (mesosTask == null) {
      return null;
    }

    const services = CompositeState.getServiceList();
    const service = services.filter({ ids: [mesosTask.framework_id] }).last();
    const node = CompositeState.getNodesList()
      .filter({ ids: [mesosTask.slave_id] })
      .last();
    const sandBoxPath = TaskDirectoryStore.get("sandBoxPath");

    let serviceRow = null;
    let nodeRow = null;
    let sandBoxRow = null;
    let resourceRows = null;

    if (mesosTask.resources != null) {
      const resourceLabels = ResourcesUtil.getResourceLabels();

      resourceRows = ResourcesUtil.getDefaultResources().map(function(
        resource,
        index
      ) {
        return (
          <ConfigurationMapRow key={index}>
            <ConfigurationMapLabel>
              {resourceLabels[resource]}
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {Units.formatResource(resource, mesosTask.resources[resource])}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        );
      });
    }

    if (service != null) {
      serviceRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Service
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {service.name} ({service.id})
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    if (node != null) {
      nodeRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Node
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {node.getHostName()} ({node.getID()})
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    if (sandBoxPath) {
      sandBoxRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Sandbox Path
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {sandBoxPath}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Configuration
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Task ID
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {mesosTask.id}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        {serviceRow}
        {nodeRow}
        {sandBoxRow}
        <TaskIpAddressesRow taskId={mesosTask.id} />
        {resourceRows}
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Zone
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {TaskUtil.getZoneName(mesosTask)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Region
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {TaskUtil.getRegionName(mesosTask)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getMesosTaskLabels(mesosTask) {
    if (mesosTask == null) {
      return null;
    }

    let labelRows = null;

    if (mesosTask.labels) {
      labelRows = mesosTask.labels.map(function({ key, value }) {
        return (
          <ConfigurationMapRow key={key}>
            <ConfigurationMapLabel>
              {key}
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {value}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        );
      });
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Labels
        </ConfigurationMapHeading>
        {labelRows}
      </ConfigurationMapSection>
    );
  }

  render() {
    const { task } = this.props;

    if (!MesosSummaryStore.get("statesProcessed")) {
      return <Loader />;
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getMesosTaskDetails(task)}
          {this.getMesosTaskLabels(task)}
          <MarathonTaskDetailsList taskID={task.id} />
          {this.getContainerInfo(task)}
        </ConfigurationMap>
      </div>
    );
  }
}

TaskDetailsTab.propTypes = {
  task: PropTypes.object
};

TaskDetailsTab.defaultProps = {
  task: {}
};

module.exports = TaskDetailsTab;
