import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ChronosStore from '../../stores/ChronosStore';
import DateUtil from '../../utils/DateUtil';
import JobConfiguration from './JobConfiguration';
import JobRunHistoryTable from './JobRunHistoryTable';
import PageHeader from '../../components/PageHeader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import TabsMixin from '../../mixins/TabsMixin';
import TaskStates from '../../constants/TaskStates';

class JobDetailPage extends mixin(StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [{
      name: 'chronos',
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
      isLoading: true
    };
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    ChronosStore.monitorJobDetail(this.props.params.id);
  }

  onChronosStoreJobDetailError() {
    this.setState({errorCount: this.state.errorCount + 1});
  }

  onChronosStoreJobDetailChange() {
    this.setState({errorCount: 0, isLoading: false});
  }

  handleEditButtonClick() {
    // TODO: Handle edit button click
  }

  handleRunNowButtonClick(jobID) {
    ChronosStore.runJob(jobID);
  }

  handleMoreDropdownSelection(jobID, selection) {
    if (selection.id === 'suspend') {
      ChronosStore.suspendJob(jobID);
    }

    if (selection.id === 'destroy') {
      ChronosStore.deleteJob(jobID);
    }
  }

  getActionButtons(job) {
    let jobID = encodeURIComponent(job.getId());

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
        onClick={this.handleEditButtonClick.bind(this, jobID)}>
        Edit
      </button>,
      <button
        className="button button-inverse button-stroke"
        key="run-now"
        onClick={this.handleRunNowButtonClick.bind(this, jobID)}>
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
        onItemSelection={this.handleMoreDropdownSelection.bind(this, jobID)}
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
        && status.stateTypes.includes('failure'),
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

    let job = ChronosStore.getJob(this.props.params.id);

    return (
      <div>
        <PageHeader
          actionButtons={this.getActionButtons(job)}
          navigationTabs={this.getNavigationTabs()}
          subTitle={this.getSubTitle(job)}
          subTitleClassName={{emphasize: false}}
          title={job.getDescription()} />
          {this.tabs_getTabView(job)}
      </div>
    );
  }
}

module.exports = JobDetailPage;
