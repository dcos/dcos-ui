import { DCOSStore } from "foundation-ui";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
import { routerShape, formatPattern } from "react-router";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import DetailViewHeader
  from "../../../../../../src/js/components/DetailViewHeader";
import InternalStorageMixin
  from "../../../../../../src/js/mixins/InternalStorageMixin";
import Loader from "../../../../../../src/js/components/Loader";
import ManualBreadcrumbs
  from "../../../../../../src/js/components/ManualBreadcrumbs";
import MesosStateStore from "../../../../../../src/js/stores/MesosStateStore";
import RequestErrorMsg
  from "../../../../../../src/js/components/RequestErrorMsg";
import RouterUtil from "../../../../../../src/js/utils/RouterUtil";
import StatusMapping from "../../constants/StatusMapping";
import TabsMixin from "../../../../../../src/js/mixins/TabsMixin";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";
import TaskStates from "../../constants/TaskStates";

const METHODS_TO_BIND = [
  "handleBreadcrumbClick",
  "handleOpenLogClick",
  "onTaskDirectoryStoreError",
  "onTaskDirectoryStoreSuccess"
];

// TODO remove
const HIDE_BREADCRUMBS = [
  "/jobs/:id/tasks/:taskID/details",
  "/jobs/:id/tasks/:taskID/logs",
  "/jobs/:id/tasks/:taskID/logs/:filePath",
  "/jobs/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",

  "/networking/networks/:overlayName/tasks/:taskID/details",
  "/networking/networks/:overlayName/tasks/:taskID/logs",
  "/networking/networks/:overlayName/tasks/:taskID/logs/:filePath",
  "/networking/networks/:overlayName/tasks/:taskID/files/view(/:filePath(/:innerPath))",

  "/nodes/:nodeID/tasks/:taskID/details",
  "/nodes/:nodeID/tasks/:taskID/logs",
  "/nodes/:nodeID/tasks/:taskID/logs/:filePath",
  "/nodes/:nodeID/tasks/:taskID/files/view(/:filePath(/:innerPath))",

  "/services/overview/:id/tasks/:taskID/details",
  "/services/overview/:id/tasks/:taskID/logs",
  "/services/overview/:id/tasks/:taskID/logs/:filePath",
  "/services/overview/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))"
];

