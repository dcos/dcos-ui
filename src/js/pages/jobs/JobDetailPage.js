import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import DateUtil from '../../utils/DateUtil';
import JobConfiguration from './JobConfiguration';
import JobFormModal from '../../components/modals/JobFormModal';
import JobRunHistoryTable from './JobRunHistoryTable';
import MetronomeStore from '../../stores/MetronomeStore';
import PageHeader from '../../components/PageHeader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import TabsMixin from '../../mixins/TabsMixin';
import TaskStates from '../../constants/TaskStates';

const METHODS_TO_BIND = [
  'handleCloseJobFormModal',
  'handleEditButtonClick',
  'handleMoreDropdownSelection',
  'handleRunNowButtonClick',
  'onMetronomeStoreJobDetailError',
  'onMetronomeStoreJobDetailChange'
];

class JobDetailPage extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [{
      name: 'metronome',
      events: [
        'jobDetailChange',
        'jobDetailError',
        'jobRunError',
        'jobRunSuccess',
        'jobSuspendError',
        'jobSuspendSuccess'
      ]
    }];

    this.tabs_tabs = {
      runHistory: 'Run History',
      configuration: 'Configuration'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
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

  onMetronomeStoreJobDetailError() {
    this.setState({errorCount: this.state.errorCount + 1});
  }

  onMetronomeStoreJobDetailChange() {
    this.setState({errorCount: 0, isLoading: false});
  }

  handleEditButtonClick() {
    this.setState({isJobFormModalOpen: true});
  }

  handleCloseJobFormModal() {
    this.setState({isJobFormModalOpen: false});
  }

  handleRunNowButtonClick() {
    let job = MetronomeStore.getJob(this.props.params.id);

    MetronomeStore.runJob(job.getId());
  }

  handleMoreDropdownSelection(selection) {
    let job = MetronomeStore.getJob(this.props.params.id);

    if (selection.id === 'suspend') {
      MetronomeStore.suspendSchedule(job.getId());
    }

    if (selection.id === 'destroy') {
      MetronomeStore.deleteJob(job.getId());
    }
  }

  getActionButtons() {
    let dropdownItems = [
      {
        className: 'hidden',
        html: 'More',
        id: 'more'
      },
      {
        html: 'Suspend',
        id: 'suspend'
      },
      {
        html: 'Destroy',
        id: 'destroy'
      }
    ];

    return [
      <button
        className="button button-inverse button-stroke"
        key="edit"
        onClick={this.handleEditButtonClick}>
        Edit
      </button>,
      <button
        className="button button-inverse button-stroke"
        key="run-now"
        onClick={this.handleRunNowButtonClick}>
        Run Now
      </button>,
      <Dropdown
        buttonClassName="dropdown-toggle button button-inverse button-stroke"
        dropdownMenuClassName="dropdown-menu inverse"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID="more"
        items={dropdownItems}
        key="more"
        onItemSelection={this.handleMoreDropdownSelection}
        persistentID="more"
        transition={true}
        wrapperClassName="dropdown anchor-right" />
    ];
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
      <div className="container container-fluid container-pod text-align-center
        vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getNavigationTabs() {
    return (
      <ul className="tabs tall list-inline flush-bottom inverse">
        {this.tabs_getUnroutedTabs()}
      </ul>
    );
  }

  getSubTitle(job) {
    let longestRunningActiveRun = job.getActiveRuns()
      .getLongestRunningActiveRun();

    if (!longestRunningActiveRun) {
      return null;
    }

    let longestRunningTask = longestRunningActiveRun.getTasks()
      .getLongestRunningTask();

    if (!longestRunningTask) {
      return null;
    }

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

    return [
      <span className={statusClasses} key="status-text">
        {status.displayName}
      </span>,
      <span key="time-running">
        ({timePrefix}{DateUtil.msToRelativeTime(
          longestRunningActiveRun.getDateCreated(),
          shouldSuppressRelativeTime
        )})
      </span>
    ];
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
      return <RouteHandler />;
    }

    let job = MetronomeStore.getJob(this.props.params.id);

    return (
      <div>
        <Breadcrumbs />
        <PageHeader
          actionButtons={this.getActionButtons()}
          navigationTabs={this.getNavigationTabs()}
          subTitle={this.getSubTitle(job)}
          subTitleClassName={{emphasize: false}}
          title={job.getDescription()} />
        {this.tabs_getTabView(job)}
        <JobFormModal isEdit={true} job={job} open={this.state.isJobFormModalOpen}
          onClose={this.handleCloseJobFormModal} />
      </div>
    );
  }
}

module.exports = JobDetailPage;
