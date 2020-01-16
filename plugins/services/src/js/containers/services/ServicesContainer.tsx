import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { DataLayerType } from "@extension-kid/data-layer";
import { NotificationServiceType } from "@extension-kid/notification-service";
import {
  ToastNotification,
  ToastAppearance
} from "@extension-kid/toast-notifications";
import gql from "graphql-tag";
import { map } from "rxjs/operators";

import { DCOS_CHANGE } from "#SRC/js/constants/EventTypes";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import ContainerUtil from "#SRC/js/utils/ContainerUtil";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import DSLExpression from "#SRC/js/structs/DSLExpression";

import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import {
  REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR
} from "#SRC/js/constants/ActionTypes";
import container from "#SRC/js/container";
import { TYPES } from "#SRC/js/types/containerTypes";

import ActionKeys from "../../constants/ActionKeys";
import MarathonActions from "../../events/MarathonActions";
import ServiceActions from "../../events/ServiceActions";
import Pod from "../../structs/Pod";
import PodDetail from "../pod-detail/PodDetail";
import Service from "../../structs/Service";
import { ServiceActionItem } from "../../constants/ServiceActionItem";
import ServiceAttributeHasVolumesFilter from "../../filters/ServiceAttributeHasVolumesFilter";
import ServiceAttributeHealthFilter from "../../filters/ServiceAttributeHealthFilter";
import ServiceAttributeIsFilter from "../../filters/ServiceAttributeIsFilter";
import ServiceAttributeIsPodFilter from "../../filters/ServiceAttributeIsPodFilter";
import ServiceAttributeIsCatalogFilter from "../../filters/ServiceAttributeIsCatalogFilter";
import ServiceAttributeNoHealthchecksFilter from "../../filters/ServiceAttributeNoHealthchecksFilter";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceDetail from "../service-detail/ServiceDetail";
import ServiceItemNotFound from "../../components/ServiceItemNotFound";
import ServiceModals from "../../components/modals/ServiceModals";
import ServiceNameTextFilter from "../../filters/ServiceNameTextFilter";
import ServiceTree from "../../structs/ServiceTree";
import ServiceTreeView from "./ServiceTreeView";
import ServicesQuotaView from "./ServicesQuotaView";

import {
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_ERROR,
  REQUEST_MARATHON_DEPLOYMENT_ROLLBACK_SUCCESS,
  REQUEST_MARATHON_GROUP_CREATE_ERROR,
  REQUEST_MARATHON_GROUP_CREATE_SUCCESS,
  REQUEST_MARATHON_GROUP_DELETE_ERROR,
  REQUEST_MARATHON_GROUP_DELETE_SUCCESS,
  REQUEST_MARATHON_GROUP_EDIT_ERROR,
  REQUEST_MARATHON_GROUP_EDIT_SUCCESS,
  REQUEST_MARATHON_SERVICE_DELETE_ERROR,
  REQUEST_MARATHON_SERVICE_DELETE_SUCCESS,
  REQUEST_MARATHON_SERVICE_EDIT_ERROR,
  REQUEST_MARATHON_SERVICE_EDIT_SUCCESS,
  REQUEST_MARATHON_SERVICE_RESET_DELAY_ERROR,
  REQUEST_MARATHON_SERVICE_RESET_DELAY_SUCCESS,
  REQUEST_MARATHON_SERVICE_RESTART_ERROR,
  REQUEST_MARATHON_SERVICE_RESTART_SUCCESS
} from "../../constants/ActionTypes";

import {
  MARATHON_DEPLOYMENTS_CHANGE,
  MARATHON_DEPLOYMENTS_ERROR,
  MARATHON_GROUPS_CHANGE,
  MARATHON_GROUPS_ERROR,
  MARATHON_QUEUE_CHANGE,
  MARATHON_QUEUE_ERROR,
  MARATHON_SERVICE_VERSIONS_CHANGE,
  MARATHON_SERVICE_VERSIONS_ERROR
} from "../../constants/EventTypes";

const SERVICE_FILTERS = [
  new ServiceAttributeHealthFilter(),
  new ServiceAttributeHasVolumesFilter(),
  new ServiceAttributeIsFilter(),
  new ServiceAttributeIsPodFilter(),
  new ServiceAttributeIsCatalogFilter(),
  new ServiceAttributeNoHealthchecksFilter(),
  new ServiceNameTextFilter()
];

const dl = container.get(DataLayerType);
const notificationService = container.get(NotificationServiceType);

