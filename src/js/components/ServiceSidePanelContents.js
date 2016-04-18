/*eslint-disable no-unused-vars*/
const React = require('react');
/*eslint-enable no-unused-vars*/

import DateUtil from '../utils/DateUtil';
import DescriptionList from './DescriptionList';
import HealthLabels from '../constants/HealthLabels';
import HealthStatus from '../constants/HealthStatus';
import MarathonStore from '../stores/MarathonStore';
import MesosStateStore from '../stores/MesosStateStore';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import SidePanelContents from './SidePanelContents';
import StringUtil from '../utils/StringUtil';
import TaskView from './TaskView';

const METHODS_TO_BIND = [
  'handleOpenServiceButtonClick',
  'handleTaskClick'
];

class ServiceSidePanelContents extends SidePanelContents {
  constructor() {
    super(...arguments);

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    this.store_listeners = [
      {name: 'marathon', events: ['success']},
      {name: 'summary', events: ['success']},
      {name: 'state', events: ['success']}
    ];

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  onStateStoreSuccess() {
    let serviceName = this.props.itemID;
    let service = MesosStateStore.getServiceFromName(serviceName);
    let tabs = this.tabs_tabs;

    if (service && service.name === 'marathon' && tabs && tabs.details) {
      delete this.tabs_tabs.details;
      this.forceUpdate();
    }
  }

  handleOpenServiceButtonClick() {
    this.props.parentRouter.transitionTo(
      'service-ui',
      {serviceName: this.props.itemID}
    );
  }

  handleTaskClick(taskID) {
    let currentRoutes = this.props.parentRouter.getCurrentRoutes();
    let currentPage = currentRoutes[currentRoutes.length - 2].name;

    this.props.parentRouter.transitionTo(
      `${currentPage}-task-panel`,
      {taskID}
    );
  }

  getSubHeader(service) {
    let appHealth = MarathonStore.getServiceHealth(service.name);
    let appVersion = MarathonStore.getServiceVersion(service.name);
    let activeTasksCount = service.sumTaskTypesByState('active');
    let activeTasksSubHeader = StringUtil.pluralize('Task', activeTasksCount);
    let subHeaderItems = [
      {
        classes:
          `side-panel-subheader ${HealthStatus[appHealth.key].classNames}`,
        label: HealthLabels[HealthStatus[appHealth.key].key],
        shouldShow: appHealth.key != null
      },
      {
        classes: 'side-panel-subheader',
        label: `Version ${appVersion}`,
        shouldShow: appVersion != null
      },
      {
        classes: 'side-panel-subheader',
        label: `${activeTasksCount} Active ${activeTasksSubHeader}`,
        shouldShow: activeTasksCount != null && activeTasksSubHeader != null
      }
    ];

    return subHeaderItems.map(function (item, index) {
      if (!item.shouldShow) {
        return null;
      }

      return (
        <span className={item.classes} key={index}>
          {item.label}
        </span>
      );
    });
  }

  getBasicInfo() {
    let service = MesosSummaryStore.getServiceFromName(this.props.itemID);

    if (service == null) {
      return null;
    }

    let imageTag = null;
    let appImages = MarathonStore.getServiceImages(service.name);
    if (appImages && appImages['icon-large']) {
      imageTag = (
        <div className="side-panel-icon icon icon-large icon-image-container icon-app-container">
          <img src={appImages['icon-large']} />
        </div>
      );
    }

    return (
      <div className="side-panel-content-header-details flex-box
        flex-box-align-vertical-center">
        {imageTag}
        <div>
          <h1 className="side-panel-content-header-label flush">
            {service.name}
          </h1>
          <div>
            {this.getSubHeader(service)}
          </div>
        </div>
      </div>
    );
  }

  getOpenServiceButton() {
    if (!MesosSummaryStore.hasServiceUrl(this.props.itemID)) {
      return null;
    }

    // We are not using react-router's Link tag due to reactjs-component's
    // Portal going outside of React's render tree.
    return (
      <div className="side-panel-content-header-actions container-pod container-pod-short flush-top">
        <div className="button-collection flush-bottom">
          <a className="button button-primary"
            onClick={this.handleOpenServiceButtonClick}>
            Open Service
          </a>
        </div>
      </div>
    );
  }

  getSchedulerDetails() {
    let schedulerTask = MesosStateStore.getSchedulerTaskFromServiceName(
      this.props.itemID
    );

    if (!schedulerTask) {
      return null;
    }

    let taskID = schedulerTask.id;
    let schedulerMapping = {
      ID: (
        <a
          className="clickable text-overflow"
          onClick={this.handleTaskClick.bind(this, taskID)}
          title={taskID}>
          {taskID}
        </a>
      ),
      CPU: schedulerTask.resources.cpus,
      Memory: schedulerTask.resources.mem,
      'Disk Space': schedulerTask.resources.disk
    };

    return (
      <DescriptionList
        className="container container-fluid container-pod container-pod-short flush-bottom"
        hash={schedulerMapping}
        headline="Scheduler" />
    );
  }

  renderTasksTabView() {
    let serviceName = this.props.itemID;
    let tasks = MesosStateStore.getTasksFromServiceName(serviceName);

    let contents = this.getLoadingScreen();

    let timeSinceMount = (Date.now() - this.mountedAt) / 1000;
    if (timeSinceMount >= SidePanelContents.animationLengthSeconds) {
      contents = <TaskView tasks={tasks} parentRouter={this.props.parentRouter} />;
    }

    return (
      <div className="
        side-panel-tab-content
        side-panel-section
        container
        container-fluid
        container-pod
        container-pod-short
        container-fluid
        flex-container-col
        flex-grow">
        {contents}
      </div>
    );
  }

  renderDetailsTabView() {
    let serviceName = this.props.itemID;
    let service = MesosStateStore.getServiceFromName(serviceName);
    let marathonService = MarathonStore.getServiceFromName(serviceName);

    if (service == null ||
      marathonService == null ||
      marathonService.snapshot == null ||
      service != null && service.name === 'marathon') {
      return (
        <h4 className="text-align-center">No information available.</h4>
      );
    }

    let installedTime = MarathonStore.getServiceInstalledTime(serviceName);
    let portTitle = StringUtil.pluralize(
      'Port', marathonService.snapshot.ports.length
    );
    let headerValueMapping = {
      'Host Name': service.hostname,
      Tasks: service.tasks.length,
      Installed: DateUtil.msToDateStr(installedTime),
      Instances: marathonService.snapshot.instances,
      Command: marathonService.snapshot.cmd,
      [portTitle]: marathonService.snapshot.ports.join(', ')
    };

    return (
      <div className="container-fluid container-pod container-pod-short flush-top">
        {this.getSchedulerDetails()}
        <DescriptionList
          className="container container-fluid container-pod container-pod-short flush-bottom"
          hash={headerValueMapping}
          headline="Configuration" />
      </div>
    );
  }

  render() {
    let service = MesosSummaryStore.getServiceFromName(this.props.itemID);

    if (service == null) {
      return this.getNotFound('service');
    }

    return (
      <div className="flex-container-col">
        <div className="side-panel-section side-panel-content-header container container-pod container-fluid container-pod-divider-bottom container-pod-divider-bottom-align-right flush-bottom">
          {this.getBasicInfo()}
          <div className="side-panel-content-header-charts container-pod container-pod-short">
            <div className="row">
              {this.getCharts('Service', service)}
            </div>
          </div>
          {this.getOpenServiceButton()}
          <ul className="tabs list-inline flush-bottom">
            {this.tabs_getUnroutedTabs()}
          </ul>
        </div>
        {this.tabs_getTabView()}
      </div>
    );
  }
}

module.exports = ServiceSidePanelContents;
