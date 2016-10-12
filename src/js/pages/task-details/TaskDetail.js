import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import DCOSStore from '../../stores/DCOSStore';
import DetailViewHeader from '../../components/DetailViewHeader';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import Loader from '../../components/Loader';
import ManualBreadcrumbs from '../../components/ManualBreadcrumbs';
import MesosStateStore from '../../stores/MesosStateStore';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import StatusMapping from '../../constants/StatusMapping';
import TabsMixin from '../../mixins/TabsMixin';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';
import TaskStates from '../../constants/TaskStates';

const METHODS_TO_BIND = [
  'handleBreadcrumbClick',
  'onTaskDirectoryStoreError',
  'onTaskDirectoryStoreSuccess'
];

const HIDE_BREADCRUMBS = [
  'services-task-details-tab'
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
    let {innerPath, taskID} = this.props.params;
    if (nextProps.params.innerPath !== innerPath ||
      nextProps.params.taskID !== taskID) {
      this.setState({directory: null});
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

  handleBreadcrumbClick(path) {
    let {router} = this.context;
    let {params} = this.props;
    let task = MesosStateStore.getTaskFromTaskID(params.taskID);
    TaskDirectoryStore.setPath(task, path);
    // Transition to parent route, which uses a default route
    let currentRoutes = router.getCurrentRoutes();
    let {name} = currentRoutes[currentRoutes.length - 2];
    router.transitionTo(name, params);
  }

  getErrorScreen() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="pod">
        <Loader />
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
    let {router} = this.context;
    let params = Object.assign(
      {},
      this.props.params,
      {
        filePath: encodeURIComponent(selectedLogFile.get('path')),
        innerPath: encodeURIComponent(TaskDirectoryStore.get('innerPath'))
      }
    );
    let currentRoutes = router.getCurrentRoutes();
    let {fileViewerRouteName} = currentRoutes[currentRoutes.length - 1];
    router.transitionTo(fileViewerRouteName, params);
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
      <ul className="menu-tabbed">
        {tabsArray}
      </ul>
    );

    let taskState = task.get('state');
    let serviceStatus = TaskStates[taskState].displayName;
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';

    return (
      <DetailViewHeader
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
      <div className="pod flush-right flush-left text-align-center">
        <h3 className="flush-top text-align-center">
          {`Error finding ${item}`}
        </h3>
        <p className="flush">
          {`Did not find a ${item} with id "${itemID}"`}
        </p>
      </div>
    );
  }

  getBreadcrumbs() {
    let routes = this.context.router.getCurrentRoutes();
    let {name} = routes[routes.length - 1];
    if (HIDE_BREADCRUMBS.includes(name)) {
      return null;
    }

    let innerPath = TaskDirectoryStore.get('innerPath').split('/');
    let onClickPath = '';
    let crumbs = innerPath.map((directoryItem, index) => {
      let textValue = directoryItem;

      // First breadcrumb is always 'Working Directory'.
      if (index === 0) {
        textValue = 'Working Directory';
      } else {
        onClickPath += `/${directoryItem}`;
      }

      return {
        className: 'clickable',
        label: textValue,
        onClick: this.handleBreadcrumbClick.bind(this, onClickPath)
      };
    });

    return (
      <ManualBreadcrumbs crumbs={crumbs} />
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
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        <div className="flex control-group">
          {this.getBreadcrumbs()}
        </div>
        <RouteHandler
          directory={directory}
          onOpenLogClick={this.handleOpenLogClick.bind(this)}
          selectedLogFile={selectedLogFile}
          service={this.getService()}
          task={task} />
      </div>
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
      <div>
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
