import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Table, Tooltip} from 'reactjs-components';

import NodesTableHeaderLabels from '../constants/NodesTableHeaderLabels';
import Icon from '../components/Icon';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Loader from '../components/Loader';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import StatusBar from '../components/StatusBar';
import StringUtil from '../utils/StringUtil';
import TableUtil from '../utils/TableUtil';
import UnitHealthUtil from '../utils/UnitHealthUtil';

const COLOR_CLASSNAMES = {
  cpus: 'color-1',
  mem: 'color-2',
  disk: 'color-3'
};

var NodesTable = React.createClass({

  displayName: 'NodesTable',

  mixins: [InternalStorageMixin, StoreMixin],

  propTypes: {
    hosts: React.PropTypes.array.isRequired
  },

  getDefaultProps() {
    return {
      hosts: []
    };
  },

  componentWillMount() {
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

  onNodeHealthStoreSuccess() {
    this.internalStorage_set({
      nodeHealthResponseReceived: true
    });
    this.forceUpdate();
  },

  renderHeadline(prop, node) {
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
      <Link className="table-cell-emphasized" params={{nodeID: node.get('id')}}
        to="node-detail">
        {headline}
      </Link>
    );
  },

  renderHealth(prop, node) {
    let requestReceived = this.internalStorage_get().nodeHealthResponseReceived;

    if (!requestReceived) {
      return (
        <Loader
          className="inverse"
          innerClassName="loader-small"
          type="ballBeat" />
      );
    }

    let health = node.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  },

  renderStats(prop, node) {
    var value = node.getUsageStats(prop).percentage;

    return (
      <span className="status-bar-with-label-wrapper">
        <StatusBar
          data={[{value, className: COLOR_CLASSNAMES[prop]}]}
          scale={100} />
        <span className="label">{value}%</span>
      </span>
    );
  },

  getColumns() {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(NodesTableHeaderLabels);
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

  getColGroup() {
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

  getRowAttributes(node) {
    return {
      className: classNames({
        'danger': node.isActive() === false
      })
    };
  },

  render() {
    return (
      <Table
        className="node-table table table-borderless-outer table-borderless-inner-columns flush-bottom"
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

module.exports = NodesTable;
