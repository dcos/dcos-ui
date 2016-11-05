import classNames from 'classnames';
import {Confirm, Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import prettycron from 'prettycron';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {routerShape} from 'react-router';

import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import DetailViewHeader from '../../components/DetailViewHeader';
import Icon from '../../components/Icon';
import JobConfiguration from './JobConfiguration';
import JobFormModal from '../../components/modals/JobFormModal';
import JobRunHistoryTable from './JobRunHistoryTable';
import Loader from '../../components/Loader';
import MetronomeStore from '../../stores/MetronomeStore';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import StringUtil from '../../utils/StringUtil';
import TabsMixin from '../../mixins/TabsMixin';
import TimeAgo from '../../components/TimeAgo';
import TaskStates from '../../../../plugins/services/src/js/constants/TaskStates';

const METHODS_TO_BIND = [
  'closeDialog',
  'handleEditButtonClick',
  'handleMoreDropdownSelection',
  'handleRunNowButtonClick',
  'onMetronomeStoreJobDeleteError',
  'onMetronomeStoreJobDeleteSuccess',
  'onMetronomeStoreJobDetailError',
  'onMetronomeStoreJobDetailChange'
];

const JobActionItem = {
  EDIT: 'edit',
  DESTROY: 'destroy',
  SCHEDULE_DISABLE: 'schedule_disable',
  SCHEDULE_ENABLE: 'schedule_enable',
  MORE: 'more'
};

class JobDetailPage extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [{
      name: 'metronome',
      events: [
        'jobDeleteSuccess',
        'jobDeleteError',
        'jobDetailChange',
        'jobDetailError',
        'jobRunError',
        'jobRunSuccess',
        'jobScheduleUpdateError',
        'jobScheduleUpdateSuccess'
      ],
      suppressUpdate: false
    }];

    this.tabs_tabs = {
      runHistory: 'Run History',
      configuration: 'Configuration'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      disabledDialog: null,
      jobActionDialog: null,
      errorMsg: null,
      errorCount: 0,
      isJobFormModalOpen: false,
      isLoading: true
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    MetronomeStore.monitorJobDetail(this.props.params.id);
  }

  componentWillUnmount() {
    super.componentWillUnmount(...arguments);
    MetronomeStore.stopJobDetailMonitor(this.props.params.id);
  }

  onMetronomeStoreJobDeleteError(id, {message:errorMsg}) {
    if (id !== this.props.params.id || errorMsg == null) {
      return;
    }

    this.setState({
      jobActionDialog: JobActionItem.DESTROY,
      disabledDialog: null,
      errorMsg
    });
  }

  onMetronomeStoreJobDeleteSuccess() {
    this.closeDialog();
    this.context.router.push('/jobs');
  }

  onMetronomeStoreJobDetailError() {
    this.setState({errorCount: this.state.errorCount + 1});
  }

  onMetronomeStoreJobDetailChange() {
    this.setState({errorCount: 0, isLoading: false});
  }

  handleEditButtonClick() {
    this.setState({jobActionDialog: JobActionItem.EDIT});
  }

  handleRunNowButtonClick() {
    let job = MetronomeStore.getJob(this.props.params.id);

    MetronomeStore.runJob(job.getId());
  }

  handleAcceptDestroyDialog(stopCurrentJobRuns = false) {
    this.setState({disabledDialog: JobActionItem.DESTROY}, () => {
      MetronomeStore.deleteJob(this.props.params.id, stopCurrentJobRuns);
    });
  }

  handleMoreDropdownSelection(selection) {
    if (selection.id === JobActionItem.SCHEDULE_DISABLE) {
      MetronomeStore.toggleSchedule(this.props.params.id, false);
      return;
    }

    if (selection.id === JobActionItem.SCHEDULE_ENABLE) {
      MetronomeStore.toggleSchedule(this.props.params.id, true);
      return;
    }

    this.setState({jobActionDialog: selection.id});
  }

  closeDialog() {
    this.setState({
      disabledDialog: null,
      errorMsg: null,
      jobActionDialog: null
    });
  }

  getActionButtons() {
    let job = MetronomeStore.getJob(this.props.params.id);
    let dropdownItems = [];
    let [schedule] = job.getSchedules();

    dropdownItems.push({
      className: 'hidden',
      html: 'More',
      id: JobActionItem.MORE
    });

    if (schedule != null && schedule.enabled) {
      dropdownItems.push({
        html: 'Disable Schedule',
        id: JobActionItem.SCHEDULE_DISABLE
      });
    }

    if (schedule != null && !schedule.enabled) {
      dropdownItems.push({
        html: 'Enable Schedule',
        id: JobActionItem.SCHEDULE_ENABLE
      });
    }

    dropdownItems.push({
      html: <span className="text-danger">Destroy</span>,
      id: JobActionItem.DESTROY
    });

    return [
      <button
        className="button button-stroke"
        key="edit"
        onClick={this.handleEditButtonClick}>
        Edit
      </button>,
      <button
        className="button button-stroke"
        key="run-now"
        onClick={this.handleRunNowButtonClick}>
        Run Now
      </button>,
      <Dropdown
        anchorRight={true}
        buttonClassName="dropdown-toggle button button-stroke"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID="more"
        items={dropdownItems}
        key="more"
        onItemSelection={this.handleMoreDropdownSelection}
        persistentID="more"
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        wrapperClassName="dropdown" />
    ];
  }

  getDestroyConfirmDialog() {
    const {id} = this.props.params;
    const {disabledDialog, jobActionDialog, errorMsg} = this.state;
    let stopCurrentJobRuns = false;
    let actionButtonLabel = 'Destroy Job';
    let message = `Are you sure you want to destroy ${id}? ` +
      'This action is irreversible.';

    if (/stopCurrentJobRuns=true/.test(errorMsg)) {
      actionButtonLabel = 'Stop Current Runs and Destroy Job';
      stopCurrentJobRuns = true;
      message = `Couldn't destroy ${id} as there are currently active job ` +
        'runs. Do you want to stop all runs and destroy the job?';
    }

    let content = (
      <div>
        <h2 className="text-danger text-align-center flush-top">
          Destroy Job
        </h2>
        <p>{message}</p>
      </div>
    );

    return (
      <Confirm children={content}
        disabled={disabledDialog === JobActionItem.DESTROY}
        open={jobActionDialog === JobActionItem.DESTROY}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText={actionButtonLabel}
        rightButtonClassName="button button-danger"
        rightButtonCallback=
          {this.handleAcceptDestroyDialog.bind(this, stopCurrentJobRuns)} />
    );
  }

  getErrorScreen() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getNavigationTabs() {
    return (
      <ul className="menu-tabbed">
        {this.tabs_getUnroutedTabs()}
      </ul>
    );
  }

  getPrettySchedule(job) {
    let schedules = job.getSchedules();
    if (schedules == null || schedules.length === 0) {
      return null;
    }

    let schedule = schedules[0];
    if (schedule.enabled) {
      return prettycron.toString(schedule.cron);
    }
  }

  getSubTitle(job) {
    let nodes = [];
    let scheduleText = this.getPrettySchedule(job);
    let longestRunningTask = null;
    let longestRunningActiveRun = job.getActiveRuns()
      .getLongestRunningActiveRun();

    if (longestRunningActiveRun != null) {
      longestRunningTask = longestRunningActiveRun.getTasks()
        .getLongestRunningTask();
    }

    if (longestRunningTask == null && scheduleText == null) {
      return null;
    }

    if (scheduleText != null) {
      nodes.push(
        <p className="text-overflow flush" key="schedule-text">
          <Icon
            className="icon-margin-right"
            key="schedule-icon"
            color="grey"
            id="repeat"
            size="mini"
            family="small" />
          <span>Scheduled {StringUtil.lowercase(scheduleText)}</span>
        </p>
      );
    }

    if (longestRunningTask != null) {
      let dateCompleted = longestRunningTask.getDateCompleted();

      let status = TaskStates[longestRunningTask.getStatus()];
      let statusClasses = classNames('job-details-header-status', {
        'text-success': status.stateTypes.includes('success')
        && !status.stateTypes.includes('failure'),
        'text-danger': status.stateTypes.includes('failure')
      });

      let timePrefix = null;
      let shouldSuppressRelativeTime = dateCompleted == null;

      if (shouldSuppressRelativeTime) {
        timePrefix = 'for ';
      }

      nodes.push(
        <span className={statusClasses} key="status-text">
          {status.displayName}
        </span>,
        <span key="time-running">
          <TimeAgo
            prefix={timePrefix}
            suppressSuffix={shouldSuppressRelativeTime}
            time={longestRunningActiveRun.getDateCreated()} />
      </span>
      );
    }

    return nodes;
  }

  renderConfigurationTabView(job) {
    return <JobConfiguration job={job} />;
  }

  renderRunHistoryTabView(job) {
    return <JobRunHistoryTable job={job} />;
  }

  render() {
    if (this.state.errorCount > 3) {
      return this.getErrorScreen();
    }

    if (this.state.isLoading) {
      return this.getLoadingScreen();
    }

    if (this.props.params.taskID) {
      return this.props.children;
    }

    let job = MetronomeStore.getJob(this.props.params.id);

    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <DetailViewHeader
          actionButtons={this.getActionButtons()}
          icon={<Icon color="neutral" id="page-code" size="large" />}
          navigationTabs={this.getNavigationTabs()}
          subTitle={this.getSubTitle(job)}
          subTitleClassName={{emphasize: false}}
          title={job.getDescription() || job.getId()} />
        {this.tabs_getTabView(job)}
        <JobFormModal isEdit={true}
          job={job}
          open={this.state.jobActionDialog === JobActionItem.EDIT}
          onClose={this.closeDialog} />
        {this.getDestroyConfirmDialog()}
      </div>
    );
  }
}

JobDetailPage.contextTypes = {
  router: routerShape
};

module.exports = JobDetailPage;
