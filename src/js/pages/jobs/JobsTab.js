import {DCOSStore} from 'foundation-ui';
import mixin from 'reactjs-mixin';
import React from 'react';
import {routerShape} from 'react-router';

import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import JobsBreadcrumbs from '../../components/breadcrumbs/JobsBreadcrumbs';
import JobsTable from './JobsTable';
import JobSearchFilter from '../../components/JobSearchFilter';
import JobFormModal from '../../components/modals/JobFormModal';
import JobTree from '../../structs/JobTree';
import Loader from '../../components/Loader';
import Page from '../../components/Page';
import QueryParamsMixin from '../../mixins/QueryParamsMixin';
import ServiceFilterTypes from '../../../../plugins/services/src/js/constants/ServiceFilterTypes';
import SaveStateMixin from '../../mixins/SaveStateMixin';

const METHODS_TO_BIND = [
  'getHeadline',
  'handleFilterChange',
  'handleCloseJobFormModal',
  'handleOpenJobFormModal',
  'resetFilter',
  'resetFilterQueryParams'
];

var DEFAULT_FILTER_OPTIONS = {
  searchString: ''
};

const saveState_properties = Object.keys(DEFAULT_FILTER_OPTIONS);

class JobsTab extends mixin(StoreMixin, QueryParamsMixin, SaveStateMixin) {

  constructor() {
    super(...arguments);

    this.state = Object.assign({
      isJobFormModalOpen: false
    }, DEFAULT_FILTER_OPTIONS);

    this.saveState_key = 'jobsPage';
    this.saveState_properties = saveState_properties;

    this.store_listeners = [
      {name: 'dcos', events: ['change'], suppressUpdate: false},
      {
        name: 'metronome',
        events: ['change', 'jobCreateSuccess'],
        suppressUpdate: false
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount();
    const {state} = this;

    Object.keys(DEFAULT_FILTER_OPTIONS).forEach((saveStateKey) => {
      const queryParams = this.getQueryParamObject();
      const saveStateValue = state[saveStateKey];
      if (saveStateValue !== queryParams[saveStateKey]) {
        this.setQueryParam(saveStateKey, saveStateValue);
      }
    });
  }

  handleCloseJobFormModal() {
    this.setState({isJobFormModalOpen: false});
  }

  handleOpenJobFormModal() {
    this.setState({isJobFormModalOpen: true});
  }

  handleFilterChange(filterValues, filterType) {
    var stateChanges = Object.assign({}, this.state);
    stateChanges[filterType] = filterValues;

    this.setState(stateChanges);
  }

  resetFilterQueryParams() {
    const {location: {pathname}} = this.props;
    const query = Object.assign({}, location.query);

    Object.values(ServiceFilterTypes).forEach(function (filterKey) {
      delete query[filterKey];
    });

    this.context.router.push({ pathname, query });
  }

  resetFilter() {
    var state = Object.assign({}, this.state, DEFAULT_FILTER_OPTIONS);
    this.setState(state, this.resetFilterQueryParams);
  }

  getHeadline(item, filteredJobs) {
    const {state} = this;
    const jobs = item.getItems();

    const hasFiltersApplied = Object.keys(DEFAULT_FILTER_OPTIONS)
      .some((filterKey) => {
        return state[filterKey] != null && state[filterKey].length > 0;
      });

    if (hasFiltersApplied) {
      return (
        <FilterHeadline
          onReset={this.resetFilter}
          name="Jobs"
          currentLength={filteredJobs.length}
          totalLength={jobs.length} />
      );
    }
  }

  getFilteredJobs(item) {
    const {searchString} = this.state;
    let jobs = item.getItems();

    if (searchString) {
      const filterProperties = Object.assign({}, item.getFilterProperties(), {
        name(item) {
          return item.getId();
        }
      });

      jobs = item.filterItemsByText(searchString, filterProperties).getItems();
    }
    return jobs;
  }

  getJobTreeView(item, modal) {
    let filteredJobs = this.getFilteredJobs(item);

    return (
      <Page>
        <Page.Header
          addButton={{label: 'Create a job', onItemSelect: this.handleOpenJobFormModal}}
          breadcrumbs={<JobsBreadcrumbs jobID={item.id} />} />
        <div className="flex-grow">
          {this.getHeadline(item, filteredJobs)}
          <FilterBar>
            <JobSearchFilter
              handleFilterChange={this.handleFilterChange}
              location={this.props.location} />
          </FilterBar>
          <JobsTable jobs={filteredJobs} />
        </div>
        {modal}
      </Page>
    );
  }

  getAlertPanelFooter() {
    return (
      <div className="button-collection flush-bottom">
        <button className="button button-success"
          onClick={this.handleOpenJobFormModal}>
          Create a Job
        </button>
      </div>
    );
  }

  getContents(item, modal) {
    // Render loading screen
    if (!DCOSStore.dataProcessed) {
      return (
        <Page>
          <Page.Header breadcrumbs={<JobsBreadcrumbs/>} />
          <Loader />
        </Page>
      );
    }

    if (item instanceof JobTree && item.getItems().length > 0) {
      return this.getJobTreeView(item, modal);
    }

    // JobDetailPage
    if (this.props.params.id) {
      return this.props.children;
    }

    // Render empty panel
    return (
      <Page>
        <Page.Header breadcrumbs={<JobsBreadcrumbs/>} />
        <AlertPanel
          title="No active jobs">
          <p className="tall">
            Create both one-off or scheduled jobs to perform tasks at a predefined interval.
          </p>
          {this.getAlertPanelFooter()}
        </AlertPanel>
        {modal}
      </Page>
    );
  }

  render() {
    let {id} = this.props.params;
    id = decodeURIComponent(id);

    // Find item in root tree and default to root tree if there is no match
    const item = DCOSStore.jobTree.findItemById(id) || DCOSStore.jobTree;

    const modal = (
      <JobFormModal
        open={this.state.isJobFormModalOpen}
        onClose={this.handleCloseJobFormModal}/>
    );

    return this.getContents(item, modal);
  }
}

JobsTab.contextTypes = {
  router: routerShape
};

module.exports = JobsTab;
