import React from 'react';

import CompositeState from '../../../../../../src/js/structs/CompositeState';
import ConfigurationMap from '../../../../../../src/js/components/ConfigurationMap';
import ConfigurationMapHeading from '../../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapRow from '../../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../../src/js/components/ConfigurationMapSection';
import HashMapDisplay from '../../../../../../src/js/components/HashMapDisplay';
import Loader from '../../../../../../src/js/components/Loader';
import MarathonTaskDetailsList from '../../components/MarathonTaskDetailsList';
import MesosSummaryStore from '../../../../../../src/js/stores/MesosSummaryStore';
import ResourcesUtil from '../../../../../../src/js/utils/ResourcesUtil';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';
import TaskEndpointsList from '../../components/TaskEndpointsList';
import Units from '../../../../../../src/js/utils/Units';

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

  getMesosTaskDetailsHashMapDisplay(mesosTask) {
    if (mesosTask == null) {
      return null;
    }

    let headerValueMapping = {'Task ID': mesosTask.id};
    const services = CompositeState.getServiceList();
    const service = services.filter({ids: [mesosTask.framework_id]}).last();
    if (service != null) {
      headerValueMapping['Service'] = `${service.name} (${service.id})`;
    }

    let node = CompositeState.getNodesList()
      .filter({ids: [mesosTask.slave_id]}).last();
    if (node != null) {
      headerValueMapping['Node'] = `${node.getHostName()} (${node.getID()})`;
    }

    const sandBoxPath = TaskDirectoryStore.get('sandBoxPath');
    if (sandBoxPath) {
      headerValueMapping['Sandbox Path'] = sandBoxPath;
    }

    headerValueMapping['Endpoints'] = (
      <TaskEndpointsList task={mesosTask} node={node} />
    );

    return (
      <HashMapDisplay
        hash={headerValueMapping}
        headline="Configuration" />
    );
  }

  getMesosTaskLabelHashMapDisplay(mesosTask) {
    if (mesosTask == null) {
      return null;
    }

    let labelMapping = {};
    if (mesosTask.labels) {
      mesosTask.labels.forEach(function (label) {
        labelMapping[label.key] = label.value;
      });
    }

    return (
      <HashMapDisplay
        hash={labelMapping}
        headline="Labels" />
    );
  }

  getResources(task) {
    if (task.resources == null) {
      return null;
    }

    const resourceColors = ResourcesUtil.getResourceColors();
    const resourceLabels = ResourcesUtil.getResourceLabels();

    const resourceGraphs = ResourcesUtil.getDefaultResources().map(function (resource) {
      if (resource === 'ports') {
        return null;
      }

      const resourceLabel = resourceLabels[resource];
      let resourceValue = Units.formatResource(
        resource, task.resources[resource]
      );
      const colorIndex = resourceColors[resource];

      return (
        <div key={resource} className="media-object-item">
          <h4 className="flush-top flush-bottom">
            {resourceValue}
          </h4>
          <span className={`side-panel-resource-label text-color-${colorIndex}`}>
            {resourceLabel.toUpperCase()}
          </span>
        </div>
      );
    });

    return (
      <div className="pod flush-top flush-right flush-left">
        <div className="media-object-spacing-wrapper media-object-spacing-wide">
          <div className="media-object">
            {resourceGraphs}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {task} = this.props;

    if (!MesosSummaryStore.get('statesProcessed')) {
      return <Loader />;
    }

    return (
      <div className="container">
        {this.getResources(task)}
        <ConfigurationMap>
          {this.getMesosTaskDetailsHashMapDisplay(task)}
          {this.getMesosTaskLabelHashMapDisplay(task)}
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
