import classNames from 'classnames';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import DescriptionList from './DescriptionList';
import MesosStateStore from '../stores/MesosStateStore';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import ResourceTypes from '../constants/ResourceTypes';
import RequestErrorMsg from './RequestErrorMsg';
import SidePanelContents from './SidePanelContents';
import TaskDebugView from './TaskDebugView';
import TaskDirectoryView from './TaskDirectoryView';
import TaskDirectoryStore from '../stores/TaskDirectoryStore';
import TaskStates from '../constants/TaskStates';
import TaskUtil from '../utils/TaskUtil';
import Units from '../utils/Units';

const TABS = {
  files: 'Files',
  details: 'Details',
  debug: 'Log Viewer'
};

const METHODS_TO_BIND = [
  'onTaskDirectoryStoreError',
  'onTaskDirectoryStoreSuccess'
];

class TaskSidePanelContents extends SidePanelContents {
  constructor() {
    super(...arguments);

    this.tabs_tabs = Object.assign({}, TABS);

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      directory: null,
      expandClass: 'large',
      showExpandButton: false,
      selectedLogFile: null,
      taskDirectoryErrorCount: 0
    };

    this.store_listeners = [
      {name: 'state', events: ['success'], listenAlways: false},
      {name: 'summary', events: ['success'], listenAlways: false},
      {name: 'taskDirectory', events: ['error', 'success']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.store_removeEventListenerForStoreID('summary', 'success');
  }

  onStateStoreSuccess() {
    let task = MesosStateStore.getTaskFromTaskID(this.props.itemID);
    TaskDirectoryStore.getDirectory(task);
  }

  onTaskDirectoryStoreError() {
    this.setState({
      taskDirectoryErrorCount: this.state.taskDirectoryErrorCount + 1
    });
  }

  onTaskDirectoryStoreSuccess() {
    this.setState({
      directory: TaskDirectoryStore.get('directory'),
      taskDirectoryErrorCount: 0
    });
  }

  hasLoadingError() {
    return this.state.taskDirectoryErrorCount >= 3;
  }

  getErrorScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center inverse">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  handleOpenLogClick(selectedLogFile) {
    this.setState({selectedLogFile, currentTab: 'debug'});
  }

