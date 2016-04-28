import {Link} from 'react-router';
var React = require('react');

import Cluster from '../utils/Cluster';
var EventTypes = require('../constants/EventTypes');
import Framework from '../structs/Framework';
import HealthBar from './HealthBar';
import IconNewWindow from './icons/IconNewWindow';
var MarathonStore = require('../stores/MarathonStore');
var ResourceTableUtil = require('../utils/ResourceTableUtil');
var ServiceTableHeaderLabels = require('../constants/ServiceTableHeaderLabels');
import ServiceTableUtil from '../utils/ServiceTableUtil';
import ServiceTree from '../structs/ServiceTree';
import StringUtil from '../utils/StringUtil';
import {Table} from 'reactjs-components';
import TableUtil from '../utils/TableUtil';
var Units = require('../utils/Units');

const StatusMapping = {
  'Running': 'running-state'
};

var ServicesTable = React.createClass({

  displayName: 'ServicesTable',

  propTypes: {
    services: React.PropTypes.array.isRequired
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

  getDefaultProps: function () {
    return {
      services: []
    };
  },

  getOpenInNewWindowLink(service) {
    if (!(service instanceof Framework) || !service.getWebURL()) {
      return null;
    }

    return (
      <a className="table-display-on-row-hover"
        href={Cluster.getServiceLink(service.getName())} target="_blank"
        title="Open in a new window">
        <IconNewWindow className="icon icon-new-window icon-align-right
          icon-margin-wide" />
      </a>
    );
  },

  onMarathonAppsChange: function () {
    this.forceUpdate();
  },

  renderHeadline: function (prop, service) {
    const id = encodeURIComponent(service.getId());
    let itemImage = null;

    if (service instanceof ServiceTree) {
      // Get serviceTree image/icon
      itemImage = (
      <span
        className="icon icon-small icon-image-container icon-app-container">
          <i className="icon icon-sprite icon-sprite-mini icon-directory "/>
        </span>
      );
    }

    if (service instanceof Framework) {
      // Get framework image/icon
      itemImage = (
        <span
          className="icon icon-small icon-image-container icon-app-container">
          <img src={service.getImages()['icon-small']}/>
        </span>
      );
    }

    return (
      <div className="service-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link to="services-detail"
          className="table-cell-icon"
          params={{id}}>
          {itemImage}
        </Link>
        <Link to="services-detail"
          className="headline table-cell-value flex-box flex-box-col"
          params={{id}}>
          <span className="text-overflow">
            {service.getName()}
          </span>
        </Link>
        {this.getOpenInNewWindowLink(service)}
      </div>
    );
  },

  renderStatus: function (prop, service) {
    let instanceCount = service.getInstancesCount();
    let serviceStatus = service.getStatus();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let taskSummary = service.getTasksSummary();
    let {tasksRunning} = taskSummary;

    let text = ` (${tasksRunning} ${StringUtil.pluralize('Task', tasksRunning)})`;
    if (tasksRunning !== instanceCount) {
      text = ` (${tasksRunning} of ${instanceCount} Tasks)`;
    }

    return (
      <div className="status-bar-wrapper media-object media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
        <span className="media-object-item flush-bottom">
          <HealthBar tasksSummary={taskSummary} instancesCount={instanceCount} />
        </span>
        <span className="media-object-item flush-bottom visible-large-inline-block">
          <span className={serviceStatusClassSet}>{serviceStatus}</span>
          {text}
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

  getColumns: function () {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(ServiceTableHeaderLabels);

    return [
      {
        className,
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
        render: this.renderStatus,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'disk',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'cpus',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'mem',
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
        <col style={{width: '100px'}} />
        <col className="hidden-mini" style={{width: '120px'}} />
        <col className="hidden-mini" style={{width: '120px'}} />
        <col className="hidden-mini" style={{width: '120px'}} />
      </colgroup>
    );
  },

  render: function () {
    return (
      <div>
        <Table
          buildRowOptions={this.getRowAttributes}
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.services.slice()}
          itemHeight={TableUtil.getRowHeight()}
          containerSelector=".gm-scroll-view"
          sortBy={{prop: 'name', order: 'asc'}} />
      </div>
    );
  }
});

module.exports = ServicesTable;
