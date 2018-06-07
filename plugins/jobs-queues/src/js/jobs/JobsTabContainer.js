import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";

import { StoreMixin } from "mesosphere-shared-reactjs";
import MetronomeStore from "#SRC/js/stores/MetronomeStore";

import JobFilterTypes from "#SRC/js/constants/JobFilterTypes";
import JobTree from "#SRC/js/structs/JobTree";
import ServiceFilterTypes from "#PLUGINS/services/src/js/constants/ServiceFilterTypes";

import JobsTab from "./components/JobsTab";

const METHODS_TO_BIND = [
  "handleFilterChange",
  "resetFilter",
  "resetFilterQueryParams"
];

var DEFAULT_FILTER_OPTIONS = {
  searchString: ""
};

class JobsTabContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = { ...DEFAULT_FILTER_OPTIONS };

    this.store_listeners = [
      {
        name: "metronome",
        events: ["change", "jobCreateSuccess"],
        suppressUpdate: false
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount();
  }

  componentWillReceiveProps() {
    super.componentWillReceiveProps(...arguments);
  }

  handleFilterChange(filterValue) {
    const { router } = this.context;
    const {
      location: { pathname }
    } = this.props;
    const query = { [JobFilterTypes.TEXT]: filterValue };

    router.push({ pathname, query });

    this.setState({
      searchString: filterValue
    });
  }

  resetFilterQueryParams() {
    const {
      location: { pathname }
    } = this.props;
    const query = Object.assign({}, location.query);

    Object.values(ServiceFilterTypes).forEach(function(filterKey) {
      delete query[filterKey];
    });

    this.context.router.push({ pathname, query });
  }

  resetFilter() {
    var state = Object.assign({}, this.state, DEFAULT_FILTER_OPTIONS);
    this.setState(state, this.resetFilterQueryParams);
  }

  updateFromProps(props) {
    const { location = { query: {} } } = props;

    if (location.query[JobFilterTypes.TEXT] != null) {
      const state = {};

      state[JobFilterTypes.TEXT] = location.query[JobFilterTypes.TEXT];
      this.setState(state);
    }
  }

  getFilteredJobs(item) {
    const { searchString } = this.state;
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

  render() {
    console.log("FOOBAR jobs render");
    const id = decodeURIComponent(this.props.params.id);
    const item =
      MetronomeStore.jobTree.findItem(function(item) {
        return item instanceof JobTree && item.id === id;
      }) || MetronomeStore.jobTree;
    const isLoading = true;
    const root = MetronomeStore.jobTree;
    const filteredJobs = this.getFilteredJobs(item);
    const searchString = this.state.searchString;
    const handleFilterChange = this.handleFilterChange;
    const resetFilter = this.resetFilter;
    const hasFilterApplied = Object.keys(DEFAULT_FILTER_OPTIONS).some(
      filterKey => {
        return (
          this.state[filterKey] != null && this.state[filterKey].length > 0
        );
      }
    );

    return (
      <JobsTab
        item={item}
        root={root}
        isLoading={isLoading}
        filteredJobs={filteredJobs}
        searchString={searchString}
        handleFilterChange={handleFilterChange}
        resetFilter={resetFilter}
        hasFilterApplied={hasFilterApplied}
      />
    );
  }
}

JobsTabContainer.contextTypes = {
  router: routerShape,
  location: PropTypes.object.isRequired
};

module.exports = JobsTabContainer;
