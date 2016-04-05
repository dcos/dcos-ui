import {Link} from 'react-router';
var React = require('react');
import {Tooltip} from 'reactjs-components';

import Cluster from '../utils/Cluster';
var EventTypes = require('../constants/EventTypes');
import Framework from '../structs/Framework';
var HealthLabels = require('../constants/HealthLabels');
var HealthTypesDescription = require('../constants/HealthTypesDescription');
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

  onMarathonAppsChange: function () {
    this.forceUpdate();
  },

  renderServiceTreeHeadline: function (service) {
    const serviceTreeId = encodeURIComponent(service.getId());
    return (
      <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box">
        <Link to="services-tree"
          className="table-cell-icon"
          params={{serviceTreeId}}>
          <span
            className="icon icon-small icon-image-container icon-app-container">
            <i className="icon icon-sprite icon-sprite-mini icon-directory "/>
          </span>
        </Link>
        <Link to="services-tree"
          className="headline table-cell-value flex-box flex-box-col"
          params={{serviceTreeId}}>
          <span className="text-overflow">
            {service.getName()}
          </span>
        </Link>
      </div>
    );
  },

  renderHeadline: function (prop, service) {
    if (service instanceof ServiceTree) {
      return this.renderServiceTreeHeadline(service);
    }

    let serviceImage = null;
    let frameworkLink = null;

    if (service instanceof Framework) {
      // Get framework image/icon
      serviceImage = (
        <span
          className="icon icon-small icon-image-container icon-app-container">
          <img src={service.getImages()['icon-small']}/>
        </span>
      );
      // Get framework cluster link
      frameworkLink = (
        <a 
          className="table-display-on-row-hover"
          href={Cluster.getServiceLink(service.getName())}
          target="_blank"
          title="Open in a new window">
          <IconNewWindow className="icon icon-new-window icon-align-right
            icon-margin-wide" />
        </a>
      );
    }

    return (
      <div className="service-table-heading flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <Link to="services-panel"
          className="table-cell-icon"
          params={{serviceName: service.getName()}}>
          {serviceImage}
        </Link>
        <Link to="services-panel"
          className="headline table-cell-value flex-box flex-box-col"
          params={{serviceName: service.getName()}}>
          <span className="text-overflow">
            {service.getName()}
          </span>
        </Link>
        {frameworkLink}
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
    let tasksRunning = service.getTasksSummary().tasksRunning;
    return (
      <span>
        {tasksRunning}
        <span className="visible-mini-inline">
          {StringUtil.pluralize(' Task', tasksRunning)}
        </span>
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
