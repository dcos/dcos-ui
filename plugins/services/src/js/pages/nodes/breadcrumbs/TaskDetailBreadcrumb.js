import BreadcrumbSegment
  from "../../../../../../../src/js/components/BreadcrumbSegment";
import MesosStateStore
  from "../../../../../../../src/js/stores/MesosStateStore";

class TaskDetailBreadcrumb extends BreadcrumbSegment {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      { name: "state", events: ["success"], listenAlways: false }
    ];
  }

  componentDidMount() {
    this.updateCrumbStatus();
  }

  componentWillReceiveProps() {
    this.updateCrumbStatus();
  }

  onStateStoreSuccess() {
    this.setState({ isLoadingCrumb: false });
  }

  updateCrumbStatus() {
    const taskID = this.getTaskName();

    if (taskID) {
      this.setState({ isLoadingCrumb: false });
    }
  }

  getTaskName() {
    const { taskID } = this.props.params;

    if (MesosStateStore.get("lastMesosState").slaves == null) {
      return null;
    }

    return MesosStateStore.getTaskFromTaskID(taskID).getName();
  }

  getCrumbLabel() {
    return this.getTaskName();
  }
}

module.exports = TaskDetailBreadcrumb;