function i18nTranslate(id, values) {
  const i18n = container.get(TYPES.I18n);
  if (i18n) {
    return i18n._(id, values);
  }
  return id;
}

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
}

function getMesosRoles$() {
  return dl
    .query(
      gql`
        query {
          roles
        }
      `,
      {}
    )
    .pipe(map(result => result.data.roles));
}

class ServicesContainer extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      actionErrors: {},
      fetchErrors: {},
      filterExpression: new DSLExpression(),
      isLoading: true,
      lastUpdate: 0,
      pendingActions: {},
      roles: []
    };

    // This is so we get notified when the serviceTree is ready in DCOSStore. Making this a promise would be nice.
    DCOSStore.on(DCOS_CHANGE, () => {
      if (this.state.isLoading) {
        this.forceUpdate();
      }
    });
    this.onStoreChange();
  }

  componentDidMount() {
    DCOSStore.addChangeListener(DCOS_CHANGE, this.onStoreChange);

    // Listen for server actions so we can update state immediately
    // on the completion of an API request.
    this.dispatcher = AppDispatcher.register(this.handleServerAction);
    const roles$ = getMesosRoles$();
    if (roles$) {
      this.rolesSub = roles$.subscribe(roles => {
        this.setState({ roles });
      });
    }
  }

  UNSAFE_componentWillMount() {
    this.propsToState(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.propsToState(nextProps);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this.dispatcher);

    DCOSStore.removeChangeListener(DCOS_CHANGE, this.onStoreChange);

    if (this.rolesSub) {
      this.rolesSub.unsubscribe();
    }
  }

  getChildContext() {
    return {
      modalHandlers: this.getModalHandlers()
    };
  }

  propsToState(props) {
    const itemId = decodeURIComponent(props.params.id || "/");
    const filterQuery = props.location.query.q || "";

    this.setState({
      filterExpression: new DSLExpression(filterQuery),
      itemId
    });
  }
  onStoreChange = () => {
    // Throttle updates from DCOSStore
    if (
      Date.now() - this.state.lastUpdate > 1000 ||
      (DCOSStore.serviceDataReceived && this.state.isLoading)
    ) {
      this.setState({
        isLoading: !DCOSStore.serviceDataReceived,
        lastUpdate: Date.now()
      });
    }
  };
  revertDeployment = (...args) => {
    this.setPendingAction(ActionKeys.REVERT_DEPLOYMENT);

    return MarathonActions.revertDeployment(...args);
  };
  createGroup = (...args) => {
    this.setPendingAction(ActionKeys.GROUP_CREATE);

    return MarathonActions.createGroup(...args);
  };
  deleteGroup = (...args) => {
    this.setPendingAction(ActionKeys.GROUP_DELETE);

    return ServiceActions.deleteGroup(...args);
  };
  editGroup = (...args) => {
    this.setPendingAction(ActionKeys.GROUP_EDIT);

    return MarathonActions.editGroup(...args);
  };
  deleteService = (...args) => {
    this.setPendingAction(ActionKeys.SERVICE_DELETE);

    return ServiceActions.deleteService(...args);
  };
  editService = (...args) => {
    this.setPendingAction(ActionKeys.SERVICE_EDIT);

    return MarathonActions.editService(...args);
  };
  restartService = (...args) => {
    this.setPendingAction(ActionKeys.SERVICE_RESTART);

    return MarathonActions.restartService(...args);
  };
  resetDelayedService = (...args) => {
    this.setPendingAction(ActionKeys.SERVICE_RESET_DELAY);

    return MarathonActions.resetDelayedService(...args);
  };
  handleServerAction = payload => {
    const { action } = payload;

    // Increment/clear fetching errors based on action
    const fetchErrors = countFetchErrors(
      {
        ...this.state.fetchErrors
      },
      action
    );

    // Only set state if fetchErrors changed
    if (fetchErrors) {
      this.setState({ fetchErrors });
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

      case REQUEST_MARATHON_SERVICE_RESET_DELAY_ERROR:
        notificationService.push(
          this.getResetDelayErrorToast(action.serviceName)
        );
        this.unsetPendingAction(ActionKeys.SERVICE_RESET_DELAY, action.data);
        break;
      case REQUEST_MARATHON_SERVICE_RESET_DELAY_SUCCESS:
        notificationService.push(
          this.getResetDelaySuccessToast(action.serviceName)
        );
        this.unsetPendingAction(ActionKeys.SERVICE_RESET_DELAY);
        break;

      case REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS:
        this.unsetPendingAction(ActionKeys.SERVICE_DELETE);
        break;
      case REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR:
        this.unsetPendingAction(ActionKeys.SERVICE_DELETE, action.data);
        break;
    }
  };
  handleModalClose = key => {
    if (key) {
      this.clearActionError(key);
    }
    this.setState({ modal: {} });
  };
  handleFilterExpressionChange = filterExpression => {
    const { router } = this.context;
    const {
      location: { pathname }
    } = this.props;
    router.push({ pathname, query: { q: filterExpression.value } });

    this.setState({ filterExpression });
  };

  /**
   * Sets the actionType to pending in state which will in turn be pushed
   * to children components as a prop. Also clears any existing error for
   * the actionType
   * @param {String} actionType
   */
  setPendingAction(actionType) {
    const { actionErrors, pendingActions } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        null
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions,
        actionType,
        true
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
    const { actionErrors, pendingActions } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        error
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions,
        actionType,
        false
      )
    });
  }
  clearActionError = actionType => {
    const { actionErrors } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        null
      )
    });
  };

  getModalHandlers() {
    const set = (id, props) => {
      // Set props to be passed into modal
      this.setState({
        modal: {
          ...props,
          id
        }
      });
    };

    return {
      createGroup: () => set(ServiceActionItem.CREATE_GROUP),
      openServiceUI(props) {
        window.open(props.service.getWebURL(), "_blank");
      },
      // All methods below (except resetDelayedService) work on ServiceTree and Service types
      deleteService: props => set(ServiceActionItem.DELETE, props),
      editService: props => set(ServiceActionItem.EDIT, props),
      resetDelayedService: props => set(ServiceActionItem.RESET_DELAYED, props),
      restartService: props => set(ServiceActionItem.RESTART, props),
      resumeService: props => set(ServiceActionItem.RESUME, props),
      scaleService: props => set(ServiceActionItem.SCALE, props),
      stopService: props => set(ServiceActionItem.STOP, props)
    };
  }

  getActions() {
    return {
      revertDeployment: this.revertDeployment,
      createGroup: this.createGroup,
      deleteGroup: this.deleteGroup,
      editGroup: this.editGroup,
      deleteService: this.deleteService,
      editService: this.editService,
      resetDelayedService: this.resetDelayedService,
      restartService: this.restartService
    };
  }

  /**
   * This function validates the current modalProps and returns
   * them validated/corrected
   *
   * This function updates the `service` information from DCOSStore -
   * if possible - or deletes the modal `id` from the object - if
   * necessary (effectivly closes the modal, when the respective
   * service got deleted)
   *
   * Depending on the current state `modalProps` need to contain either:
   *
   * - service and id ({ service: Service, id: String })
   *   when the modal `id` is open or should be opened.
   *  when opening the modal, `modalProps.service` is not yet set,
   *  so we have to set it.
   *
   * - only a service ({ service: Service })
   *   when no modal is open or the current modal is to be closed
   *   reson is, that even if no modal is open, they are rendered into
   *   the dom and need a valid service
   *
   * @param {object} props - an object which contains id and a service ("modalProps")
   * @param {ServiceTree} [service] - service information
   * @returns {object} updated and cleaned up modal information (props)
   */
  getCorrectedModalProps(props, service) {
    const modalProps = {
      ...props
    };

    if (!modalProps.service && service) {
      modalProps.service = service;
    }

    if (
      modalProps.service &&
      DCOSStore.serviceTree.findItemById(modalProps.service.id)
    ) {
      modalProps.service = DCOSStore.serviceTree.findItemById(
        modalProps.service.id
      );
    } else if (modalProps.id) {
      delete modalProps.id;
    }

    return modalProps;
  }

  getModals(service) {
    return (
      <ServiceModals
        actions={this.getActions()}
        actionErrors={this.state.actionErrors}
        clearError={this.clearActionError}
        onClose={this.handleModalClose}
        pendingActions={this.state.pendingActions}
        modalProps={this.getCorrectedModalProps(this.state.modal, service)}
      />
    );
  }

  getEmptyPage(itemType) {
    const { itemId } = this.state;

    return (
      <Page>
        <Page.Header breadcrumbs={<ServiceBreadcrumbs />} />
        <ServiceItemNotFound
          message={
            <Trans render="span">
              The {itemType} with the ID of "{itemId}" could not be found.
            </Trans>
          }
        />
      </Page>
    );
  }

  getPodDetail(item) {
    const { children, params, routes } = this.props;

    return (
      <PodDetail
        actions={this.getActions()}
        params={params}
        pod={item}
        routes={routes}
      >
        {children}
        {this.getModals(item)}
      </PodDetail>
    );
  }

  getServiceDetail(item) {
    const { children, params, routes } = this.props;

    return (
      <ServiceDetail
        actions={this.getActions()}
        errors={this.state.actionErrors}
        clearError={this.clearActionError}
        params={params}
        routes={routes}
        service={item}
      >
        {children}
        {this.getModals(item)}
      </ServiceDetail>
    );
  }
  getServiceTree = item => {
    const { children, params, routes } = this.props;
    const { filterExpression, roles } = this.state;

    const isEmpty = item.getItems().length === 0;
    let filteredServices = item;

    if (filterExpression.defined) {
      filteredServices = filterExpression.filter(
        SERVICE_FILTERS,
        filteredServices.flattenItems()
      );
    }

    // TODO: move modals to Page
    return (
      <ServiceTreeView
        filters={SERVICE_FILTERS}
        filterExpression={filterExpression}
        isEmpty={isEmpty}
        onFilterExpressionChange={this.handleFilterExpressionChange}
        params={params}
        routes={routes}
        services={filteredServices.getItems()}
        serviceTree={item}
        roles={roles}
      >
        {children}
        {this.getModals(item)}
      </ServiceTreeView>
    );
  };
  getServiceQuota = item => {
    const { children, params, routes } = this.props;
    return (
      <ServicesQuotaView params={params} routes={routes} serviceTree={item}>
        {children}
        {this.getModals(item)}
      </ServicesQuotaView>
    );
  };
  getResetDelaySuccessToast = serviceName => {
    const title = i18nTranslate(i18nMark("Reset Delay Successful"));
    const description = i18nTranslate(
      i18nMark("Delay has cleared and {serviceName} is now relaunching."),
      { serviceName }
    );

    return new ToastNotification(title, {
      appearance: ToastAppearance.Success,
      autodismiss: true,
      description
    });
  };
  getResetDelayErrorToast = serviceName => {
    const title = i18nTranslate(i18nMark("Reset Delay Failed"));
    const description = i18nTranslate(
      i18nMark(
        "Delay reset failed and did not relaunch {serviceName}. Please try again."
      ),
      { serviceName }
    );

    return new ToastNotification(title, {
      appearance: ToastAppearance.Danger,
      autodismiss: true,
      description
    });
  };

  render() {
    const { children, params, routes } = this.props;
    const { fetchErrors, isLoading, itemId } = this.state;
    // TODO react-router: Temp hack if we are deeper than overview/:id we should render child routes
    if (Object.keys(params).length > 1) {
      return children;
    }

    // Still Loading
    if (isLoading) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={<ServiceBreadcrumbs serviceID={this.state.itemId} />}
          />
          <Loader />
        </Page>
      );
    }

    // Check if a single endpoint has failed more than 3 times
    const fetchError = Object.values(fetchErrors).some(
      errorCount => errorCount > 3
    );

    // API Failures
    if (fetchError) {
      return <RequestErrorMsg />;
    }

    // Find item in root tree
    const item =
      itemId === "/"
        ? DCOSStore.serviceTree
        : DCOSStore.serviceTree.findItemById(itemId);

    // Show Tree
    const currentRoutePath = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentRoutePath.startsWith("/services/overview")) {
      // Not found
      if (!(item instanceof ServiceTree)) {
        return this.getEmptyPage("group");
      }

      // TODO: move modals to Page
      return this.getServiceTree(item);
    }

    if (currentRoutePath.startsWith("/services/quota")) {
      return this.getServiceQuota(item);
    }

    if (item instanceof Pod) {
      return this.getPodDetail(item);
    }

    if (item instanceof Service) {
      return this.getServiceDetail(item);
    }

    // Not found
    return this.getEmptyPage("service");
  }
}

// Make these modal handlers available via context
// so any child can trigger the opening of modals
ServicesContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func,
    deleteService: PropTypes.func,
    editService: PropTypes.func,
    restartService: PropTypes.func,
    resumeService: PropTypes.func,
    scaleService: PropTypes.func,
    stopService: PropTypes.func,
    openServiceUI: PropTypes.func,
    resetDelayedService: PropTypes.func
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
  label: i18nMark("Services"),
  icon: <Icon shape={ProductIcons.ServicesInverse} size={iconSizeS} />,
  matches: /^\/services\/(detail|overview|quota)/
};

export default ServicesContainer;
