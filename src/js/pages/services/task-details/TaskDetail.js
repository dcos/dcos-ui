import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../../components/Breadcrumbs';
import MarathonStore from '../../../stores/MarathonStore';
import MesosStateStore from '../../../stores/MesosStateStore';
import PageHeader from '../../../components/PageHeader';
import RequestErrorMsg from '../../../components/RequestErrorMsg';
import TaskDirectoryStore from '../../../stores/TaskDirectoryStore';
import TaskStates from '../../../constants/TaskStates';
import InternalStorageMixin from '../../../mixins/InternalStorageMixin';
import TabsMixin from '../../../mixins/TabsMixin';

const NODES_TABS = {
  'nodes-task-details-tab': 'Details',
  'nodes-task-details-files': 'Files',
  'nodes-task-details-logs': 'Logs',
  'nodes-task-details-volumes': 'Volumes'
};

const SERVICES_TABS = {
  'services-task-details-tab': 'Details',
  'services-task-details-files': 'Files',
  'services-task-details-logs': 'Logs',
  'services-task-details-volumes': 'Volumes'
};

const METHODS_TO_BIND = [
  'onTaskDirectoryStoreError',
  'onTaskDirectoryStoreSuccess'
];

class TaskDetail extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {};

    this.state = {
      directory: null,
      selectedLogFile: null,
      errorCount: 0
    };

    this.store_listeners = [
      {name: 'marathon', events: ['appsSuccess'], listenAlways: false},
      {name: 'state', events: ['success'], listenAlways: false},
      {name: 'summary', events: ['success'], listenAlways: false},
      {name: 'taskDirectory', events: ['error', 'success']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);
    this.tabs_tabs = Object.assign({}, SERVICES_TABS);
    if (this.props.params.nodeID != null) {
      this.tabs_tabs = Object.assign({}, NODES_TABS);
    }
    this.updateCurrentTab();
  }

  updateCurrentTab() {
    let routes = this.context.router.getCurrentRoutes();
    let currentTab = routes[routes.length - 1].name;
    if (currentTab != null) {
      this.setState({currentTab});
    }
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
      errorCount: this.state.errorCount + 1
    });
  }

  onTaskDirectoryStoreSuccess() {
    this.setState({
      directory: TaskDirectoryStore.get('directory'),
      errorCount: 0
    });
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

  getService() {
    let {params, service = null} = this.props;

    // Get the service from the taskID if it wasn't explicitly passed.
    if (!!params.taskID && service === null) {
      service = MarathonStore.getServiceFromTaskID(params.taskID);
    }

    return service;
  }

  hasVolumes(service) {
    return !!service && service.getVolumes().getItems().length > 0;
  }

  hasLoadingError() {
    return this.state.taskDirectoryErrorCount >= 3;
  }

  handleOpenLogClick(selectedLogFile) {
    this.setState({selectedLogFile, currentTab: 'debug'});
  }

  tabs_handleTabClick() {
    this.setState({selectedLogFile: null});

    // Only call super after we are done removing/adding listeners
    super.tabs_handleTabClick(...arguments);
  }

  getNotFound() {
    return (
      <div className="container container-fluid container-pod text-align-center">
        <h3 className="flush-top text-align-center">
          Error finding task
        </h3>
        <p className="flush">
          {`Did not find a task with ID "${this.props.params.taskID}"`}
        </p>
      </div>
    );
  }

  getSubView(task) {
    let {directory, selectedLogFile} = this.state;

    if (this.hasLoadingError()) {
      this.getErrorScreen();
    }

    if (!this.isSubviewReady) {
      return this.getLoadingScreen();
    }

    return (
      <RouteHandler
        directory={directory}
        onOpenLogClick={this.handleOpenLogClick.bind(this)}
        selectedLogFile={selectedLogFile}
        service={this.getService()}
        task={task} />
    );
  }

  getConfirmModal() {
    return null;
  }

  getTask() {
    return MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
  };

  getTaskActionButtons() {
    return [];
  }

  getTaskIcon(task) {
    return <img src={task.getImages()['icon-large']} />;
  }

  getTaskName(task) {
    return task.getName();
  }

  getTaskSubtitle(task) {
    return TaskStates[task.state].displayName;
  }

  getTaskTabs() {
    return (
      <ul className="tabs list-inline flush-bottom container-pod container-pod-short-top inverse">
        {this.tabs_getRoutedTabs({params: this.props.params})}
      </ul>
    );
  }

  isPageReady() {
    return MesosStateStore.get('lastMesosState').slaves != null;
  }

  isSubviewReady(task) {
    return this.state.directory && task;
  }

  render() {
    if (!this.isPageReady()) {
      return null;
    }

    let task = this.getTask();

    if (task == null) {
      return this.getNotFound();
    }

    return (
      <div className="flex-container-col flex-grow flex-shrink container-pod container-pod-divider-bottom-align-right container-pod-short-top flush-bottom flush-top">
        <Breadcrumbs />
        <PageHeader
          actionButtons={this.getTaskActionButtons()}
          icon={this.getTaskIcon(task)}
          iconClassName="icon-app-container"
          subTitle={this.getTaskSubtitle(task)}
          navigationTabs={this.getTaskTabs()}
          title={this.getTaskName(task)} />
        {this.getSubView(task)}
        {this.getConfirmModal()}
      </div>
    );
  }
}

TaskDetail.contextTypes = {
  router: React.PropTypes.func
};

TaskDetail.propTypes = {
  params: React.PropTypes.object
};

module.exports = TaskDetail;