class TaskDetail extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {};

    this.state = {
      directory: null,
      expandClass: "large",
      selectedLogFile: null,
      taskDirectoryErrorCount: 0
    };

    this.store_listeners = [
      { name: "marathon", events: ["appsSuccess"], listenAlways: false },
      { name: "state", events: ["success"], listenAlways: false },
      { name: "summary", events: ["success"], listenAlways: false },
      {
        name: "taskDirectory",
        events: ["error", "success", "nodeStateError", "nodeStateSuccess"],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.onTaskDirectoryStoreNodeStateError = this.onTaskDirectoryStoreError;
    this.onTaskDirectoryStoreNodeStateSuccess = this.onTaskDirectoryStoreSuccess;
  }

  componentWillMount() {
    super.componentWillMount(...arguments);

    const { routes } = this.props;

    // TODO: DCOS-7871 Refactor the TabsMixin to generalize this solution:
    const topRouteIndex = routes.findIndex(function({ component }) {
      return component === TaskDetail;
    });
    const topRoute = routes[topRouteIndex];

    const parentRoutes = routes.slice(0, topRouteIndex + 1);
    const parentPath = RouterUtil.reconstructPathFromRoutes(parentRoutes);

    if (topRoute != null) {
      this.tabs_tabs = topRoute.childRoutes
        .filter(function({ isTab }) {
          return !!isTab;
        })
        .reduce(function(tabs, { path, title }) {
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
    const { innerPath, taskID } = this.props.params;
    if (
      nextProps.params.innerPath !== innerPath ||
      nextProps.params.taskID !== taskID
    ) {
      this.setState({ directory: null });
    }

    this.updateCurrentTab(nextProps);
  }

  updateCurrentTab(nextProps) {
    const { routes } = nextProps || this.props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({ currentTab });
    }
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.store_removeEventListenerForStoreID("summary", "success");
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

    const directory = TaskDirectoryStore.get("directory");
    this.setState({ directory, taskDirectoryErrorCount: 0 });
  }

  handleFetchDirectory() {
    const { params } = this.props;
    const task = MesosStateStore.getTaskFromTaskID(params.taskID);
    // Declare undefined to not override default values in fetchDirectory
    let innerPath;

    if (params.innerPath != null) {
      innerPath = decodeURIComponent(params.innerPath);
    }

    TaskDirectoryStore.fetchDirectory(task, innerPath);
    this.setState({ directory: null });
  }

  handleBreadcrumbClick(path) {
    const { router } = this.context;
    const { params, routes } = this.props;
    const task = MesosStateStore.getTaskFromTaskID(params.taskID);
    TaskDirectoryStore.setPath(task, path);
    // Transition to parent route, which uses a default route
    const parentPath = RouterUtil.reconstructPathFromRoutes(routes);
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

  hasVolumes(service) {
    return !!service && service.getVolumes().getItems().length > 0;
  }

  hasLoadingError() {
    return this.state.taskDirectoryErrorCount >= 3;
  }

  handleOpenLogClick(selectedLogFile) {
    const { router } = this.context;
    const routes = this.props.routes;
    const params = Object.assign({}, this.props.params, {
      filePath: encodeURIComponent(selectedLogFile.get("path")),
      innerPath: encodeURIComponent(TaskDirectoryStore.get("innerPath"))
    });
    const { fileViewerRoutePath } = routes[routes.length - 1];
    router.push(formatPattern(fileViewerRoutePath, params));
  }

  getBasicInfo() {
    const { selectedLogFile } = this.state;
    const task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);

    if (task == null) {
      return null;
    }

    const service = DCOSStore.serviceTree.findItemById(task.getServiceId());
    const taskIcon = <img src={task.getImages()["icon-large"]} />;
    const filePath = (selectedLogFile && selectedLogFile.get("path")) || null;
    const params = Object.assign({ filePath }, this.props.params);

    let tabsArray = this.tabs_getRoutedTabs({ params }) || [];

    if (!this.hasVolumes(service)) {
      tabsArray = tabsArray.filter(function(tab) {
        if (
          tab.key === "/nodes/:nodeID/tasks/:taskID/volumes(/:volumeID)" ||
          tab.key === "/services/overview/:id/tasks/:taskID/volumes"
        ) {
          return false;
        }

        return true;
      });
    }

    const navigationTabs = (
      <ul className="menu-tabbed">
        {tabsArray}
      </ul>
    );

    const taskState = task.get("state");
    const serviceStatus = TaskStates[taskState].displayName;
    const serviceStatusClassSet = StatusMapping[serviceStatus] || "";

    return (
      <DetailViewHeader
        icon={taskIcon}
        iconClassName="icon-app-container  icon-image-container"
        subTitle={serviceStatus}
        subTitleClassName={serviceStatusClassSet}
        navigationTabs={navigationTabs}
        title={task.getName()}
      />
    );
  }

  tabs_handleTabClick() {
    this.setState({ selectedLogFile: null });

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
    const path = RouterUtil.reconstructPathFromRoutes(this.props.routes);
    if (HIDE_BREADCRUMBS.includes(path)) {
      return null;
    }

    const innerPath = TaskDirectoryStore.get("innerPath").split("/");
    let onClickPath = "";
    const crumbs = innerPath.map((directoryItem, index) => {
      let textValue = directoryItem;

      // First breadcrumb is always 'Working Directory'.
      if (index === 0) {
        textValue = "Working Directory";
      } else {
        onClickPath += `/${directoryItem}`;
      }

      return {
        className: "clickable",
        label: textValue,
        onClick: this.handleBreadcrumbClick.bind(this, onClickPath)
      };
    });

    return <ManualBreadcrumbs crumbs={crumbs} />;
  }

  getSubView() {
    const task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
    const service = DCOSStore.serviceTree.findItemById(task.getServiceId());
    const { directory, selectedLogFile } = this.state;
    if (this.hasLoadingError()) {
      return this.getErrorScreen();
    }

    if (!directory || !task) {
      return this.getLoadingScreen();
    }

    return (
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        {this.props.children &&
          React.cloneElement(this.props.children, {
            directory,
            selectedLogFile,
            task,
            onOpenLogClick: this.handleOpenLogClick,
            service
          })}
      </div>
    );
  }

  render() {
    if (MesosStateStore.get("lastMesosState").slaves == null) {
      return null;
    }

    return (
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        <div className="flex flex-item-shrink-0 control-group">
          {this.getBreadcrumbs()}
        </div>
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
