import classNames from 'classnames';
import React from 'react';
import {Link} from 'react-router';

import CollapsingString from './CollapsingString';
import CheckboxTable from './CheckboxTable';
import EventTypes from '../constants/EventTypes';
import ExpandingTable from './ExpandingTable';
import MesosStateStore from '../stores/MesosStateStore';
import Pod from '../structs/Pod';
import PodInstanceList from '../structs/PodInstanceList';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import PodTableHeaderLabels from '../constants/PodTableHeaderLabels';
import PodUtil from '../utils/PodUtil';
import TimeAgo from './TimeAgo';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'getColGroup',
  'handleItemCheck',
  'handleMesosStateChange',
  'renderColumnAddress',
  'renderColumnID',
  'renderColumnResource',
  'renderColumnStatus',
  'renderColumnUpdated',
  'renderColumnVersion'
];

class PodInstancesTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      checkedItems: {}
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );
  }

  componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );
  }

  handleMesosStateChange() {
    this.forceUpdate();
  }

  handleItemCheck(idsChecked) {
    let checkedItems = {};

    idsChecked.forEach(function (id) {
      checkedItems[id] = true;
    });
    this.setState({checkedItems});
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '120px'}} />
        <col style={{width: '64px'}} />
        <col style={{width: '86px'}} />
        <col style={{width: '160px'}} />
        <col style={{width: '160px'}} />
      </colgroup>
    );
  }

  getColumnHeading(prop, order, sortBy) {
    let caretClassNames = classNames(
      'caret',
      {
        [`caret--${order}`]: order != null,
        'caret--visible': prop === sortBy.prop
      }
    );

    return (
      <span>
        {PodTableHeaderLabels[prop]}
        <span className={caretClassNames}></span>
      </span>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames(`column-${prop}`, {
      'highlight': prop === sortBy.prop,
      'clickable': row == null,
      'table-cell-task-dot': prop === 'status'
    });
  }

  getColumns() {
    return [
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'name',
        render: this.renderColumnID,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'address',
        render: this.renderColumnAddress,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'status',
        render: this.renderColumnStatus,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'cpus',
        render: this.renderColumnResource,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'mem',
        render: this.renderColumnResource,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'updated',
        render: this.renderColumnUpdated,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'version',
        render: this.renderColumnVersion,
        sortable: true
      }
    ];
  }

  getContainersWithResources(podSpec, containers, agentAddress) {
    let resourcesSum = {
      cpus: 0, mem: 0, disk: 0, gpus: 0
    };

    let children = containers.map(function (container) {
      let containerSpec = podSpec.getContainerSpec(container.name);
      Object.keys(containerSpec.resources).forEach(function (key) {
        resourcesSum[key] += containerSpec.resources[key];
      });

      let addressComponents = container.endpoints.map(function (endpoint, i) {
        return (
          <a className="text-muted"
            href={`http://${agentAddress}:${endpoint.allocatedHostPort}`}
            key={i}
            target="_blank"
            title="Open in a new window">
            {endpoint.allocatedHostPort}
          </a>
        );
      });

      return {
        id: container.getId(),
        name: container.getName(),
        status: container.getContainerStatus(),
        address: addressComponents,
        cpus: containerSpec.resources.cpus,
        mem: containerSpec.resources.mem,
        updated: container.getLastUpdated(),
        version: ''
      };
    });

    return {children, resourcesSum};
  }

  getTableDataFor(instances, filterText) {
    let podSpec = this.props.pod.getSpec();

    return instances.getItems().map((instance) => {
      let containers = instance.getContainers().filter(function (container) {
        return PodUtil.isContainerMatchingText(container, filterText);
      });
      let {children, resourcesSum} = this.getContainersWithResources(
        podSpec, containers, instance.getAgentAddress()
      );

      return {
        id: instance.getId(),
        name: instance.getName(),
        address: instance.getAgentAddress(),
        cpus: resourcesSum.cpus,
        mem: resourcesSum.mem,
        updated: instance.getLastUpdated(),
        status: instance.getInstanceStatus(),
        version: podSpec.getVersion(),
        children
      };
    });

  }

  getInstanceFilterStatus(instance) {
    let status = instance.getInstanceStatus();
    switch (status) {
      case PodInstanceStatus.STAGED:
        return 'staged';

      case PodInstanceStatus.HEALTHY:
      case PodInstanceStatus.UNHEALTHY:
      case PodInstanceStatus.RUNNING:
        return 'active';

      case PodInstanceStatus.KILLED:
        return 'completed';

      default:
        return '';
    }
  }

  renderWithClickHandler(rowOptions, content, className) {
    return (
      <div onClick={rowOptions.clickHandler} className={className}>
        {content}
      </div>
    );
  }

  renderColumnID(prop, row, rowOptions = {}) {
    if (!rowOptions.isParent) {
      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          <Link
            className="emphasize clickable text-overflow"
            to="services-task-details"
            params={{
              id: encodeURIComponent(this.props.pod.getId()),
              taskID: row.id
            }}
            title={row.name}>
            <CollapsingString string={row.name} />
          </Link>
        </div>
      );
    }

    let classes = classNames('expanding-table-primary-cell is-expandable', {
      'is-expanded': rowOptions.isExpanded
    });

    return this.renderWithClickHandler(
      rowOptions,
      (<CollapsingString string={row.id} />),
      classes
    );
  }

  renderColumnAddress(prop, row, rowOptions = {}) {
    let {address} = row;

    if (rowOptions.isParent) {
      let agent = MesosStateStore.getNodeFromHostname(address);
      if (!agent) {
        return this.renderWithClickHandler(rowOptions, (
          <CollapsingString string={address} />
        ));
      }

      return this.renderWithClickHandler(rowOptions, (
          <Link
            className="emphasize clickable text-overflow"
            to="node-tasks-tab"
            params={{nodeID: agent.id}}
            title={address}>
            <CollapsingString string={address} />
          </Link>
        ));
    }

    return this.renderWithClickHandler(rowOptions, address);
  }

  renderColumnStatus(prop, row, rowOptions = {}) {
    let {status} = row;
    return this.renderWithClickHandler(rowOptions, (
      <span>
        <span className={status.dotClassName}></span>
        <span className={`status-text ${status.textClassName}`}>
          {status.displayName}
        </span>
      </span>
    ));
  }

  renderColumnResource(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, (
      <span>{Units.formatResource(prop, row[prop])}</span>
    ));
  }

  renderColumnUpdated(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, (
      <TimeAgo time={row.updated} />
    ));
  }

  renderColumnVersion(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, (
      <CollapsingString string={row.version} />
    ));
  }

  render() {
    let {instances, pod, filterText} = this.props;
    let {checkedItems} = this.state;

    // If custom list of instances is not provided, use the default instances
    // from the pod
    if (instances == null) {
      instances = pod.getInstanceList();
    }

    return (
      <ExpandingTable
        allowMultipleSelect={false}
        className="pod-instances-table expanding-table table table-hover table-borderless-outer table-borderless-inner-columns flush-bottom"
        childRowClassName="expanding-table-child"
        checkedItemsMap={checkedItems}
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.getTableDataFor(instances, filterText)}
        expandAll={!!filterText}
        getColGroup={this.getColGroup}
        onCheckboxChange={this.handleItemCheck}
        sortBy={{prop: 'startedAt', order: 'desc'}}
        tableComponent={CheckboxTable}
        uniqueProperty="id" />
    );
  }

}

PodInstancesTable.defaultProps = {
  filterText: '',
  instances: null,
  inverseStyle: false,
  pod: null
};

PodInstancesTable.propTypes = {
  filterText: React.PropTypes.string,
  instances: React.PropTypes.instanceOf(PodInstanceList),
  inverseStyle: React.PropTypes.bool,
  pod: React.PropTypes.instanceOf(Pod).isRequired
};

module.exports = PodInstancesTable;
