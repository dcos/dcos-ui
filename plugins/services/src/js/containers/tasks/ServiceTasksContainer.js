import mixin from "reactjs-mixin";
import { MountService } from "foundation-ui";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import Loader from "../../../../../../src/js/components/Loader";
import MesosStateStore from "../../../../../../src/js/stores/MesosStateStore";
import RequestErrorMsg
  from "../../../../../../src/js/components/RequestErrorMsg";
import Service from "../../structs/Service";
import TasksContainer from "./TasksContainer";

const METHODS_TO_BIND = ["onStateStoreSuccess", "onStateStoreError"];

class ServiceTasksContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      lastUpdate: 0,
      mesosStateErrorCount: 0
    };

    this.store_listeners = [
      { name: "state", events: ["success", "error"], suppressUpdate: true }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onStateStoreSuccess() {
    // Throttle updates
    if (
      Date.now() - this.state.lastUpdate > 1000 ||
      this.state.mesosStateErrorCount !== 0
    ) {
      this.setState({
        lastUpdate: Date.now(),
        mesosStateErrorCount: 0
      });
    }
  }

  onStateStoreError() {
    this.setState({
      mesosStateErrorCount: this.state.mesosStateErrorCount + 1
    });
  }

  getContents() {
    const isLoading =
      Object.keys(MesosStateStore.get("lastMesosState")).length === 0;

    const hasError = this.state.mesosStateErrorCount > 3;

    if (isLoading) {
      return <Loader />;
    }

    // General Error
    if (hasError) {
      return <RequestErrorMsg />;
    }

    const { service } = this.props;
    const tasks = MesosStateStore.getTasksByService(service);

    return (
      <TasksContainer
        params={this.props.params}
        service={service}
        tasks={tasks}
      />
    );
  }

  render() {
    return (
      <MountService.Mount type="ServiceTasksContainer:TasksContainer">
        {this.getContents()}
      </MountService.Mount>
    );
  }
}

ServiceTasksContainer.propTypes = {
  service: React.PropTypes.instanceOf(Service),
  params: React.PropTypes.object.isRequired
};

module.exports = ServiceTasksContainer;
