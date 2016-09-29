import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import DCOSStore from '../../stores/DCOSStore';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import Loader from '../../components/Loader';
import MesosStateStore from '../../stores/MesosStateStore';
import PageHeader from '../../components/PageHeader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import StatusMapping from '../../constants/StatusMapping';
import TabsMixin from '../../mixins/TabsMixin';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';
import TaskStates from '../../constants/TaskStates';

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
      expandClass: 'large',
      selectedLogFile: null,
      taskDirectoryErrorCount: 0
    };

    this.store_listeners = [
      {name: 'marathon', events: ['appsSuccess'], listenAlways: false},
      {name: 'state', events: ['success'], listenAlways: false},
      {name: 'summary', events: ['success'], listenAlways: false},
      {
        name: 'taskDirectory',
        events: ['error', 'success'],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    // TODO: DCOS-7871 Refactor the TabsMixin to generalize this solution:
    let routes = this.context.router.getCurrentRoutes();
    let currentRoute = routes.find(function (route) {
      return route.handler === TaskDetail;
    });

    if (currentRoute != null) {
      this.tabs_tabs = currentRoute.children.reduce(function (tabs, {name, title}) {
        if (name !== null) {
          tabs[name] = title || name;
        }

        return tabs;
      }, this.tabs_tabs);

      this.updateCurrentTab();
    }
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);

    let {taskID} = this.props.params;
    if (nextProps.params.taskID !== taskID) {
      this.setState({directory: null});
    }
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
    this.handleFetchDirectory();
  }

  onTaskDirectoryStoreError() {
    this.setState({
      taskDirectoryErrorCount: this.state.taskDirectoryErrorCount + 1
    });
  }

  onTaskDirectoryStoreSuccess(taskID) {
    if (this.props.params.taskID !== taskID) {
      this.handleFetchDirectory();
      return;
    }

    let directory = TaskDirectoryStore.get('directory');
    this.setState({directory, taskDirectoryErrorCount: 0});
  }

  handleFetchDirectory() {
    let {params} = this.props;
    let task = MesosStateStore.getTaskFromTaskID(params.taskID);
    // Declare undefined to not override default values in fetchDirectory
    let innerPath;

    if (params.innerPath != null) {
      innerPath = decodeURIComponent(params.innerPath);
    }

    TaskDirectoryStore.fetchDirectory(task, innerPath);
    this.setState({directory: null});
  }

  getErrorScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod">
        <Loader className="inverse" />
      </div>
    );
  }

  getService() {
    let {params, service = null} = this.props;

    // Get the service from the taskID if it wasn't explicitly passed.
    if (!!params.taskID && service === null) {
      service = DCOSStore.serviceTree.getServiceFromTaskID(params.taskID);
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
    let params = Object.assign(
      {},
      this.props.params,
      {
        filePath: encodeURIComponent(selectedLogFile.get('path')),
        innerPath: encodeURIComponent(TaskDirectoryStore.get('innerPath'))
      }
    );
    let currentRoutes = this.context.router.getCurrentRoutes();
    let {logRouteName} = currentRoutes[currentRoutes.length - 1];
    this.context.router.transitionTo(logRouteName, params);
  }

  getBasicInfo() {
    let {selectedLogFile} = this.state;
    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);

    if (task == null) {
      return null;
    }

    let service = this.getService();
    let taskIcon = (
      <img src={task.getImages()['icon-large']} />
    );
    let filePath = (selectedLogFile && selectedLogFile.get('path')) || null;
    let params = Object.assign(
      {filePath},
      this.props.params
    );
    let tabsArray = this.tabs_getRoutedTabs({params}) || [];

    if (!this.hasVolumes(service)) {
      tabsArray = tabsArray.filter(function (tab) {
        if (tab.key === 'nodes-task-details-volumes'
          || tab.key === 'services-task-details-volumes') {
          return false;
        }

        return true;
      });
    }

    let navigationTabs = (
      <ul className="menu-tabbed container-pod container-pod-short-top">
        {tabsArray}
      </ul>
    );

    let taskState = task.get('state');
    let serviceStatus = TaskStates[taskState].displayName;
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';

    return (
      <PageHeader
        icon={taskIcon}
        iconClassName="icon-app-container  icon-image-container"
        subTitle={serviceStatus}
        subTitleClassName={serviceStatusClassSet}
        navigationTabs={navigationTabs}
        title={task.getName()} />
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

  getSubView() {
    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
    let {directory, selectedLogFile} = this.state;
    if (this.hasLoadingError()) {
      return this.getErrorScreen();
    }

    if (!directory || !task) {
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

  render() {
    if (MesosStateStore.get('lastMesosState').slaves == null) {
      return null;
    }

    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);

    if (task == null) {
      return this.getNotFound('task', this.props.params.taskID);
    }

    return (
      <div className="flex-container-col flex-grow flex-shrink container-pod container-pod-divider-bottom-align-right container-pod-short-top flush-bottom flush-top">
        <Breadcrumbs />
        {this.getBasicInfo()}
        {this.getSubView()}
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
