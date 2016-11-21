import {DCOSStore} from 'foundation-ui';
import React, {PropTypes} from 'react';
import {routerShape} from 'react-router';

import ActionKeys from '../../constants/ActionKeys';
import MarathonActions from '../../events/MarathonActions';
import Pod from '../../structs/Pod';
import PodDetail from '../pod-detail/PodDetail';
import Service from '../../structs/Service';
import ServiceActionItem from '../../constants/ServiceActionItem';
import ServiceDetail from '../service-detail/ServiceDetail';
import ServiceItemNotFound from '../../components/ServiceItemNotFound';
import ServiceModals from '../../components/modals/ServiceModals';
import ServicesUtil from '../../utils/ServicesUtil';
import ServiceTree from '../../structs/ServiceTree';
import ServiceTreeView from './ServiceTreeView';

import AppDispatcher from '../../../../../../src/js/events/AppDispatcher';
import ContainerUtil from '../../../../../../src/js/utils/ContainerUtil';
import Icon from '../../../../../../src/js/components/Icon';
import Loader from '../../../../../../src/js/components/Loader';
import RequestErrorMsg from '../../../../../../src/js/components/RequestErrorMsg';

import {
  DCOS_CHANGE
} from '../../../../../../src/js/constants/EventTypes';

import {
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,

  REQUEST_MARATHON_GROUP_CREATE_ERROR,
  REQUEST_MARATHON_GROUP_CREATE_SUCCESS,

  REQUEST_MARATHON_GROUP_DELETE_ERROR,
  REQUEST_MARATHON_GROUP_DELETE_SUCCESS,

  REQUEST_MARATHON_GROUP_EDIT_ERROR,
  REQUEST_MARATHON_GROUP_EDIT_SUCCESS,

  REQUEST_MARATHON_SERVICE_CREATE_ERROR,
  REQUEST_MARATHON_SERVICE_CREATE_SUCCESS,

  REQUEST_MARATHON_SERVICE_DELETE_ERROR,
  REQUEST_MARATHON_SERVICE_DELETE_SUCCESS,

  REQUEST_MARATHON_SERVICE_EDIT_ERROR,
  REQUEST_MARATHON_SERVICE_EDIT_SUCCESS,

  REQUEST_MARATHON_SERVICE_RESTART_ERROR,
  REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
} from '../../constants/ActionTypes';

import {
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_DEPLOYMENTS_ERROR,

  MARATHON_GROUPS_CHANGE,
  MARATHON_GROUPS_ERROR,

  MARATHON_QUEUE_CHANGE,
  MARATHON_QUEUE_ERROR,

  MARATHON_SERVICE_VERSIONS_CHANGE,
  MARATHON_SERVICE_VERSIONS_ERROR
} from '../../constants/EventTypes';

/**
 * Increments error count for each fetch type when we have a request error and
 * resets to zero when fetch was successful for type
 * @param  {Object} fetchErrors
 * @param  {Object} action
 * @return {Object} updated fetch errors
 */
function countFetchErrors(fetchErrors, action) {

  switch (action.type) {
    case MARATHON_DEPLOYMENTS_ERROR:
    case MARATHON_GROUPS_ERROR:
    case MARATHON_QUEUE_ERROR:
    case MARATHON_SERVICE_VERSIONS_ERROR:
      fetchErrors[action.type] = (fetchErrors[action.type] || 0) + 1;

      return fetchErrors;

    case MARATHON_DEPLOYMENTS_CHANGE:
    case MARATHON_GROUPS_CHANGE:
    case MARATHON_QUEUE_CHANGE:
    case MARATHON_SERVICE_VERSIONS_CHANGE:
      fetchErrors[action.type] = 0;

      return fetchErrors;

    default:
      return false;
  }
};

// Query parameters that need to be converted from
// Array[String] to Array[Int]
const INTEGER_QUERY_ARRAYS = [
  'filterStatus',
  'filterHealth',
  'filterOther'
];

const METHODS_TO_BIND = [
  'handleServerAction',
  'handleFilterChange',
  'handleModalClose',
  'clearActionError',
  'clearFilters',
  'createGroup',
  'revertDeployment',
  'deleteGroup',
  'editGroup',
  'createService',
  'deleteService',
  'editService',
  'restartService',
  'onStoreChange',
  'setQueryParams'
];

