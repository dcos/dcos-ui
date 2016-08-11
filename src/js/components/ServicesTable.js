import classNames from 'classnames';
import {Confirm, Dropdown, Table} from 'reactjs-components';
import {Link} from 'react-router';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import EventTypes from '../constants/EventTypes';
import HealthBar from './HealthBar';
import Icon from './Icon';
import MarathonStore from '../stores/MarathonStore';
import NestedServiceLinks from '../components/NestedServiceLinks';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import Service from '../structs/Service';
import ServiceActionItem from '../constants/ServiceActionItem';
import ServiceDestroyModal from './modals/ServiceDestroyModal';
import ServiceScaleFormModal from '../components/modals/ServiceScaleFormModal';
import ServiceTableHeaderLabels from '../constants/ServiceTableHeaderLabels';
import ServiceTableUtil from '../utils/ServiceTableUtil';
import ServiceTree from '../structs/ServiceTree';
import StringUtil from '../utils/StringUtil';
import TableUtil from '../utils/TableUtil';
import Units from '../utils/Units';

const StatusMapping = {
  'Running': 'running-state'
};

var ServicesTable = React.createClass({
  displayName: 'ServicesTable',

  defaultProps: {
    isFiltered: false
  },

  propTypes: {
    isFiltered: React.PropTypes.bool,
    services: React.PropTypes.array.isRequired
  },

  mixins: [StoreMixin],

  getDefaultProps: function () {
    return {
      services: []
    };
  },

  getInitialState: function () {
    return {
      disabledDialog: null,
      errorMsg: null,
      serviceActionDialog: null,
      serviceToChange: null
    };
  },

  componentWillMount: function () {
    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceEditError',
          'serviceEditSuccess',
          'serviceRestartError',
          'serviceRestartSuccess',
          'groupEditError',
          'groupEditSuccess'
        ]
      }
    ];
  },

  componentDidMount: function () {
    MarathonStore.addChangeListener(
      EventTypes.MARATHON_APPS_CHANGE,
      this.onMarathonAppsChange
    );
  },

  componentWillUnmount: function () {
    MarathonStore.removeChangeListener(
      EventTypes.MARATHON_APPS_CHANGE,
      this.onMarathonAppsChange
    );
  },

  onServiceDestroyModalClose: function () {
    this.closeDialog();
    this.context.router.transitionTo('services-page');
  },

  onMarathonStoreServiceEditSuccess: function () {
    this.closeDialog();
  },

  onMarathonStoreServiceEditError: function ({message: errorMsg}) {
    this.setState({
      disabledDialog: null,
      errorMsg
    });
  },

  onMarathonStoreServiceRestartSuccess: function () {
    this.closeDialog();
  },

  onMarathonStoreServiceRestartError: function ({message: errorMsg}) {
    this.setState({
      disabledDialog: null,
      errorMsg
    });
  },

  onMarathonStoreGroupEditSuccess: function () {
    this.closeDialog();
  },

  onMarathonStoreGroupEditError: function ({message: errorMsg}) {
    this.setState({
      disabledDialog: null,
      errorMsg
    });
  },

  getOpenInNewWindowLink(service) {
    // This might be a serviceTree and therefore we need this check
    // And getWebURL might therefore not be available
    if (!(service instanceof Service) || !service.getWebURL()) {
      return null;
    }

    return (
      <a className="table-display-on-row-hover"
        href={service.getWebURL()}
        target="_blank"
        title="Open in a new window">
        <Icon
          color="white"
          className="icon-margin-left icon-margin-left-wide"
          family="mini"
          id="open-external"
          size="mini" />
      </a>
    );
  },

  onAcceptRestartConfirmDialog: function () {
    let service = this.state.serviceToChange;

    this.setState({disabledDialog: ServiceActionItem.RESTART}, () => {
      MarathonStore.restartService(service.getId(), !!this.state.errorMsg);
    });
  },

  onAcceptSuspendConfirmDialog: function () {
    let service = this.state.serviceToChange;
    let isGroup = service instanceof ServiceTree;

    this.setState({disabledDialog: ServiceActionItem.SUSPEND}, () => {
      let serviceID = service.getId();

      if (isGroup) {
        MarathonStore.editGroup({
          id: serviceID,
          scaleBy: 0
        });
      } else {
        MarathonStore.editService({
          id: serviceID,
          instances: 0
        });
      }
    });
  },

  onMarathonAppsChange: function () {
    this.forceUpdate();
  },

  onActionsItemSelection: function (service, actionItem) {
    this.setState({
      serviceToChange: service,
      serviceActionDialog: actionItem.id
    });
  },

  closeDialog: function () {
    this.setState({
      disabledDialog: null,
      errorMsg: null,
      serviceActionDialog: null,
      serviceToChange: null
    });
  },

  getErrorMessage: function () {
    let {errorMsg} = this.state;
    if (!errorMsg) {
      return null;
    }
    return (
      <p className="text-danger flush-top">{errorMsg}</p>
    );
  },

  getRestartConfirmDialog: function () {
    const {state} = this;
    let service = state.serviceToChange;
    let serviceName = '';
    let buttonText = 'Restart Service';

    if (state.errorMsg) {
      buttonText = 'Forcefully Restart Service';
    }

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={state.disabledDialog === ServiceActionItem.RESTART}
        open={state.serviceActionDialog === ServiceActionItem.RESTART}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText={buttonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.onAcceptRestartConfirmDialog}>
        <div className="container-pod flush-top container-pod-short-bottom">
          <h2 className="text-danger text-align-center flush-top">Restart Service</h2>
          <p>
            Are you sure you want to restart <span className="emphasize">{serviceName}</span>?
          </p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
    );
  },

  getSuspendConfirmDialog: function () {
    let service = this.state.serviceToChange;
    let serviceName = '';
    const {state} = this;
    let itemText = 'Service';
    if (service instanceof ServiceTree) {
      itemText = 'Group';
    }

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={state.disabledDialog === ServiceActionItem.SUSPEND}
        open={state.serviceActionDialog === ServiceActionItem.SUSPEND}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText="Suspend Service"
        rightButtonClassName="button button-primary"
        rightButtonCallback={this.onAcceptSuspendConfirmDialog}>
        <div className="container-pod flush-top container-pod-short-bottom">
          <h2 className="text-align-center flush-top">Suspend {itemText}</h2>
          <p>
            Are you sure you want to suspend <span className="emphasize">{serviceName}</span> by scaling to 0 instances?
          </p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
    );
  },

  getServiceScaleFormModal: function () {
    if (!this.state.serviceToChange) {
      return null;
    }

    return (
      <ServiceScaleFormModal
        open={this.state.serviceActionDialog === ServiceActionItem.SCALE}
        service={this.state.serviceToChange}
        onClose={this.closeDialog} />
    );
  },

  getServiceLink: function (service) {
    const id = encodeURIComponent(service.getId());

    if (this.props.isFiltered) {
      return (
        <NestedServiceLinks
          serviceID={id}
          className="service-breadcrumb"
          majorLinkClassName="service-breadcrumb-service-id"
          minorLinkWrapperClassName="service-breadcrumb-crumb" />
      );
    }

    return (
      <Link to="services-detail"
        className="headline"
        params={{id}}>
        <span className="text-overflow">
          {service.getName()}
        </span>
      </Link>
    );
  },

  getImage: function (service) {
    if (service instanceof ServiceTree) {
      // Get serviceTree image/icon
      return (
        <Icon
          className="icon-margin-right"
          color="grey"
          id="folder"
          size="small"
          family="small" />
      );
    }

    // Get service image/icon
    return (
      <span
        className="icon icon-small icon-image-container icon-app-container icon-margin-right">
        <img src={service.getImages()['icon-small']}/>
      </span>
    );
  },

  renderHeadline: function (prop, service) {
    const id = encodeURIComponent(service.getId());

    return (
      <div className="service-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link to="services-detail"
          className="table-cell-icon"
          params={{id}}>
          {this.getImage(service)}
        </Link>
        <span className="flex-shrink flex-grow text-overflow">
          {this.getServiceLink(service)}
          {this.getOpenInNewWindowLink(service)}
        </span>
        {this.renderServiceActions(service)}
      </div>
    );
  },

  renderServiceActions: function (service) {
    let isGroup = service instanceof ServiceTree;
    let instancesCount = service.getInstancesCount();
    let scaleText = 'Scale';
    if (isGroup) {
      scaleText = 'Scale By';
    }

    const dropdownItems = [
      {
        className: 'hidden',
        id: ServiceActionItem.MORE,
        html: '',
        selectedHtml: (
          <Icon
            family="mini"
            id="gear"
            size="mini"
            className="icon-alert icon-margin-right"
            color="white" />
        )
      },
      {
        className: classNames({
          hidden: isGroup && instancesCount === 0
        }),
        id: ServiceActionItem.SCALE,
        html: scaleText
      },
      {
        className: classNames({
          hidden: isGroup || instancesCount === 0
        }),
        id: ServiceActionItem.RESTART,
        html: 'Restart'
      },
      {
        className: classNames({
          hidden: instancesCount === 0
        }),
        id: ServiceActionItem.SUSPEND,
        html: 'Suspend'
      },
      {
        id: ServiceActionItem.DESTROY,
        html: <span className="text-danger">Destroy</span>
      }
    ];

    return (
      <Dropdown
        key="actions-dropdown"
        anchorRight={true}
        buttonClassName="button button-mini dropdown-toggle button-link button-inverse table-display-on-row-hover"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown flush-bottom table-cell-icon"
        items={dropdownItems}
        persistentID={ServiceActionItem.MORE}
        onItemSelection={this.onActionsItemSelection.bind(this, service)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu" />
    );
  },

  renderStatus: function (prop, service) {
    let instanceCount = service.getInstancesCount();
    let serviceId = service.getId();
    let serviceStatus = service.getStatus();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let taskSummary = service.getTasksSummary();
    let {tasksRunning} = taskSummary;

    let conciseOverview = ` (${tasksRunning}/${instanceCount})`;
    let verboseOverview = ` (${tasksRunning} ${StringUtil.pluralize('Task', tasksRunning)})`;
    if (tasksRunning !== instanceCount) {
      verboseOverview = ` (${tasksRunning} of ${instanceCount} Tasks)`;
    }

    return (
      <div className="status-bar-wrapper">
        <span className="status-bar-indicator">
          <HealthBar
            key={serviceId}
            tasksSummary={taskSummary}
            instancesCount={instanceCount} />
        </span>
        <span className="status-bar-text">
          <span className={serviceStatusClassSet}>{serviceStatus}</span>
          <span className="visible-x-large-inline">{verboseOverview}</span>
          <span className="hidden-x-large">{conciseOverview}</span>
        </span>
      </div>
    );
  },

  renderStats: function (prop, service) {
    return (
      <span>
        {Units.formatResource(prop, service.getResources()[prop])}
      </span>
    );
  },

  renderStatsHeading: function (prop, sortBy, row) {
    let isHeader = row == null;

    return classNames('flush-left text-align-right hidden-mini hidden-small', {
      'highlight': prop === sortBy.prop,
      'clickable': isHeader
    });
  },

  getColumns: function () {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(ServiceTableHeaderLabels);
    let {isFiltered} = this.props;

    return [
      {
        className: function () {
          return classNames([
            className.apply(this, arguments),
            {'table-cell-short': isFiltered}
          ]);
        },
        headerClassName: className,
        prop: 'name',
        render: this.renderHeadline,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'status',
        helpText: 'At-a-glance overview of the global application or group state',
        render: this.renderStatus,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.renderStatsHeading,
        headerClassName: this.renderStatsHeading,
        prop: 'cpus',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.renderStatsHeading,
        headerClassName: this.renderStatsHeading,
        prop: 'mem',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.renderStatsHeading,
        headerClassName: this.renderStatsHeading,
        prop: 'disk',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      }
    ];
  },

  getColGroup: function () {
    return (
      <colgroup>
        <col />
        <col className="status-bar-column"/>
        <col className="hidden-mini hidden-small" style={{width: '85px'}} />
        <col className="hidden-mini hidden-small" style={{width: '75px'}} />
        <col className="hidden-mini hidden-small" style={{width: '85px'}} />
      </colgroup>
    );
  },

  render: function () {
    let {serviceActionDialog, serviceToChange} = this.state;

    return (
      <div>
        <Table
          buildRowOptions={this.getRowAttributes}
          className="table service-table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.services.slice()}
          itemHeight={TableUtil.getRowHeight()}
          containerSelector=".gm-scroll-view"
          sortBy={{prop: 'name', order: 'asc'}} />
        <ServiceDestroyModal
          onClose={this.onServiceDestroyModalClose}
          open={serviceActionDialog === ServiceActionItem.DESTROY}
          service={serviceToChange} />
        {this.getRestartConfirmDialog()}
        {this.getServiceScaleFormModal()}
        {this.getSuspendConfirmDialog()}
      </div>
    );
  }
});

ServicesTable.contextTypes = {
  router: React.PropTypes.func
};

module.exports = ServicesTable;
