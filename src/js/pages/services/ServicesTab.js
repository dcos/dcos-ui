import React from 'react';
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import DCOSStore from '../../stores/DCOSStore';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import QueryParamsMixin from '../../mixins/QueryParamsMixin';
import SaveStateMixin from '../../mixins/SaveStateMixin';
import {
  SERVICE_FORM_MODAL,
  SERVICE_GROUP_FORM_MODAL
} from '../../constants/ModalKeys';
import Service from '../../structs/Service';
import ServiceDetail from '../../components/ServiceDetail';
import ServiceFilterTypes from '../../constants/ServiceFilterTypes';
import ServiceFormModal from '../../components/modals/ServiceFormModal';
import ServiceSearchFilter from '../../components/ServiceSearchFilter';
import ServiceSidebarFilters from '../../components/ServiceSidebarFilters';
import ServicesBreadcrumb from '../../components/ServicesBreadcrumb';
import ServiceGroupFormModal from '../../components/modals/ServiceGroupFormModal';
import ServicesTable from '../../components/ServicesTable';
import ServiceTree from '../../structs/ServiceTree';
import SidebarActions from '../../events/SidebarActions';
import SidePanels from '../../components/SidePanels';

var DEFAULT_FILTER_OPTIONS = {
  filterHealth: null,
  filterStatus: null,
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
    return Object.assign({}, DEFAULT_FILTER_OPTIONS, {
      isServiceGroupFormModalShown: false,
      isServiceFormModalShown: false
    });
  },

  componentWillMount: function () {
    this.store_listeners = [{name: 'dcos', events: ['change']}];
  },

  componentDidMount: function () {
    let {state} = this;
    Object.keys(DEFAULT_FILTER_OPTIONS).forEach((saveStateKey) => {
      const queryParams = this.getQueryParamObject();
      let saveStateValue = state[saveStateKey];
      if (saveStateValue !== queryParams[saveStateKey]) {
        this.setQueryParam(saveStateKey, saveStateValue);
      }
    });
  },

  handleCloseServiceFormModal: function () {
    this.setState({isServiceFormModalShown: false});
  },

  handleCloseGroupFormModal: function () {
    this.setState({isServiceGroupFormModalShown: false});
  },

  handleFilterChange: function (filterValues, filterType) {
    var stateChanges = Object.assign({}, this.state);
    stateChanges[filterType] = filterValues;

    this.setState(stateChanges);
  },

  handleOpenModal: function (id) {
    let modalStates = {
      isServiceFormModalShown: SERVICE_FORM_MODAL === id,
      isServiceGroupFormModalShown: SERVICE_GROUP_FORM_MODAL === id
    };

    this.setState(modalStates);
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

  getAlertPanelFooter: function () {
    return (
      <div className="button-collection flush-bottom">
        <button className="button button-stroke button-inverse"
          onClick={() => this.handleOpenModal(SERVICE_GROUP_FORM_MODAL)}>
          Create Group
        </button>
        <button className="button button-success"
          onClick={() => this.handleOpenModal(SERVICE_FORM_MODAL)}>
          Deploy Service
        </button>
      </div>
    );
  },

  getContents: function (item) {
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

    if (this.props.params.taskID) {
      return (
        <RouteHandler />
      );
    }

    // Render service table
    if (item instanceof ServiceTree && item.getItems().length > 0) {
      return this.getServiceTreeView(item);
    }

    // Render service detail
    if (item instanceof Service) {
      return (<ServiceDetail service={item} />);
    }

    // Render empty panel
    return (
      <div>
        <ServicesBreadcrumb serviceTreeItem={item} />
        <AlertPanel
          title="No Services Deployed"
          footer={this.getAlertPanelFooter()}
          iconClassName="icon icon-sprite icon-sprite-jumbo
          icon-sprite-jumbo-white icon-services flush-top">
          <p className="flush-bottom">
            Create groups to organize your services or
            deploy a new service.
          </p>
        </AlertPanel>
      </div>
    );
  },

  getHeadline: function (item, filteredServices) {
    let {state} = this;
    let services = item.getItems();

    const hasFiltersApplied = Object.keys(DEFAULT_FILTER_OPTIONS)
      .some((filterKey) => {
        return state[filterKey] != null && state[filterKey].length > 0;
      });

    if (hasFiltersApplied) {
      return (
        <FilterHeadline
          inverseStyle={true}
          onReset={this.resetFilter}
          name="Services"
          currentLength={filteredServices.length}
          totalLength={services.length} />
      );
    }

    return (
      <ServicesBreadcrumb serviceTreeItem={item} />
    );
  },

  getServiceTreeView(item) {
    let {state} = this;
    let services = item.getItems();
    let filteredServices = item.filterItemsByFilter({
      health: state.filterHealth,
      status: state.filterStatus,
      id: state.searchString
    }).getItems();

    return (
      <div className="flex-box flush flex-mobile-column">
        <ServiceSidebarFilters
          handleFilterChange={this.handleFilterChange}
          services={services} />
        <div className="flex-grow">
          {this.getHeadline(item, filteredServices)}
          <FilterBar rightAlignLastNChildren={2}>
            <ServiceSearchFilter
              handleFilterChange={this.handleFilterChange} />
            <button className="button button-stroke button-inverse"
              onClick={() => this.handleOpenModal(SERVICE_GROUP_FORM_MODAL)}>
              Create Group
            </button>
            <button className="button button-success"
              onClick={() => this.handleOpenModal(SERVICE_FORM_MODAL)}>
              Deploy Service
            </button>
          </FilterBar>
          <ServicesTable
            services={filteredServices} />
        </div>
        <SidePanels
          params={this.props.params}
          openedPage="services"/>
      </div>
    );
  },

  render: function () {
    let {id} = this.props.params;
    id = decodeURIComponent(id);
    let {state} = this;

    // Find item in root tree and default to root tree if there is no match
    let item = DCOSStore.serviceTree.findItemById(id) || DCOSStore.serviceTree;

    return (
      <div>
        {this.getContents(item)}
        <ServiceGroupFormModal
          open={state.isServiceGroupFormModalShown}
          parentGroupId={item.getId()}
          onClose={this.handleCloseGroupFormModal}/>
        <ServiceFormModal open={state.isServiceFormModalShown}
          onClose={this.handleCloseServiceFormModal}/>
      </div>
    );
  }

});

module.exports = ServicesTab;
