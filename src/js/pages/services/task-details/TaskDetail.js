import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../../components/Breadcrumbs';
import MesosStateStore from '../../../stores/MesosStateStore';
import PageHeader from '../../../components/PageHeader';
import RequestErrorMsg from '../../../components/RequestErrorMsg';
import TaskDirectoryStore from '../../../stores/TaskDirectoryStore';
import TaskStates from '../../../constants/TaskStates';
import InternalStorageMixin from '../../../mixins/InternalStorageMixin';
import TabsMixin from '../../../mixins/TabsMixin';

const SERVICES_TABS = {
  'services-task-details-tab': 'Details',
  'services-task-details-files': 'Files',
  'services-task-details-logs': 'Logs'
};

const NODES_TABS = {
  'nodes-task-details-tab': 'Details',
  'nodes-task-details-files': 'Files',
  'nodes-task-details-logs': 'Logs'
};

const METHODS_TO_BIND = [
  'onTaskDirectoryStoreError',
  'onTaskDirectoryStoreSuccess'
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
      {name: 'state', events: ['success'], listenAlways: false},
      {name: 'summary', events: ['success'], listenAlways: false},
      {name: 'taskDirectory', events: ['error', 'success']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  checkForVolumes() {
    // Add the Volumes tab if it isn't already there and the service has
    // at least one volume.
    if (this.tabs_tabs.volumes == null) {
      let {service = null} = this.props;

      if (!!this.props.params.taskID) {
        service = MarathonStore.getServiceFromTaskID(
          this.props.params.taskID
        );
      }

      if (!!service && service.getVolumes().getItems().length > 0) {
        this.tabs_tabs.volumes = 'Volumes';
        this.forceUpdate();
      }
    }
  }

  componentWillMount() {
    super.componentWillMount(...arguments);
    this.tabs_tabs = Object.assign({}, SERVICES_TABS);
    if (this.props.params.nodeID != null) {
      this.tabs_tabs = Object.assign({}, NODES_TABS);
    }
    this.updateCurrentTab();
  }

  updateCurrentTab() {
    let routes = this.context.router.getCurrentRoutes();
    let currentTab = routes[routes.length - 1].name;
    if (currentTab != null) {
      this.setState({currentTab});
    }
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.store_removeEventListenerForStoreID('summary', 'success');
  }

  onStateStoreSuccess() {
    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
    TaskDirectoryStore.getDirectory(task);
  }

  onTaskDirectoryStoreError() {
    this.setState({
      taskDirectoryErrorCount: this.state.taskDirectoryErrorCount + 1
    });
  }

  onTaskDirectoryStoreSuccess() {
    this.setState({
      directory: TaskDirectoryStore.get('directory'),
      taskDirectoryErrorCount: 0
    });
  }

  hasLoadingError() {
    return this.state.taskDirectoryErrorCount >= 3;
  }

  getErrorScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center inverse">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  handleOpenLogClick(selectedLogFile) {
    this.setState({selectedLogFile, currentTab: 'debug'});
  }

  getBasicInfo() {
    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
    if (task == null) {
      return null;
    }

    let taskIcon = (
      <img src={task.getImages()['icon-large']} />
    );

    let tabs = (
      <ul className="tabs list-inline flush-bottom container-pod container-pod-short-top inverse">
        {this.tabs_getRoutedTabs({params: this.props.params})}
      </ul>
    );

    return (
      <PageHeader
        icon={taskIcon}
        iconClassName="icon-app-container"
        subTitle={TaskStates[task.state].displayName}
        navigationTabs={tabs}
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
      <div className="container container-fluid container-pod text-align-center">
        <h3 className="flush-top text-align-center">
          {`Error finding ${item}`}
        </h3>
        <p className="flush">
          {`Did not find a ${item} with id "${itemID}"`}
        </p>
      </div>
    );
  }

  getSubView() {
    let task = MesosStateStore.getTaskFromTaskID(this.props.params.taskID);
    let {directory, selectedLogFile} = this.state;
    if (this.hasLoadingError()) {
      this.getErrorScreen();
    }

    if (!directory || !task) {
      return this.getLoadingScreen();
    }

    return (
      <RouteHandler
        directory={directory}
        onOpenLogClick={this.handleOpenLogClick.bind(this)}
        selectedLogFile={selectedLogFile}
        task={task} />
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
      <div className="flex-container-col flex-grow flex-shrink container-pod container-pod-divider-bottom-align-right container-pod-short-top flush-bottom flush-top">
        <Breadcrumbs />
        {this.getBasicInfo()}
        {this.getSubView()}
      </div>
    );
  }
}

TaskDetail.contextTypes = {
  router: React.PropTypes.func
};

TaskDetail.propTypes = {
  params: React.PropTypes.object
};

module.exports = TaskDetail;
