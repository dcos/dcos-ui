import {Link} from 'react-router';
var React = require('react');
import {Tooltip} from 'reactjs-components';

import Cluster from '../utils/Cluster';
var EventTypes = require('../constants/EventTypes');
var HealthLabels = require('../constants/HealthLabels');
var HealthTypesDescription = require('../constants/HealthTypesDescription');
import IconNewWindow from './icons/IconNewWindow';
var MarathonStore = require('../stores/MarathonStore');
var ResourceTableUtil = require('../utils/ResourceTableUtil');
var ServiceTableHeaderLabels = require('../constants/ServiceTableHeaderLabels');
import ServiceTableUtil from '../utils/ServiceTableUtil';
import {Table} from 'reactjs-components';
import TableUtil from '../utils/TableUtil';
var Units = require('../utils/Units');

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
    if (!service.getWebURL()) {
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
    let imageTag = null;

    // TODO (poltergeist, orlandohohmeier): get images from service structs
    imageTag = (
      <span className="icon icon-small icon-image-container icon-app-container">
        <i className="icon icon-sprite icon-sprite-mini" />
      </span>
    );

    return (
      <div className="service-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link to="services-panel"
          className="table-cell-icon"
          params={{serviceName: service.getName()}}>
          {imageTag}
        </Link>
        <Link to="services-panel"
          className="headline table-cell-value flex-box flex-box-col"
          params={{serviceName: service.getName()}}>
          <span className="text-overflow">
            {service.getName()}
          </span>
        </Link>
        {this.getOpenInNewWindowLink(service)}
      </div>
    );
  },

  renderHealth: function (prop, service) {
    let appHealth = service.getHealth();

    return (
      <Tooltip content={HealthTypesDescription[appHealth.key]}>
        <span className={appHealth.classNames}>
          {HealthLabels[appHealth.key]}
        </span>
      </Tooltip>
    );
  },

  renderStats: function (prop, service) {
    return (
      <span>
        {Units.formatResource(prop, service.getResources()[prop])}
      </span>
    );
  },

  renderTask: function (prop, service) {
    return (
      <span>
        {service.getTasksSummary().tasksRunning}
        <span className="visible-mini-inline"> Tasks</span>
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
        prop: 'health',
        render: this.renderHealth,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'tasks',
        render: this.renderTask,
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
      },
      {
        className,
        headerClassName: className,
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
        <col style={{width: '14%'}} />
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
