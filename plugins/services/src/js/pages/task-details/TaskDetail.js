import {DCOSStore} from 'foundation-ui';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
import {routerShape, formatPattern} from 'react-router';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../../../../../src/js/components/Breadcrumbs';
import DetailViewHeader from '../../../../../../src/js/components/DetailViewHeader';
import InternalStorageMixin from '../../../../../../src/js/mixins/InternalStorageMixin';
import Loader from '../../../../../../src/js/components/Loader';
import ManualBreadcrumbs from '../../../../../../src/js/components/ManualBreadcrumbs';
import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import RequestErrorMsg from '../../../../../../src/js/components/RequestErrorMsg';
import RouterUtil from '../../../../../../src/js/utils/RouterUtil';
import StatusMapping from '../../constants/StatusMapping';
import TabsMixin from '../../../../../../src/js/mixins/TabsMixin';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';
import TaskStates from '../../constants/TaskStates';

const METHODS_TO_BIND = [
  'handleBreadcrumbClick',
  'onTaskDirectoryStoreError',
  'onTaskDirectoryStoreSuccess'
];

const HIDE_BREADCRUMBS = [
  '/jobs/:id/tasks/:taskID/details',
  '/network/virtual-networks/:overlayName/tasks/:taskID/details',
  '/nodes/:nodeID/tasks/:taskID/details',
  '/services/overview/:id/tasks/:taskID/details'
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

    let {routes} = this.props;

    // TODO: DCOS-7871 Refactor the TabsMixin to generalize this solution:
    let topRouteIndex = routes.findIndex(function ({component}) {
      return component === TaskDetail;
    });
    let topRoute = routes[topRouteIndex];

    let parentRoutes = routes.slice(0, topRouteIndex + 1);
    let parentPath = RouterUtil.reconstructPathFromRoutes(parentRoutes);

    if (topRoute != null) {
      this.tabs_tabs = topRoute.childRoutes.filter(function ({isTab}) {
        return !!isTab;
      }).reduce(function (tabs, {path, title}) {
        let key = parentPath;
        if (path) {
          key = `${parentPath}/${path}`;
        }

        tabs[key] = title || path;

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

    this.updateCurrentTab(nextProps);
  }

  updateCurrentTab(nextProps) {
    let {routes} = nextProps || this.props;
    let currentTab = RouterUtil.reconstructPathFromRoutes(routes);
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
    let {params, routes} = this.props;
    let task = MesosStateStore.getTaskFromTaskID(params.taskID);
    TaskDirectoryStore.setPath(task, path);
    // Transition to parent route, which uses a default route
    let parentPath = RouterUtil.reconstructPathFromRoutes(routes);
    router.push(formatPattern(parentPath, params));
  }

  getErrorScreen() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
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
    let routes = this.props.routes;
    let params = Object.assign(
      {},
      this.props.params,
      {
        filePath: encodeURIComponent(selectedLogFile.get('path')),
        innerPath: encodeURIComponent(TaskDirectoryStore.get('innerPath'))
      }
    );
    let {fileViewerRoutePath} = routes[routes.length - 1];
    router.push(formatPattern(fileViewerRoutePath, params));
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
        if (tab.key === '/nodes/:nodeID/tasks/:taskID/volumes(/:volumeID)'
          || tab.key === '/services/overview/:id/tasks/:taskID/volumes') {
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
    let path = RouterUtil.reconstructPathFromRoutes(this.props.routes);
    if (HIDE_BREADCRUMBS.includes(path)) {
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
        <div className="flex flex-item-shrink-0 control-group">
          {this.getBreadcrumbs()}
        </div>
        {this.props.children && React.cloneElement(this.props.children, {
          directory,
          selectedLogFile,
          task,
          onOpenLogClick: this.handleOpenLogClick.bind(this),
          service: this.getService()
        })}
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
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        {this.getBasicInfo()}
        {this.getSubView()}
      </div>
    );
  }
}

TaskDetail.contextTypes = {
  router: routerShape
};

TaskDetail.propTypes = {
  params: React.PropTypes.object,
  routes: React.PropTypes.array
};

module.exports = TaskDetail;
