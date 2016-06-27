import classNames from 'classnames';
import React from 'react';
import {Link, RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import Breadcrumbs from '../../components/Breadcrumbs';
import DCOSStore from '../../stores/DCOSStore';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import Icon from '../../components/Icon';
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
import ServiceGroupFormModal from '../../components/modals/ServiceGroupFormModal';
import ServicesTable from '../../components/ServicesTable';
import ServiceTree from '../../structs/ServiceTree';
import SidebarActions from '../../events/SidebarActions';

var DEFAULT_FILTER_OPTIONS = {
  filterHealth: null,
  filterOther: null,
  filterStatus: null,
  filterLabels: null,
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
    this.store_listeners = [
      {name: 'dcos', events: ['change']}
    ];
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

  getNotFoundFooter: function () {
    return (
      <Link to="services-page" className="button button-stroke button-inverse">
        Go back to Services Page
      </Link>
    );
  },

  getServiceNotFound: function (id) {
    return (
      <AlertPanel
        title="Not Found"
        footer={this.getNotFoundFooter()}
        icon={<Icon id="services" color="white" size="jumbo" />}>
        <p className="flush-bottom">
          {`Service '${id}' was not found.`}
        </p>
      </AlertPanel>
    );
  },

  getContents: function (item) {
    // Render loading screen
    if (!DCOSStore.dataProcessed) {
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

    let {id} = this.props.params;
    id = id && decodeURIComponent(id);
    let itemFound = !!DCOSStore.serviceTree.findItemById(id);
    if (id && this.props.params.id !== '/' && !itemFound) {
      return this.getServiceNotFound(id);
    }

    // TODO (DCOS-7580): Clean up ServicesTab routed and unrouted views
    if (this.props.params.taskID || this.props.params.volumeID) {
      return (
        <RouteHandler service={item} />
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
        <Breadcrumbs />
        <AlertPanel
          title="No Services Deployed"
          footer={this.getAlertPanelFooter()}
          icon={<Icon id="services" color="white" size="jumbo" />}>
          <p className="flush-bottom">
            Create groups to organize your services or
            deploy a new service.
          </p>
        </AlertPanel>
      </div>
    );
  },

  getHeadline: function (services, filteredServices, hasFiltersApplied) {
    if (hasFiltersApplied) {
      return (
        <FilterHeadline
          inverseStyle={true}
          onReset={this.resetFilter}
          name="Service"
          currentLength={filteredServices.length}
          totalLength={services.length} />
      );
    }

    return (
      <Breadcrumbs />
    );
  },

  getServiceTreeView(serviceTree) {
    const {state} = this;
    const hasFiltersApplied = Object.keys(DEFAULT_FILTER_OPTIONS)
      .some(function (filterKey) {
        return state[filterKey] != null && state[filterKey].length > 0;
      });

    let allServices = serviceTree.flattenItems().getItems();
    let filteredServices = serviceTree.getItems();

    if (hasFiltersApplied) {
      filteredServices = serviceTree.filterItemsByFilter({
        health: state.filterHealth,
        labels: state.filterLabels,
        other: state.filterOther,
        status: state.filterStatus,
        id: state.searchString
      }).flattenItems().getItems();
    }

    return (
      <div className="flex-box flush flex-mobile-column">
        <ServiceSidebarFilters
          handleFilterChange={this.handleFilterChange}
          services={allServices} />
        <div className="flex-grow">
          {this.getHeadline(allServices, filteredServices, hasFiltersApplied)}
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
          <ServicesTable services={filteredServices}
            isFiltered={hasFiltersApplied} />
        </div>
      </div>
    );
  },

  render: function () {
    let {id} = this.props.params;
    id = decodeURIComponent(id);
    let {state} = this;

    // Find item in root tree
    let item = DCOSStore.serviceTree.findItemById(id) || DCOSStore.serviceTree;

    // The regular expression `/^(\/.+)$/` is looking for the beginning of the
    // string and matches if the string starts with a `/` and does contain more
    // characters after the slash. This is combined into a group and then
    // replaced with the first group which is the complete string and a `/` is
    // appended. This is needed because in most case a path like
    // `/group/another-group` will be given by `getId` except on root then the
    // return value of `getId` would be `/` so in most cases we want to append a
    // `/` so that the user can begin typing the `id` of their application.
    let serviceId = item.getId().replace(/^(\/.+)$/, '$1/');

    // Make sure to grow when logs are displayed
    let routes = this.context.router.getCurrentRoutes();
    let classes = classNames({
      'flex-container-col flex-grow flex-shrink': routes[routes.length - 1].dontScroll
    });

    return (
      <div className={classes}>
        {this.getContents(item)}
        <ServiceGroupFormModal
          open={state.isServiceGroupFormModalShown}
          parentGroupId={item.getId()}
          onClose={this.handleCloseGroupFormModal}/>
        <ServiceFormModal open={state.isServiceFormModalShown}
          id={serviceId}
          onClose={this.handleCloseServiceFormModal}/>
      </div>
    );
  }

});

module.exports = ServicesTab;