class ServicesContainer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionErrors: {},
      fetchErrors: {},
      filters: {},
      isLoading: true,
      lastUpdate: 0,
      pendingActions: {}
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    DCOSStore.addChangeListener(DCOS_CHANGE, this.onStoreChange);

    // Listen for server actions so we can update state immediately
    // on the completion of an API request.
    this.dispatcher = AppDispatcher.register(this.handleServerAction);
  }

  componentWillMount() {
    this.propsToState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.propsToState(nextProps);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this.dispatcher);

    DCOSStore.removeChangeListener(DCOS_CHANGE, this.onStoreChange);
  }

  getChildContext() {
    return {
      modalHandlers: this.getModalHandlers()
    };
  }

  propsToState(props) {
    const itemId = decodeURIComponent(props.params.id || '/');
    const filters = this.getFiltersFromQuery(props.location.query);

    this.setState({
      itemId,
      filters
    });
  }

  onStoreChange() {
    // Throttle updates from DCOSStore
    if (Date.now() - this.state.lastUpdate > 1000
      || (!!DCOSStore.dataProcessed && this.state.isLoading)) {

      this.setState({
        isLoading: !(!!DCOSStore.dataProcessed),
        lastUpdate: Date.now()
      });
    }
  }

  revertDeployment() {
    this.setPendingAction(ActionKeys.REVERT_DEPLOYMENT);

    return MarathonActions.revertDeployment(...arguments);
  }

  createGroup() {
    this.setPendingAction(ActionKeys.GROUP_CREATE);

    return MarathonActions.createGroup(...arguments);
  }

  deleteGroup() {
    this.setPendingAction(ActionKeys.GROUP_DELETE);

    return MarathonActions.deleteGroup(...arguments);
  }

  editGroup() {
    this.setPendingAction(ActionKeys.GROUP_EDIT);

    return MarathonActions.editGroup(...arguments);
  }

  createService() {
    this.setPendingAction(ActionKeys.SERVICE_CREATE);

    return MarathonActions.createService(...arguments);
  }

  deleteService() {
    this.setPendingAction(ActionKeys.SERVICE_DELETE);

    return MarathonActions.deleteService(...arguments);
  }

  editService() {
    this.setPendingAction(ActionKeys.SERVICE_EDIT);

    return MarathonActions.editService(...arguments);
  }

  restartService() {
    this.setPendingAction(ActionKeys.SERVICE_RESTART);

    return MarathonActions.restartService(...arguments);
  }

  handleServerAction(payload) {
    const {action} = payload;

    // Increment/clear fetching errors based on action
    const fetchErrors = countFetchErrors(
      Object.assign({}, this.state.fetchErrors), action
    );

    // Only set state if fetchErrors changed
    if (fetchErrors) {
      this.setState({fetchErrors});
    }

    switch (action.type) {
      case REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR:
        this.unsetPendingAction(ActionKeys.REVERT_DEPLOYMENT, action.data);
        break;
      case REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS:
        this.unsetPendingAction(ActionKeys.REVERT_DEPLOYMENT);
        break;

      case REQUEST_MARATHON_GROUP_CREATE_ERROR:
        this.unsetPendingAction(ActionKeys.GROUP_CREATE, action.data);
        break;
      case REQUEST_MARATHON_GROUP_CREATE_SUCCESS:
        this.unsetPendingAction(ActionKeys.GROUP_CREATE);
        break;

      case REQUEST_MARATHON_GROUP_DELETE_ERROR:
        this.unsetPendingAction(ActionKeys.GROUP_DELETE, action.data);
        break;
      case REQUEST_MARATHON_GROUP_DELETE_SUCCESS:
        this.unsetPendingAction(ActionKeys.GROUP_DELETE);
        break;

      case REQUEST_MARATHON_GROUP_EDIT_ERROR:
        this.unsetPendingAction(ActionKeys.GROUP_EDIT, action.data);
        break;
      case REQUEST_MARATHON_GROUP_EDIT_SUCCESS:
        this.unsetPendingAction(ActionKeys.GROUP_EDIT);
        break;

      case REQUEST_MARATHON_SERVICE_CREATE_ERROR:
        this.unsetPendingAction(ActionKeys.SERVICE_CREATE, action.data);
        break;
      case REQUEST_MARATHON_SERVICE_CREATE_SUCCESS:
        this.unsetPendingAction(ActionKeys.SERVICE_CREATE);
        break;

      case REQUEST_MARATHON_SERVICE_DELETE_ERROR:
        this.unsetPendingAction(ActionKeys.SERVICE_DELETE, action.data);
        break;
      case REQUEST_MARATHON_SERVICE_DELETE_SUCCESS:
        this.unsetPendingAction(ActionKeys.SERVICE_DELETE);
        break;

      case REQUEST_MARATHON_SERVICE_EDIT_ERROR:
        this.unsetPendingAction(ActionKeys.SERVICE_EDIT, action.data);
        break;
      case REQUEST_MARATHON_SERVICE_EDIT_SUCCESS:
        this.unsetPendingAction(ActionKeys.SERVICE_EDIT);
        break;

      case REQUEST_MARATHON_SERVICE_RESTART_ERROR:
        this.unsetPendingAction(ActionKeys.SERVICE_RESTART, action.data);
        break;
      case REQUEST_MARATHON_SERVICE_RESTART_SUCCESS:
        this.unsetPendingAction(ActionKeys.SERVICE_RESTART);
        break;
    }
  }

  handleModalClose(key) {
    if (key) {
      this.clearActionError(key);
    }
    this.setState({modal: {}});
  }

  handleFilterChange(filterType, filterValue) {
    const filters = Object.assign(
      {},
      this.state.filters,
      {[filterType]: filterValue}
    );

    // Delete filter key if value is null
    if (!filterValue || !filterValue.length) {
      delete filters[filterType];
    }

    this.setState({filters}, this.setQueryParams);
  }

  getFiltersFromQuery(query) {
    return Object.keys(query).reduce(function (memo, filterKey) {
      const value = query[filterKey];

      const mapToInts = INTEGER_QUERY_ARRAYS.includes(filterKey)
        && Array.isArray(value);

      if (value != null && value.length > 0) {
        if (mapToInts) {
          // Our ServiceTree filtering and SidebarFilter components
          // expect Arrays of Int's
          memo[filterKey] = value.map(function (val) {
            return parseInt(val, 10);
          });
        } else {
          memo[filterKey] = value;
        }
      }

      if (filterKey === 'filterLabels') {
        try {
          memo[filterKey] = value.map(function (label) {
            const [key, val] = label.split(';');

            return {key, value: val};
          });
        } catch (e) {
          // Delete so filters cannot be tempted to use in a broken state
          delete memo[filterKey];
        }
      }

      return memo;
    }, {});
  }

  fetchData() {
    // Re-fetch data - this will end up being a single Relay request
  }
  /**
   * Sets the actionType to pending in state which will in turn be pushed
   * to children components as a prop. Also clears any existing error for
   * the actionType
   * @param {String} actionType
   */
  setPendingAction(actionType) {
    const {actionErrors, pendingActions} = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors, actionType, null
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions, actionType, true
      )
    });
  }
  /**
   * Sets the pending actionType to false in state which will in turn be
   * pushed down to children via props. Can optional set an error for the
   * actionType
   * @param  {String} actionType
   * @param  {Any} error
   */
  unsetPendingAction(actionType, error = null) {
    const {actionErrors, pendingActions} = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors, actionType, error
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions, actionType, false
      )
    });

    // Fetch new data if action was successful
    if (!error) {
      this.fetchData();
    }
  }

  clearActionError(actionType) {
    const {actionErrors} = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors, actionType, null
      )
    });
  }

  clearFilters() {
    this.setState({filters: {}}, this.setQueryParams);
  }

  setQueryParams() {
    const {router} = this.context;
    const {location: {pathname}} = this.props;
    let filters = Object.assign({}, this.state.filters);
    // Transform labels filter so it is easily decoded again
    if (filters.filterLabels) {
      filters.filterLabels = filters.filterLabels.map(function (label) {
        return `${label.key};${label.value}`;
      });
    }

    router.push({pathname, query: filters});
  }

  getModalHandlers() {
    const set = (id, props) => {
      // Set props to be passed into modal
      this.setState({
        modal: Object.assign({}, props, {id})
      });
    };

    return {
      createGroup: () => set(ServiceActionItem.CREATE_GROUP),
      createService: () => set(ServiceActionItem.CREATE),
      editService: (props) => set(ServiceActionItem.EDIT, props),
      // All methods below work on ServiceTree and Service types
      deleteService: (props) => set(ServiceActionItem.DESTROY, props),
      restartService: (props) => set(ServiceActionItem.RESTART, props),
      scaleService: (props) => set(ServiceActionItem.SCALE, props),
      suspendService: (props) => set(ServiceActionItem.SUSPEND, props)
    };
  }

  getActions() {
    return {
      revertDeployment: this.revertDeployment,
      createGroup: this.createGroup,
      deleteGroup: this.deleteGroup,
      editGroup: this.editGroup,
      createService: this.createService,
      deleteService: this.deleteService,
      editService: this.editService,
      restartService: this.restartService
    };
  }

  getServices(serviceTree) {
    const {filters} = this.state;

    if (filters.searchString) {
      serviceTree = serviceTree.filterItemsByFilter({
        id: filters.searchString
      });
    }

    const all = serviceTree.flattenItems().getItems();
    const countByFilter = ServicesUtil.getCountByType(all);

    let filtered = serviceTree.getItems();

    if (Object.keys(filters).length
      && !(Object.keys(filters).length === 1 && filters.searchString)) {

      filtered = serviceTree.filterItemsByFilter({
        health: filters.filterHealth,
        labels: filters.filterLabels,
        other: filters.filterOther,
        status: filters.filterStatus
      });

      if (!filters.searchString) {
        filtered = filtered.flattenItems();
      }
      filtered = filtered.getItems();
    }

    return {
      all,
      countByFilter,
      filtered
    };
  }

  getModals(service) {
    let modalProps = Object.assign({}, this.state.modal);

    if (!modalProps.service) {
      modalProps.service = service;
    }

    return (
      <ServiceModals
        actions={this.getActions()}
        actionErrors={this.state.actionErrors}
        clearError={this.clearActionError}
        onClose={this.handleModalClose}
        pendingActions={this.state.pendingActions}
        modalProps={modalProps} />
    );
  }

  render() {
    // TODO react-router: Temp hack if we are deeper than overview/:id we should render child routes
    if (Object.keys(this.props.params).length > 1) {
      return this.props.children;
    }

    const {
      fetchErrors,
      filters,
      isLoading,
      itemId
    } = this.state;

    let item;
    // Find item in root tree
    if (itemId === '/') {
      item = DCOSStore.serviceTree;
    } else {
      item = DCOSStore.serviceTree.findItemById(itemId);
    }

    // Check if a single endpoint has failed more than 3 times
    const fetchError = Object.values(fetchErrors).some(function (errorCount) {
      return errorCount > 3;
    });

    // Still Loading
    if (isLoading) {
      return <Loader />;
    }

    // API Failures
    if (fetchError) {
      return <RequestErrorMsg />;
    }

    if (item instanceof Pod) {
      return (
        <div>
          <PodDetail
            actions={this.getActions()}
            pod={item} />
          {this.getModals(item)}
        </div>
      );
    }

    if (item instanceof Service) {
      return (
        <div>
          <ServiceDetail
            actions={this.getActions()}
            params={this.props.params}
            routes={this.props.routes}
            service={item} />
          {this.getModals(item)}
        </div>
      );
    }

    // Show Tree
    if (item instanceof ServiceTree) {
      const {
        all,
        countByFilter,
        filtered
      } = this.getServices(item);

      const services = {
        all,
        countByFilter,
        filtered,
        filters
      };

      return (
        <div>
          <ServiceTreeView
            clearFilters={this.clearFilters}
            handleFilterChange={this.handleFilterChange}
            params={this.props.params}
            routes={this.props.routes}
            services={services}
            serviceTree={item} />
          {this.getModals(item)}
        </div>
      );
    }
    // Not found
    return (
      <ServiceItemNotFound
        message={`Service '${itemId}' was not found.`} />
    );
  }
}

// Make these modal handlers available via context
// so any child can trigger the opening of modals
ServicesContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func,
    createService: PropTypes.func,
    editService: PropTypes.func,
    deleteService: PropTypes.func,
    restartService: PropTypes.func,
    scaleService: PropTypes.func,
    suspendService: PropTypes.func
  })
};

ServicesContainer.propTypes = {
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

ServicesContainer.contextTypes = {
  router: routerShape
};

ServicesContainer.routeConfig = {
  label: 'Services',
  icon: <Icon id="services-inverse" size="small" family="small" />,
  matches: /^\/services\/overview/
};

module.exports = ServicesContainer;
