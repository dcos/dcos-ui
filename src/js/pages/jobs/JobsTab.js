import {DCOSStore} from 'foundation-ui';
import mixin from 'reactjs-mixin';
import React from 'react';
import {routerShape} from 'react-router';

import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import Breadcrumbs from '../../components/Breadcrumbs';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import Icon from '../../components/Icon';
import JobsTable from './JobsTable';
import JobSearchFilter from '../../components/JobSearchFilter';
import JobTree from '../../structs/JobTree';
import Loader from '../../components/Loader';
import QueryParamsMixin from '../../mixins/QueryParamsMixin';
import SaveStateMixin from '../../mixins/SaveStateMixin';
import JobFormModal from '../../components/modals/JobFormModal';

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

let saveState_properties = Object.keys(DEFAULT_FILTER_OPTIONS);

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
    let {state} = this;

    Object.keys(DEFAULT_FILTER_OPTIONS).forEach((saveStateKey) => {
      const queryParams = this.getQueryParamObject();
      let saveStateValue = state[saveStateKey];
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
    let {location: {pathname}} = this.props;
    let query = Object.assign({}, location.query);

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
    let {state} = this;
    let jobs = item.getItems();

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

    // Breadcrumbs here
    return (
      <Breadcrumbs routes={this.props.routes} params={this.props.params} />
    );
  }

  getFilteredJobs(item) {
    let {searchString} = this.state;
    let jobs = item.getItems();

    if (searchString) {
      let filterProperties = Object.assign({}, item.getFilterProperties(), {
        name(item) {
          return item.getId();
        }
      });

      jobs = item.filterItemsByText(searchString, filterProperties).getItems();
    }
    return jobs;
  }

  getJobTreeView(item) {
    let filteredJobs = this.getFilteredJobs(item);

    return (
      <div className="flex-grow">
        {this.getHeadline(item, filteredJobs)}
        <FilterBar rightAlignLastNChildren={1}>
          <JobSearchFilter
            handleFilterChange={this.handleFilterChange}
            location={this.props.location} />
          <button className="button button-success"
            onClick={this.handleOpenJobFormModal}>
            New Job
          </button>
        </FilterBar>
        <JobsTable jobs={filteredJobs} />
      </div>
    );
  }

  getAlertPanelFooter() {
    return (
      <div className="button-collection flush-bottom">
        <button className="button button-success"
          onClick={this.handleOpenJobFormModal}>
          Create Job
        </button>
      </div>
    );
  }

  getContents(item) {
    // Render loading screen
    if (!DCOSStore.dataProcessed) {
      return <Loader />;
    }

    if (item instanceof JobTree && item.getItems().length > 0) {
      return this.getJobTreeView(item);
    }

    if (this.props.params.id) {
      return this.props.children;
    }

    // Render empty panel
    return (
      <AlertPanel
        title="No Jobs Created"
        footer={this.getAlertPanelFooter()}
        icon={<Icon id="pages-code" color="neutral" size="jumbo" />}>
        <p className="flush-bottom">
          Create both one-off or scheduled jobs to perform tasks at a predefined
          interval.
        </p>
      </AlertPanel>
    );
  }

  render() {
    let {id} = this.props.params;
    id = decodeURIComponent(id);

    // Find item in root tree and default to root tree if there is no match
    let item = DCOSStore.jobTree.findItemById(id) || DCOSStore.jobTree;

    return (
      <div className="flex-container-col flex-grow flex-shrink">
        {this.getContents(item)}
        <JobFormModal open={this.state.isJobFormModalOpen}
          onClose={this.handleCloseJobFormModal}/>
      </div>
    );
  }
}

JobsTab.contextTypes = {
  router: routerShape
};

module.exports = JobsTab;
