import React from "react";
import { routerShape } from "react-router";

import { DCOS_CHANGE } from "#SRC/js/constants/EventTypes";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";

import TasksContainer from "../../../../../services/src/js/containers/tasks/TasksContainer";

const METHODS_TO_BIND = ["onStoreChange"];

class NodeDetailTaskTab extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      isLoading: true,
      lastUpdate: 0
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    DCOSStore.addChangeListener(DCOS_CHANGE, this.onStoreChange);
  }

  componentWillUnmount() {
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.onStoreChange);
  }

  onStoreChange() {
    // Throttle updates from DCOSStore
    if (
      Date.now() - this.state.lastUpdate > 1000 ||
      (DCOSStore.serviceDataReceived && this.state.isLoading)
    ) {
      this.setState({
        isLoading: !DCOSStore.serviceDataReceived,
        lastUpdate: Date.now()
      });
    }
  }

  render() {
    const {
      location,
      params,
      params: { nodeID }
    } = this.props;
    const tasks = MesosStateStore.getTasksFromNodeID(nodeID);

    return <TasksContainer location={location} params={params} tasks={tasks} />;
  }
}

NodeDetailTaskTab.contextTypes = {
  router: routerShape
};

module.exports = NodeDetailTaskTab;
