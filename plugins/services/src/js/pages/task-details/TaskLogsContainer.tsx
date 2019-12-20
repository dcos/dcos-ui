import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import ConfigStore from "#SRC/js/stores/ConfigStore";
import Loader from "#SRC/js/components/Loader";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import Task from "../../structs/Task";
import TaskDirectory from "../../structs/TaskDirectory";
import TaskFileViewer from "./TaskFileViewer";
import TaskSystemLogsContainer from "./TaskSystemLogsContainer";

const SYSTEM_LOGS = "journald";

class TaskLogsContainer extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);
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

  UNSAFE_componentWillMount() {
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
  directory: PropTypes.instanceOf(TaskDirectory),
  params: PropTypes.object,
  routes: PropTypes.array,
  selectedLogFile: PropTypes.object,
  task: PropTypes.instanceOf(Task)
};

export default TaskLogsContainer;
