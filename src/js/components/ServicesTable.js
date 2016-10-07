import classNames from 'classnames';
import {Dropdown, Table} from 'reactjs-components';
import {Link} from 'react-router';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import HealthBar from './HealthBar';
import Icon from './Icon';
import Links from '../constants/Links';
import NestedServiceLinks from '../components/NestedServiceLinks';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import Service from '../structs/Service';
import ServiceActionItem from '../constants/ServiceActionItem';
import ServiceDestroyModal from './modals/ServiceDestroyModal';
import ServiceRestartModal from './modals/ServiceRestartModal';
import ServiceScaleFormModal from '../components/modals/ServiceScaleFormModal';
import ServiceSuspendModal from './modals/ServiceSuspendModal';
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

  getDefaultProps() {
    return {
      services: []
    };
  },

  getInitialState() {
    return {
      serviceActionDialog: null,
      serviceToChange: null
    };
  },

  componentWillMount() {
    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceRestartError',
          'serviceRestartSuccess'
        ],
        suppressUpdate: true
      }
    ];
  },

  onServiceDestroyModalClose() {
    this.closeDialog();
    this.context.router.transitionTo('services-page');
  },

  onServiceSuspendModalClose() {
    this.closeDialog();
  },

  onMarathonStoreServiceRestartSuccess() {
    this.closeDialog();
  },

  onMarathonStoreServiceRestartError({message: errorMsg}) {
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

  onActionsItemSelection(service, actionItem) {
    this.setState({
      serviceToChange: service,
      serviceActionDialog: actionItem.id
    });
  },

  closeDialog() {
    this.setState({
      serviceActionDialog: null,
      serviceToChange: null
    });
  },

  getServiceScaleFormModal() {
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

  getServiceLink(service) {
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

  getImage(service) {
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

  renderHeadline(prop, service) {
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

  renderServiceActions(service) {
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

  renderStatus(prop, service) {
    let instancesCount = service.getInstancesCount();
    let serviceId = service.getId();
    let serviceStatus = service.getStatus();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let tasksSummary = service.getTasksSummary();
    let {tasksRunning} = tasksSummary;

    let isDeploying = serviceStatus === 'Deploying';

    let conciseOverview = ` (${tasksRunning}/${instancesCount})`;
    let verboseOverview = ` (${tasksRunning} ${StringUtil.pluralize('Intance', tasksRunning)})`;
    if (tasksRunning !== instancesCount) {
      verboseOverview = ` (${tasksRunning} of ${instancesCount} Instances)`;
    }

    return (
      <div className="status-bar-wrapper">
        <span className="status-bar-indicator">
          <HealthBar
            isDeploying={isDeploying}
            key={serviceId}
            tasksSummary={tasksSummary}
            instancesCount={instancesCount} />
        </span>
        <span className="status-bar-text">
          <span className={serviceStatusClassSet}>{serviceStatus}</span>
          <span className="visible-x-large-inline">{verboseOverview}</span>
          <span className="hidden-x-large">{conciseOverview}</span>
        </span>
      </div>
    );
  },

  renderStats(prop, service) {
    let instancesCount = service.getInstancesCount();
    let resource = service.getResources()[prop];

    let value = resource * instancesCount;
    return (
      <span>
        {Units.formatResource(prop, value)}
      </span>
    );
  },

  renderStatsHeading(prop, sortBy, row) {
    let isHeader = row == null;

    return classNames('flush-left text-align-right hidden-mini hidden-small', {
      'highlight': prop === sortBy.prop,
      'clickable': isHeader
    });
  },

  getColumns() {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(ServiceTableHeaderLabels);
    let {isFiltered} = this.props;

    return [
      {
        className() {
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
        helpText: (
            <span>
              {'At-a-glance overview of the global application or group state '}
              <a
                href={Links.statusHelpLink} target="_blank">
                Read Me
              </a>
            </span>
        ),
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

  getColGroup() {
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

  render() {
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
        <ServiceRestartModal
          onClose={this.closeDialog}
          open={serviceActionDialog === ServiceActionItem.RESTART}
          service={serviceToChange} />
        {this.getServiceScaleFormModal()}
        <ServiceSuspendModal
          onClose={this.closeDialog}
          open={serviceActionDialog === ServiceActionItem.SUSPEND}
          service={serviceToChange} />
      </div>
    );
  }
});

ServicesTable.contextTypes = {
  router: React.PropTypes.func
};

module.exports = ServicesTable;