  getResources(task) {
    if (task.resources == null) {
      return null;
    }

    let resources = Object.keys(task.resources);

    return resources.map(function (resource) {
      if (resource === 'ports') {
        return null;
      }

      let colorIndex = ResourceTypes[resource].colorIndex;
      let resourceLabel = ResourceTypes[resource].label;
      let resourceIconClasses = `icon icon-sprite icon-sprite-medium
        icon-sprite-medium-color icon-resources-${resourceLabel.toLowerCase()}`;
      let resourceValue = Units.formatResource(
        resource, task.resources[resource]
      );
      return (
        <div key={resource} className="
          side-panel-resource-container
          flex-box-align-vertical-center
          container-pod
          container-pod-super-short
          flush-top">
          <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
            <div className="media-object media-object-align-middle">
              <div className="media-object-item">
                <i className={resourceIconClasses}></i>
              </div>
              <div className="media-object-item">
                <h4 className="flush-top flush-bottom text-color-neutral">
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

  getBasicInfo(task, node) {
    // Hide when no task or when we are viewing debug tab
    if (task == null || this.state.currentTab === 'debug') {
      return null;
    }

    let statusIcon = TaskUtil.getTaskStatusIcon(task);
    let statusClassName = `${TaskUtil.getTaskStatusClassName(task)} side-panel-subheader`;

    return (
      <div>
        <div className="side-panel-content-header container-fluid container-pod flush-top flush-bottom">
          <h1 className="side-panel-content-header-label flush">
            {task.name}
          </h1>
          <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
            <div className="media-object media-object-align-middle">
              <div className="media-object-item">
                {statusIcon}
              </div>

              <div className="media-object-item">
                <span className={statusClassName}>
                  {TaskStates[task.state].displayName}
                </span>
              </div>

              <div className="media-object-item">
                <span className="side-panel-subheader side-panel-subheader-emphasize">
                  {node.hostname}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="container container-pod container-pod-short container-fluid flush">
          {this.getResources(task)}
        </div>
      </div>
    );
  }

  renderDetailsTabView() {
    let task = MesosStateStore.getTaskFromTaskID(this.props.itemID);

    if (task == null || !MesosSummaryStore.get('statesProcessed')) {
      return null;
    }

    let node = MesosStateStore.getNodeFromID(task.slave_id);
    let services = MesosSummaryStore.get('states')
      .lastSuccessful()
      .getServiceList();
    let service = services.filter({ids: [task.framework_id]}).last();

    let headerValueMapping = {
      ID: task.id,
      Service: `${service.name} (${service.id})`,
      Node: `${node.hostname} (${node.id})`
    };

    let sandBoxPath = TaskDirectoryStore.get('sandBoxPath');
    if (sandBoxPath) {
      headerValueMapping['Sandbox Path'] = sandBoxPath;
    }

    let labelMapping = {};

    if (task.labels) {
      task.labels.forEach(function (label) {
        labelMapping[label.key] = label.value;
      });
    }

    return (
      <div className="container-fluid container-pod container-pod-short flush-top">
        <DescriptionList
          className="container container-fluid container-pod container-pod-short flush-bottom"
          hash={headerValueMapping}
          headline="Configuration" />
        <DescriptionList
          className="container container-fluid container-pod container-pod-short flush-bottom"
          hash={labelMapping}
          headline="Labels" />
      </div>
    );
  }

  renderFilesTabView() {
    let {state, props} = this;
    let task = MesosStateStore.getTaskFromTaskID(props.itemID);
    if (this.hasLoadingError()) {
      this.getErrorScreen();
    }
    if (!state.directory || !task) {
      return this.getLoadingScreen();
    }

    return (
      <div className="container container-fluid container-pod container-pod-short flex-container-col flex-grow">
        <TaskDirectoryView
          directory={state.directory}
          task={task}
          onOpenLogClick={this.handleOpenLogClick.bind(this)} />
      </div>
    );
  }

  renderLogViewerTabView() {
    let {state, props} = this;
    let task = MesosStateStore.getTaskFromTaskID(props.itemID);
    if (this.hasLoadingError()) {
      this.getErrorScreen();
    }
    if (!state.directory || !task) {
      return this.getLoadingScreen();
    }

    return (
      <div className="container container-fluid container-pod container-pod-short flex-container-col flex-grow flex-shrink">
        <TaskDebugView
          selectedLogFile={state.selectedLogFile}
          showExpandButton={this.showExpandButton}
          directory={state.directory}
          task={task} />
      </div>
    );
  }

  tabs_handleTabClick() {
    this.setState({selectedLogFile: null});

    // Only call super after we are done removing/adding listeners
    super.tabs_handleTabClick(...arguments);
  }

  render() {
    if (MesosStateStore.get('lastMesosState').slaves == null) {
      return null;
    }

    let task = MesosStateStore.getTaskFromTaskID(this.props.itemID);

    if (task == null) {
      return this.getNotFound('task');
    }

    let node = MesosStateStore.getNodeFromID(task.slave_id);
    let panelClasses = classNames({
      'side-panel-section side-panel-content-header container container-pod container-fluid container-pod-divider-bottom container-pod-divider-bottom-align-right flush-bottom': true,
      'container-pod-short': this.state.currentTab === 'debug'
    });

    return (
      <div className="flex-container-col">
        {this.getExpandButton()}
        <div className={panelClasses}>
          {this.getBasicInfo(task, node)}
          <ul className="tabs list-inline container container-fluid container-pod
            flush flush-bottom flush-top">
            {this.tabs_getUnroutedTabs()}
          </ul>
        </div>
        {this.tabs_getTabView()}
      </div>
    );
  }
}

module.exports = TaskSidePanelContents;
