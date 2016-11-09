import classNames from 'classnames';
import {Dropdown, Table} from 'reactjs-components';
import {Link} from 'react-router';
import React, {PropTypes} from 'react';
import {ResourceTableUtil} from 'foundation-ui';

import HealthBar from '../../components/HealthBar';
import Links from '../../../../../../src/js/constants/Links';
import Icon from '../../../../../../src/js/components/Icon';
import NestedServiceLinks from '../../../../../../src/js/components/NestedServiceLinks';
import Service from '../../structs/Service';
import ServiceActionItem from '../../constants/ServiceActionItem';
import ServiceTableHeaderLabels from '../../constants/ServiceTableHeaderLabels';
import ServiceTableUtil from '../../utils/ServiceTableUtil';
import ServiceTree from '../../structs/ServiceTree';
import StringUtil from '../../../../../../src/js/utils/StringUtil';
import TableUtil from '../../../../../../src/js/utils/TableUtil';
import Units from '../../../../../../src/js/utils/Units';

const StatusMapping = {
  'Running': 'running-state'
};

const METHODS_TO_BIND = [
  'onActionsItemSelection',
  'renderHeadline',
  'renderStats',
  'renderStatus',
  'renderStatsHeading'
];

class ServicesTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getOpenInNewWindowLink(service) {
    // This might be a serviceTree and therefore we need this check
    // And getWebURL might therefore not be available
    if (!(service instanceof Service) || !service.getWebURL()) {
      return null;
    }

    return (
      <a className="table-cell-icon table-display-on-row-hover"
        href={service.getWebURL()}
        target="_blank"
        title="Open in a new window">
        <Icon
          color="neutral"
          className="icon-margin-left icon-margin-left-wide"
          family="mini"
          id="open-external"
          size="mini" />
      </a>
    );
  }

  onActionsItemSelection(service, actionItem) {
    const {modalHandlers} = this.context;

    switch (actionItem.id) {
      case ServiceActionItem.SCALE:
        modalHandlers.scaleService({service});
        break;
      case ServiceActionItem.RESTART:
        modalHandlers.restartService({service});
        break;
      case ServiceActionItem.SUSPEND:
        modalHandlers.suspendService({service});
        break;
      case ServiceActionItem.DESTROY:
        modalHandlers.deleteService({service});
        break;
    };
  }

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
      <Link
        className="table-cell-link-primary text-overflow"
        to={`/services/overview/${id}`}>
        {service.getName()}
      </Link>
    );
  }

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
  }

  renderHeadline(prop, service) {
    const id = encodeURIComponent(service.getId());

    return (
      <div className="service-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link
          className="table-cell-icon"
          to={`/services/overview/${id}`}>
          {this.getImage(service)}
        </Link>
        <span className="table-cell-value table-cell-flex-box">
          {this.getServiceLink(service)}
          {this.getOpenInNewWindowLink(service)}
        </span>
        {this.renderServiceActions(service)}
      </div>
    );
  }

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
            color="neutral" />
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
        buttonClassName="button button-mini dropdown-toggle button-link table-display-on-row-hover"
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
  }

  renderStatus(prop, service) {
    let instancesCount = service.getInstancesCount();
    let serviceId = service.getId();
    let serviceStatus = service.getStatus();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let tasksSummary = service.getTasksSummary();
    let {tasksRunning} = tasksSummary;

    let isDeploying = serviceStatus === 'Deploying';

    let conciseOverview = ` (${tasksRunning}/${instancesCount})`;
    let verboseOverview = ` (${tasksRunning} ${StringUtil.pluralize('Instance', tasksRunning)})`;
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
          <span className="hidden-large-down">{verboseOverview}</span>
          <span className="hidden-jumbo-up">{conciseOverview}</span>
        </span>
      </div>
    );
  }

  renderStats(prop, service) {
    let instancesCount = service.getInstancesCount();
    let resource = service.getResources()[prop];

    let value = resource * instancesCount;
    return (
      <span>
        {Units.formatResource(prop, value)}
      </span>
    );
  }

  renderStatsHeading(prop, sortBy, row) {
    let isHeader = row == null;

    return classNames('flush-left text-align-right hidden-small-down', {
      'active': prop === sortBy.prop,
      'clickable': isHeader
    });
  }

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
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col className="status-bar-column"/>
        <col className="hidden-small-down" style={{width: '65px'}} />
        <col className="hidden-small-down" style={{width: '75px'}} />
        <col className="hidden-small-down" style={{width: '65px'}} />
      </colgroup>
    );
  }

  render() {
    return (
        <Table
          buildRowOptions={this.getRowAttributes}
          className="table service-table table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.services.slice()}
          itemHeight={TableUtil.getRowHeight()}
          containerSelector=".gm-scroll-view"
          sortBy={{prop: 'name', order: 'asc'}} />
    );
  }
};

ServicesTable.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    restartService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired
};

ServicesTable.defaultProps = {
  isFiltered: false,
  services: []
};

ServicesTable.propTypes = {
  isFiltered: PropTypes.bool,
  services: PropTypes.array
};

module.exports = ServicesTable;
