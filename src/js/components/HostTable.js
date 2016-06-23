var classNames = require('classnames');
import {Link} from 'react-router';
var React = require('react');
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Tooltip} from 'reactjs-components';

var HostTableHeaderLabels = require('../constants/HostTableHeaderLabels');
import Icon from '../components/Icon';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var ResourceTableUtil = require('../utils/ResourceTableUtil');
var ProgressBar = require('./charts/ProgressBar');
import StringUtil from '../utils/StringUtil';
import {Table} from 'reactjs-components';
import TableUtil from '../utils/TableUtil';
import UnitHealthUtil from '../utils/UnitHealthUtil';

var HostTable = React.createClass({

  displayName: 'HostTable',

  mixins: [InternalStorageMixin, StoreMixin],

  statics: {
    routeConfig: {
      label: 'Nodes',
      icon: <Icon id="servers" />,
      matches: /^\/nodes/
    }
  },

  propTypes: {
    hosts: React.PropTypes.array.isRequired
  },

  getDefaultProps: function () {
    return {
      hosts: []
    };
  },

  componentWillMount: function () {
    this.internalStorage_set({
      nodeHealthResponseReceived: false
    });

    this.store_listeners = [
      {
        name: 'nodeHealth',
        events: ['success'],
        listenAlways: false
      }
    ];
  },

  onNodeHealthStoreSuccess: function () {
    this.internalStorage_set({
      nodeHealthResponseReceived: true
    });
    this.forceUpdate();
  },

  renderHeadline: function (prop, node) {
    let headline = node.get(prop);

    if (!node.isActive()) {
      headline = (
        <Tooltip anchor="start" content="Connection to node lost">
          <Icon
            family="mini"
            id="yield"
            size="mini"
            className="icon-alert icon-margin-right"
            color="white" />
          {headline}
        </Tooltip>
      );
    }

    return (
      <Link className="headline emphasize" params={{nodeID: node.get('id')}}
        to="node-detail">
        {headline}
      </Link>
    );
  },

  renderHealth: function (prop, node) {
    let requestReceived = this.internalStorage_get().nodeHealthResponseReceived;

    if (!requestReceived) {
      return (
        <div className="loader-small ball-beat">
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    }

    let health = node.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  },

  renderStats: function (prop, node) {
    var colorMapping = {
      cpus: 1,
      mem: 2,
      disk: 3
    };

    var value = node.getUsageStats(prop).percentage;
    return (
      <span className="spread-content">
        <ProgressBar value={value}
          colorIndex={colorMapping[prop]} /> <span>{value}%</span>
      </span>
    );
  },

  getColumns: function () {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(HostTableHeaderLabels);
    let sortFunction = TableUtil.getSortFunction('hostname',
      function (node, prop) {
        if (prop === 'cpus' || prop === 'mem' || prop === 'disk') {
          return node.getUsageStats(prop).percentage;
        }

        if (prop === 'health') {
          return UnitHealthUtil.getHealthSorting(node);
        }

        return node.get(prop);
      }
    );

    return [
      {
        className,
        headerClassName: className,
        prop: 'hostname',
        render: this.renderHeadline,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'health',
        render: this.renderHealth,
        sortable: true,
        sortFunction,
        heading: ResourceTableUtil.renderHeading({health: 'HEALTH'})
      },
      {
        className,
        headerClassName: className,
        prop: 'TASK_RUNNING',
        render: ResourceTableUtil.renderTask,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'cpus',
        render: this.renderStats,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'mem',
        render: this.renderStats,
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'disk',
        render: this.renderStats,
        sortable: true,
        sortFunction,
        heading
      }
    ];
  },

  getColGroup: function () {
    return (
      <colgroup>
        <col />
        <col style={{width: '100px'}} />
        <col style={{width: '110px'}} />
        <col className="hidden-mini" style={{width: '135px'}} />
        <col className="hidden-mini" style={{width: '135px'}} />
        <col className="hidden-mini" style={{width: '135px'}} />
      </colgroup>
    );
  },

  getRowAttributes: function (node) {
    return {
      className: classNames({
        'danger': node.isActive() === false
      })
    };
  },

  render: function () {
    return (
      <Table
        className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={this.props.hosts.slice()}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: 'health', order: 'asc' }}
        buildRowOptions={this.getRowAttributes} />
    );
  }
});

module.exports = HostTable;
