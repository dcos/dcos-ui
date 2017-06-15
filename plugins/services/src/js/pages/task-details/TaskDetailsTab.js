import React from "react";

import CompositeState from "../../../../../../src/js/structs/CompositeState";
import ConfigurationMap
  from "../../../../../../src/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "../../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapValue
  from "../../../../../../src/js/components/ConfigurationMapValue";
import Loader from "../../../../../../src/js/components/Loader";
import MarathonTaskDetailsList from "../../components/MarathonTaskDetailsList";
import MesosSummaryStore
  from "../../../../../../src/js/stores/MesosSummaryStore";
import ResourcesUtil from "../../../../../../src/js/utils/ResourcesUtil";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";
import TaskEndpointsList from "../../components/TaskEndpointsList";
import Units from "../../../../../../src/js/utils/Units";

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
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Endpoints
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            <TaskEndpointsList task={mesosTask} node={node} />
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        {resourceRows}
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
  task: React.PropTypes.object
};

TaskDetailsTab.defaultProps = {
  task: {}
};

module.exports = TaskDetailsTab;
