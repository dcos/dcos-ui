import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import ConfigStore from "../../../../../../src/js/stores/ConfigStore";
import Loader from "../../../../../../src/js/components/Loader";
import Task from "../../structs/Task";
import TaskDirectory from "../../structs/TaskDirectory";
import TaskFileViewer from "./TaskFileViewer";
import TaskSystemLogsContainer from "./TaskSystemLogsContainer";
import {
  findNestedPropertyInObject
} from "../../../../../../src/js/utils/Util";
import {
  SYSTEM_LOGS
} from "../../../../../../src/js/constants/MesosLoggingStrategy";

class TaskLogsContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);
    this.state = {
      isLoading: true
    };

    this.store_listeners = [
      {
        name: "config",
        events: ["success", "error"],
        listenAlways: false
      }
    ];
  }

  componentWillMount() {
    // We already have a configuration, so stop loading. No need to fetch
    if (this.state.isLoading && ConfigStore.get("config") != null) {
      this.setState({ isLoading: false });
    }
  }

  componentDidMount() {
    // We did not already receive the configuration
    if (this.state.isLoading && ConfigStore.get("config") == null) {
      ConfigStore.fetch();
    }
  }

  onConfigStoreSuccess() {
    this.setState({ isLoading: false });
  }

  onConfigStoreError() {
    this.setState({ isLoading: false });
  }

  render() {
    if (this.state.isLoading) {
      return <Loader />;
    }

    const { directory, params, routes, selectedLogFile, task } = this.props;
    const config = ConfigStore.get("config");
    const loggingStrategy = findNestedPropertyInObject(
      config,
      "uiConfiguration.plugins.mesos.logging-strategy"
    );

    if (loggingStrategy === SYSTEM_LOGS) {
      return <TaskSystemLogsContainer task={task} />;
    }

    return (
      <TaskFileViewer
        directory={directory}
        limitLogFiles={["stdout", "stderr"]}
        params={params}
        routes={routes}
        selectedLogFile={selectedLogFile}
        task={task}
      />
    );
  }
}

TaskLogsContainer.propTypes = {
  directory: React.PropTypes.instanceOf(TaskDirectory),
  params: React.PropTypes.object,
  routes: React.PropTypes.array,
  selectedLogFile: React.PropTypes.object,
  task: React.PropTypes.instanceOf(Task)
};

module.exports = TaskLogsContainer;
