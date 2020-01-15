import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { routerShape, formatPattern } from "react-router";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import Loader from "#SRC/js/components/Loader";
import ManualBreadcrumbs from "#SRC/js/components/ManualBreadcrumbs";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import TaskDirectoryStore from "../../stores/TaskDirectoryStore";

class TaskDetail extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.state = {
      directory: null,
      expandClass: "large",
      selectedLogFile: null,
      taskDirectoryErrorCount: 0
    };

    // prettier-ignore
    this.store_listeners = [
      { name: "marathon", events: ["appsSuccess"], unmountWhen: (store, event) => event !== "appsSuccess" || store.hasProcessedApps() },
      { name: "state", events: ["success"], unmountWhen: (store, event) => (event === "success") && Object.keys(store.get("lastMesosState")).length },
      { name: "summary", events: ["success"], unmountWhen: (store, event) => event === "success" && store.get("statesProcessed") },
      { name: "taskDirectory", events: ["error", "success", "nodeStateError", "nodeStateSuccess"], suppressUpdate: true }
    ];

    this.onTaskDirectoryStoreNodeStateError = this.onTaskDirectoryStoreError;
    this.onTaskDirectoryStoreNodeStateSuccess = this.onTaskDirectoryStoreSuccess;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { innerPath, taskID } = this.props.params;
    if (
      nextProps.params.innerPath !== innerPath ||
      nextProps.params.taskID !== taskID
    ) {
      this.setState({ directory: null });
    }
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);
    this.store_removeEventListenerForStoreID("summary", "success");
  }

  onStateStoreSuccess() {
    this.handleFetchDirectory();
  }
  onTaskDirectoryStoreError = () => {
    this.setState({
      taskDirectoryErrorCount: this.state.taskDirectoryErrorCount + 1
    });
  };
  onTaskDirectoryStoreSuccess = taskID => {
    if (this.props.params.taskID !== taskID) {
      this.handleFetchDirectory();

      return;
    }

    const directory = TaskDirectoryStore.get("directory");
    this.setState({ directory, taskDirectoryErrorCount: 0 });
  };

  handleFetchDirectory() {
    const { params } = this.props;
    const task = MesosStateStore.getTaskFromTaskID(params.taskID);
    // Declare undefined to not override default values in fetchDirectory
    let innerPath;

    if (params.innerPath != null) {
      innerPath = decodeURIComponent(params.innerPath);
    }

    if (task != null) {
      TaskDirectoryStore.fetchDirectory(task, innerPath);
    }

    this.setState({ directory: null });
  }
  handleBreadcrumbClick = path => {
    const { router } = this.context;
    const { params, routes } = this.props;
    const task = MesosStateStore.getTaskFromTaskID(params.taskID);
    if (task != null) {
      TaskDirectoryStore.setPath(task, path);
    }
    // Transition to parent route, which uses a default route
    const parentPath = RouterUtil.reconstructPathFromRoutes(routes);
    router.push(formatPattern(parentPath, params));
  };

  getErrorScreen() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  hasVolumes(service) {
    return !!service && service.getVolumes().getItems().length > 0;
  }

  hasLoadingError() {
    return this.state.taskDirectoryErrorCount >= 3;
  }
  handleOpenLogClick = selectedLogFile => {
    const { router } = this.context;
    const routes = this.props.routes;
    const params = {
      ...this.props.params,
      filePath: encodeURIComponent(selectedLogFile.get("path")),
      innerPath: encodeURIComponent(TaskDirectoryStore.get("innerPath"))
    };
    const { fileViewerRoutePath } = routes[routes.length - 1];
    router.push(formatPattern(fileViewerRoutePath, params));
  };

  getNotFound(item, itemID) {
    return (
      <div className="pod flush-right flush-left text-align-center">
        <Trans render="h3" className="flush-top text-align-center">
          Error finding {item}
        </Trans>
        <Trans render="p" className="flush">
          Did not find a {item} with id "{itemID}"
        </Trans>
      </div>
    );
  }

  getBreadcrumbs() {
    const path = RouterUtil.reconstructPathFromRoutes(this.props.routes);

    const innerPath = TaskDirectoryStore.get("innerPath").split("/");
    let onClickPath = "";
    const crumbs = innerPath.map((directoryItem, index) => {
      let textValue = directoryItem;

      // First breadcrumb is always 'Working Directory'.
      if (index === 0) {
        textValue = i18nMark("Working Directory");
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
    const { directory, selectedLogFile } = this.state;
    if (this.hasLoadingError()) {
      return this.getErrorScreen();
    }

    if (!directory || !task) {
      return <Loader />;
    }
    const service = DCOSStore.serviceTree.getServiceFromTaskID(task.getId());

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
  params: PropTypes.object,
  routes: PropTypes.array
};

export default TaskDetail;
