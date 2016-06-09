import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import DescriptionList from './DescriptionList';
import MarathonStore from '../stores/MarathonStore';
import MarathonTaskDetailsList from './MarathonTaskDetailsList';
import MesosStateStore from '../stores/MesosStateStore';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import PageHeader from './PageHeader';
import RequestErrorMsg from './RequestErrorMsg';
import ResourcesUtil from '../utils/ResourcesUtil';
import ServicesBreadcrumb from './ServicesBreadcrumb';
import TaskDebugView from './TaskDebugView';
import TaskDirectoryView from './TaskDirectoryView';
import TaskDirectoryStore from '../stores/TaskDirectoryStore';
import TaskStates from '../constants/TaskStates';
import Units from '../utils/Units';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import TabsMixin from '../mixins/TabsMixin';

const TABS = {
  details: 'Details',
  files: 'Files',
  debug: 'Logs'
};

const METHODS_TO_BIND = [
  'onTaskDirectoryStoreError',
  'onTaskDirectoryStoreSuccess'
];

class TaskDetail extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = Object.assign({}, TABS);

    this.state = {
      currentTab: 'details',
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
    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
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

    let resourceColors = ResourcesUtil.getResourceColors();
    let resourceLabels = ResourcesUtil.getResourceLabels();

    return ResourcesUtil.getDefaultResources().map(function (resource) {
      if (resource === 'ports') {
        return null;
      }

      let colorIndex = resourceColors[resource];
      let resourceLabel = resourceLabels[resource];
      let resourceIconClasses = `icon icon-sprite icon-sprite-medium
        icon-sprite-medium-color icon-resources-${resourceLabel.toLowerCase()}`;
      let resourceValue = Units.formatResource(
        resource, task.resources[resource]
      );
      return (
        <div key={resource} className="media-object-item">
          <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
            <div className="media-object media-object-align-middle">
              <div className="media-object-item">
                <i className={resourceIconClasses}></i>
              </div>
              <div className="media-object-item">
                <h4 className="flush-top flush-bottom inverse">
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

  getBasicInfo(task) {
    if (task == null) {
      return null;
    }

    let taskIcon = (
      <img src={task.getImages()['icon-large']} />
    );

    let tabs = (
      <ul className="tabs list-inline flush-bottom container-pod
        container-pod-short-top inverse">
        {this.tabs_getUnroutedTabs()}
      </ul>
    );

    const mediaWrapperClassNames = {
      'media-object-spacing-narrow': false,
      'media-object-offset': false
    };

    return (
      <PageHeader
        icon={taskIcon}
        subTitle={TaskStates[task.state].displayName}
        navigationTabs={tabs}
        mediaWrapperClassName={mediaWrapperClassNames}
        title={task.getId()} />
    );
  }

  getMesosTaskDetailsDescriptionList(mesosTask) {
    if (mesosTask == null || !MesosSummaryStore.get('statesProcessed')) {
      return null;
    }

    let services = MesosSummaryStore.get('states')
      .lastSuccessful()
      .getServiceList();
    let service = services.filter({ids: [mesosTask.framework_id]}).last();

    let headerValueMapping = {
      'ID': mesosTask.id,
      'Service': `${service.name} (${service.id})`
    };

    let node = MesosStateStore.getNodeFromID(mesosTask.slave_id);

    if (node != null) {
      headerValueMapping['Node'] = `${node.hostname} (${node.id})`;
    }

    let sandBoxPath = TaskDirectoryStore.get('sandBoxPath');
    if (sandBoxPath) {
      headerValueMapping['Sandbox Path'] = sandBoxPath;
    }

    return (
      <DescriptionList
        className="container container-fluid flush container-pod container-pod-super-short flush-top"
        hash={headerValueMapping}
        headline="Configuration" />
    )
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

  renderDetailsTabView() {
    const {taskID} = this.props.params;

    const mesosTask =
      MesosStateStore.getTaskFromTaskID(taskID);

    return (
      <div className="container container-fluid flush">
        <div className="media-object-spacing-wrapper container-pod container-pod-super-short flush-top flush-bottom">
          <div className="media-object">
            {this.getResources(mesosTask)}
          </div>
        </div>
        {this.getMesosTaskDetailsDescriptionList(mesosTask)}
        {this.getMesosTaskLabelDescriptionList(mesosTask)}
        <MarathonTaskDetailsList taskID={taskID} />
      </div>
    );
  }

  renderFilesTabView() {
    let {state, props} = this;
    let task = MesosStateStore.getTaskFromTaskID(props.params.taskID);
    if (this.hasLoadingError()) {
      this.getErrorScreen();
    }
    if (!state.directory || !task) {
      return this.getLoadingScreen();
    }

    return (
      <TaskDirectoryView
        directory={state.directory}
        task={task}
        onOpenLogClick={this.handleOpenLogClick.bind(this)} />
    );
  }

  renderLogsTabView() {
    let {state, props} = this;
    let task = MesosStateStore.getTaskFromTaskID(props.params.taskID);

    if (this.hasLoadingError()) {
      this.getErrorScreen();
    }

    if (!state.directory || !task) {
      return this.getLoadingScreen();
    }

    return (
      <TaskDebugView
        logViewClassName="inverse"
        selectedLogFile={state.selectedLogFile}
        showExpandButton={this.showExpandButton}
        directory={state.directory}
        task={task} />
    );
  }

  tabs_handleTabClick() {
    this.setState({selectedLogFile: null});

    // Only call super after we are done removing/adding listeners
    super.tabs_handleTabClick(...arguments);
  }

  getNotFound(item, itemID) {
    return (
      <div className="container container-fluid container-pod text-align-center">
        <h3 className="flush-top text-align-center">
          {`Error finding ${item}`}
        </h3>
        <p className="flush">
          {`Did not find a ${item} with id "${itemID}"`}
        </p>
      </div>
    );
  }

  getServicesBreadcrumb() {
    let {id, taskID} = this.props.params;

    if (id == null) {
      return null;
    }

    let service = MarathonStore.getServiceFromTaskID(taskID);

    if (service == null) {
      return null;
    }

    return (<ServicesBreadcrumb serviceTreeItem={service} taskID={taskID} />);
  }

  render() {
    if (MesosStateStore.get('lastMesosState').slaves == null) {
      return null;
    }

    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);

    if (task == null) {
      return this.getNotFound('task', this.props.params.taskID);
    }

    let node = MesosStateStore.getNodeFromID(task.slave_id);

    return (
      <div className="flex-container-col">
        <div className="container-pod
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow">
          {this.getServicesBreadcrumb()}
          {this.getBasicInfo(task, node)}
          {this.tabs_getTabView()}
        </div>
      </div>
    );
  }
}

TaskDetail.propTypes = {
  params: React.PropTypes.object
};

module.exports = TaskDetail;
