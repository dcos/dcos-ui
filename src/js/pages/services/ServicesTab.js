import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import Config from '../../config/Config';
import DCOSStore from '../../stores/DCOSStore';
import FilterHeadline from '../../components/FilterHeadline';
import QueryParamsMixin from '../../mixins/QueryParamsMixin';
import SaveStateMixin from '../../mixins/SaveStateMixin';
import Service from '../../structs/Service';
import ServiceDetail from '../../components/ServiceDetail';
import ServiceFilterTypes from '../../constants/ServiceFilterTypes';
import ServiceSearchFilter from '../../components/ServiceSearchFilter';
import ServiceSidebarFilters from '../../components/ServiceSidebarFilters';
import ServicesTable from '../../components/ServicesTable';
import ServiceTree from '../../structs/ServiceTree';
import SidebarActions from '../../events/SidebarActions';
import SidePanels from '../../components/SidePanels';

var DEFAULT_FILTER_OPTIONS = {
  filterHealth: null,
  searchString: ''
};

let saveState_properties = Object.keys(DEFAULT_FILTER_OPTIONS);

var ServicesTab = React.createClass({

  displayName: 'ServicesTab',

  saveState_key: 'servicesPage',

  saveState_properties,

  mixins: [SaveStateMixin, StoreMixin, QueryParamsMixin],

  statics: {
    // Static life cycle method from react router, that will be called
    // 'when a handler is about to render', i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo: function () {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return Object.assign({}, DEFAULT_FILTER_OPTIONS);
  },

  componentWillMount: function () {
    this.store_listeners = [{name: 'dcos', events: ['change']}];
  },

  componentDidMount: function () {
    let {state} = this;
    Object.keys(DEFAULT_FILTER_OPTIONS).forEach((saveStateKey) => {
      const queryParams = this.getQueryParamObject();
      if (queryParams != null &&
        queryParams[saveStateKey] &&
        state[saveStateKey] !== queryParams[saveStateKey]) {
        this.setQueryParam(saveStateKey, state[saveStateKey]);
      }
    });
  },

  handleFilterChange: function (filterValues, filterType) {
    var stateChanges = Object.assign({}, this.state);
    stateChanges[filterType] = filterValues;

    this.setState(stateChanges);
  },

  resetFilterQueryParams: function () {
    let router = this.context.router;
    let queryParams = router.getCurrentQuery();

    Object.values(ServiceFilterTypes).forEach(function (filterKey) {
      delete queryParams[filterKey];
    });

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  resetFilter: function () {
    var state = Object.assign({}, this.state, DEFAULT_FILTER_OPTIONS);
    this.setState(state, this.resetFilterQueryParams);
  },

  getContents: function (id) {
    // Render loading screen
    if (!DCOSStore.dataProcessed) {
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

    // Find item in root tree and default to root tree if there is no match
    let item = DCOSStore.serviceTree.findItemById(id) || DCOSStore.serviceTree;

    // Render service table
    if (item instanceof ServiceTree && item.getItems().length > 0) {
      let {state} = this;
      let services = item.getItems();
      let filteredServices = item.filterItemsByFilter({
        health: state.filterHealth,
        name: state.searchString
      }).getItems();

      return (
        <div className="flex-box flush flex-mobile-column">
          <ServiceSidebarFilters
            handleFilterChange={this.handleFilterChange}
            services={services} />
          <div className="flex-grow">
            <FilterHeadline
              inverseStyle={true}
              onReset={this.resetFilter}
              name="Services"
              currentLength={filteredServices.length}
              totalLength={services.length} />
            <ServiceSearchFilter
              handleFilterChange={this.handleFilterChange} />
            <ServicesTable
              services={filteredServices} />
          </div>
          <SidePanels
            params={this.props.params}
            openedPage="services"/>
        </div>
      );
    }

    // Render service detail
    if (item instanceof Service) {
      return (<ServiceDetail service={item} />);
    }

    // Render empty panel
    return (
      <AlertPanel
        title="No Services Installed"
        iconClassName="icon icon-sprite icon-sprite-jumbo
          icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush-bottom">
          Use the {Config.productName} command line tools to find and install
          services.
        </p>
      </AlertPanel>
    );
  },

  render: function () {
    let {id} = this.props.params;

    return this.getContents(decodeURIComponent(id));
  }

});

module.exports = ServicesTab;
