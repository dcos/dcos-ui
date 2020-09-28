import mixin from "reactjs-mixin";
import { MountService } from "foundation-ui";
import PropTypes from "prop-types";
import * as React from "react";

import Loader from "#SRC/js/components/Loader";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Service from "../../structs/Service";
import TasksContainer from "../tasks/TasksContainer";

class ServiceInstancesContainer extends mixin(StoreMixin) {
  static propTypes = {
    service: PropTypes.instanceOf(Service),
    params: PropTypes.object.isRequired,
  };

  state = { lastUpdate: 0, mesosStateErrorCount: 0 };

  store_listeners = [
    { name: "state", events: ["success", "error"], suppressUpdate: true },
  ];
  onStateStoreSuccess = () => {
    // Throttle updates
    if (
      Date.now() - this.state.lastUpdate > 1000 ||
      this.state.mesosStateErrorCount !== 0
    ) {
      this.setState({
        lastUpdate: Date.now(),
        mesosStateErrorCount: 0,
      });
    }
  };
  onStateStoreError = () => {
    this.setState({
      mesosStateErrorCount: this.state.mesosStateErrorCount + 1,
    });
  };

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

    const { service, params, location } = this.props;
    const tasks = MesosStateStore.getTasksByService(service);

    return <TasksContainer params={params} tasks={tasks} location={location} />;
  }

  render() {
    return (
      <MountService.Mount type="ServiceInstancesContainer:TasksContainer">
        {this.getContents()}
      </MountService.Mount>
    );
  }
}

export default ServiceInstancesContainer;
