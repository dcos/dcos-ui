import React from 'react';

import CompositeState from '../../structs/CompositeState';
import DescriptionList from '../../components/DescriptionList';
import Icon from '../../components/Icon';
import MarathonTaskDetailsList from '../../components/MarathonTaskDetailsList';
import MesosSummaryStore from '../../stores/MesosSummaryStore';
import ResourceColors from '../../constants/ResourceColors';
import ResourceIcons from '../../constants/ResourceIcons';
import ResourcesUtil from '../../utils/ResourcesUtil';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';
import TaskEndpointsList from '../../components/TaskEndpointsList';
import Units from '../../utils/Units';

class TaskDetailsTab extends React.Component {
  getContainerInfo(task) {
    if (task == null || !task.container ||
      !MesosSummaryStore.get('statesProcessed')) {
      return null;
    }

    return (
      <div>
        <h5 className="flush-top">
          Container Configuration
        </h5>
        <pre className="mute prettyprint flush-bottom">
          {JSON.stringify(task.container, null, 4)}
        </pre>
      </div>
    );
  }

  getMesosTaskDetailsDescriptionList(mesosTask) {
    if (mesosTask == null || !MesosSummaryStore.get('statesProcessed')) {
      return null;
    }

    let headerValueMapping = {'Task ID': mesosTask.id};
    let services = CompositeState.getServiceList();
    let service = services.filter({ids: [mesosTask.framework_id]}).last();
    if (service != null) {
      headerValueMapping['Service'] = `${service.name} (${service.id})`;
    }

    let node = CompositeState.getNodesList()
      .filter({ids: [mesosTask.slave_id]}).last();
    if (node != null) {
      headerValueMapping['Node'] = `${node.getHostName()} (${node.getID()})`;
    }

    let sandBoxPath = TaskDirectoryStore.get('sandBoxPath');
    if (sandBoxPath) {
      headerValueMapping['Sandbox Path'] = sandBoxPath;
    }

    headerValueMapping['Endpoints'] = (
      <TaskEndpointsList task={mesosTask} node={node} />
    );

    return (
      <DescriptionList
        className="container container-fluid flush container-pod container-pod-super-short flush-top"
        hash={headerValueMapping}
        headline="Configuration" />
    );
  }

  getMesosTaskLabelDescriptionList(mesosTask) {
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
      <DescriptionList
        className="container container-fluid flush container-pod container-pod-super-short flush-top"
        hash={labelMapping}
        headline="Labels" />
    );
  }

  getResources(task) {
    if (task.resources == null) {
      return null;
    }

    let resourceColors = ResourcesUtil.getResourceColors();
    let resourceLabels = ResourcesUtil.getResourceLabels();

    return ResourcesUtil.getDefaultResources().map(function (resource) {
      if (resource === 'ports') {
        return null;
      }

      let resourceLabel = resourceLabels[resource];
      let resourceValue = Units.formatResource(
        resource, task.resources[resource]
      );
      let colorIndex = resourceColors[resource];
      let resourceKey = resourceLabel.toLowerCase();
      let iconID = ResourceIcons[resourceKey];
      let iconColor = ResourceColors[resourceKey];

      return (
        <div key={resource} className="media-object-item">
          <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
            <div className="media-object media-object-align-middle">
              <div className="media-object-item">
                <Icon color={iconColor} id={iconID} />
              </div>
              <div className="media-object-item">
                <h4 className="flush-top flush-bottom">
                  {resourceValue}
                </h4>
                <span className={`side-panel-resource-label
                    text-color-${colorIndex}`}>
                  {resourceLabel.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    let {task} = this.props;

    return (
      <div className="container container-fluid flush">
        <div className="media-object-spacing-wrapper container-pod container-pod-super-short flush-top flush-bottom">
          <div className="media-object">
            {this.getResources(task)}
          </div>
        </div>
        {this.getMesosTaskDetailsDescriptionList(task)}
        {this.getMesosTaskLabelDescriptionList(task)}
        <MarathonTaskDetailsList taskID={task.id} />
        {this.getContainerInfo(task)}
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
