import BreadcrumbSegment from '../../../components/BreadcrumbSegment';
import MesosStateStore from '../../../stores/MesosStateStore';

class TaskDetailBreadcrumb extends BreadcrumbSegment {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'state', events: ['success'], listenAlways: false}
    ]
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateCrumbStatus();
  }

  componentWillReceiveProps() {
    super.componentWillReceiveProps(...arguments);
    this.updateCrumbStatus();
  }

  onStateStoreSuccess() {
    this.setState({isLoadingCrumb: false});
  }

  updateCrumbStatus() {
    let taskID = this.getTaskID();

    if (taskID) {
      this.setState({isLoadingCrumb: false});
    }
  }

  getTaskID() {
    let {taskID} = this.props.parentRouter.getCurrentParams();

    if (MesosStateStore.get('lastMesosState').slaves == null) {
      return null;
    }

    return MesosStateStore.getTaskFromTaskID(taskID).getId();
  }

  getCrumbLabel() {
    return this.getTaskID();
  }
};

module.exports = TaskDetailBreadcrumb;
