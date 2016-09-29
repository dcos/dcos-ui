import classNames from 'classnames';
import React from 'react';
import {Link, RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Application from '../../structs/Application';
import AlertPanel from '../../components/AlertPanel';
import Breadcrumbs from '../../components/Breadcrumbs';
import DCOSStore from '../../stores/DCOSStore';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import Pod from '../../structs/Pod';
import PodDetail from '../../components/PodDetail';
import QueryParamsMixin from '../../mixins/QueryParamsMixin';
import RequestErrorMsg from '../../components/RequestErrorMsg';
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
    willTransitionTo() {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return Object.assign({}, DEFAULT_FILTER_OPTIONS, {
      marathonErrorCount: 0,
      isServiceGroupFormModalShown: false,
      isServiceFormModalShown: false
    });
  },

  componentWillMount() {
    this.store_listeners = [
      {
        name: 'dcos', events: ['change'],
        suppressUpdate: false
      },
      {
        name: 'marathon',
        events: ['groupsSuccess', 'groupsError'],
        suppressUpdate: true
      }
    ];
  },

  componentDidMount() {
    let {state} = this;
    Object.keys(DEFAULT_FILTER_OPTIONS).forEach((saveStateKey) => {
      const queryParams = this.getQueryParamObject();
      let saveStateValue = state[saveStateKey];
      if (saveStateValue !== queryParams[saveStateKey]) {
        this.setQueryParam(saveStateKey, saveStateValue);
      }
    });
  },

  componentWillReceiveProps() {
    const queryParams = this.getQueryParamObject();
    const {state} = this;

    // Reset filter defaults when query params are deleted externally
    Object.keys(DEFAULT_FILTER_OPTIONS).forEach((stateKey) => {
      if (queryParams[stateKey] == null &&
        (state[stateKey] != null && state[stateKey].length > 0)) {
        this.setState({
          [stateKey]: DEFAULT_FILTER_OPTIONS[stateKey]
        });
      }
    });
  },

  onMarathonStoreGroupsError() {
    this.setState({marathonErrorCount: this.state.marathonErrorCount + 1});
  },

  onMarathonStoreGroupsSuccess() {
    // Updating state on every success is costly
    if (this.state.marathonErrorCount !== 0) {
      this.setState({marathonErrorCount: 0});
    }
  },

  handleCloseServiceFormModal() {
    this.setState({isServiceFormModalShown: false});
  },

  handleCloseGroupFormModal() {
    this.setState({isServiceGroupFormModalShown: false});
  },

  handleFilterChange(filterValues, filterType) {
    var stateChanges = Object.assign({}, this.state);
    stateChanges[filterType] = filterValues;

    this.setState(stateChanges);
  },

  handleOpenModal(id) {
    let modalStates = {
      isServiceFormModalShown: SERVICE_FORM_MODAL === id,
      isServiceGroupFormModalShown: SERVICE_GROUP_FORM_MODAL === id
    };

    this.setState(modalStates);
  },

  resetFilterQueryParams() {
    let router = this.context.router;
    let queryParams = router.getCurrentQuery();

    Object.values(ServiceFilterTypes).forEach(function (filterKey) {
      delete queryParams[filterKey];
    });

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  resetFilter() {
    var state = Object.assign({}, this.state, DEFAULT_FILTER_OPTIONS);
    this.setState(state, this.resetFilterQueryParams);
  },

  getAlertPanelFooter() {
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

  getNotFoundFooter() {
    return (
      <Link to="services-page" className="button button-stroke button-inverse">
        Go back to Services Page
      </Link>
    );
  },

  getServiceNotFound(id) {
    return (
      <AlertPanel
        title="Not Found"
        footer={this.getNotFoundFooter()}
        icon={<Icon id="services" color="neutral" size="jumbo" />}>
        <p className="flush-bottom">
          {`Service '${id}' was not found.`}
        </p>
      </AlertPanel>
    );
  },

  getContents(item) {
    if (this.state.marathonErrorCount > 3) {
      return (
        <div className="container container-pod">
          <RequestErrorMsg />
        </div>
      );
    }

    // Render loading screen
    if (!DCOSStore.dataProcessed) {
      return (
        <div className="container container-fluid container-pod">
          <Loader className="inverse" />
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

    // Render Pod detail
    if (item instanceof Pod) {
      return (<PodDetail pod={item} />);
    }

    // Render service detail
    if (item instanceof Service) {
      return (<ServiceDetail service={item} />);
    }

    // Render service table or empty service table if only id is available
    if ((item instanceof ServiceTree && item.getItems().length > 0) || id) {
      return this.getServiceTreeView(item);
    }

    // Render empty root panel
    return (
      <div>
        <AlertPanel
          title="No Services Deployed"
          footer={this.getAlertPanelFooter()}
          icon={<Icon id="services" color="neutral" size="jumbo" />}>
          <p className="flush-bottom">
            Create groups to organize your services or
            deploy a new service.
          </p>
        </AlertPanel>
      </div>
    );
  },

  getHeadline(services, filteredServices, hasFiltersApplied) {
    if (this.state.searchString) {
      return (
        <ul className="filter-headline list list-unstyled list-inline h4 flush-top flush-left">
          <li className="flush">
            Showing results for "{this.state.searchString}"
          </li>
          <li className="clickable flush-top" onClick={this.resetFilter}>
            <a className="small flush">
              (Clear)
            </a>
          </li>
        </ul>
      );
    }

    if (hasFiltersApplied) {
      return (
        <FilterHeadline
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

    if (state.searchString) {
      serviceTree = DCOSStore.serviceTree.filterItemsByFilter({
        id: state.searchString
      });
    }

    let allServices = serviceTree.flattenItems().getItems();
    let filteredServices = serviceTree.getItems();

    if (hasFiltersApplied) {
      filteredServices = serviceTree.filterItemsByFilter({
        health: state.filterHealth,
        labels: state.filterLabels,
        other: state.filterOther,
        status: state.filterStatus
      });

      if (!state.searchString) {
        filteredServices = filteredServices.flattenItems();
      }

      filteredServices = filteredServices.getItems();
    }

    return (
      <div className="flex">
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

  render() {
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
          service={new Application({id: serviceId})}
          onClose={this.handleCloseServiceFormModal}/>
      </div>
    );
  }

});

ServicesTab.routeConfig = {
  label: 'Services',
  matches: /^\/services\/overview/
};

module.exports = ServicesTab;
