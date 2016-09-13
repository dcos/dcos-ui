import classNames from 'classnames';
import React from 'react';
import {Link} from 'react-router';

import CollapsingString from './CollapsingString';
import CheckboxTable from './CheckboxTable';
import ExpandingTable from './ExpandingTable';
import PodSpec from '../structs/PodSpec';
import PodTableHeaderLabels from '../constants/PodTableHeaderLabels';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import TimeAgo from './TimeAgo';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'getColGroup',
  'handleItemCheck',
  'renderColumnAddress',
  'renderColumnID',
  'renderColumnResource',
  'renderColumnStatus',
  'renderColumnUpdated',
  'renderColumnVersion'
];

class PodInstancesTable extends React.Component {
  constructor() {
    super();

    this.state = {
      checkedItems: {}
    };

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
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
    return classNames({
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

  getTableDataFor(instances, podSpec) {
    return instances.getItems().map(function (instance) {
      let resourcesSummary = {
        cpus: 0, mem: 0, disk: 0, gpus: 0
      };

      let children = instance.getContainers()
        .map(function (container) {
          let containerSpec = podSpec.getContainerSpec(container.name);
          Object.keys(containerSpec.resources).forEach(function (key) {
            resourcesSummary[key] = containerSpec.resources[key];
          });

          let addressComponents = container.endpoints.reduce(function (components, ep) {
            components.push(
              <a className="text-muted"
                href={`http://${instance.getAgentAddress()}:${ep.allocatedHostPort}`}
                target="_blank"
                title="Open in a new window">
                {':' + ep.allocatedHostPort}
              </a>
            );

            return components;
          }, []);

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

      return {
        id: instance.getId(),
        name: instance.getName(),
        address: instance.getAgentAddress(),
        cpus: resourcesSummary.cpus,
        mem: resourcesSummary.mem,
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

  renderWithClickHandler(rowOptions, className, content) {
    return (
        <div onClick={rowOptions.clickHandler} className={className}>
          {content}
        </div>
      );
  }

  renderColumnID(prop, row, rowOptions = {}) {
    if (!rowOptions.isParent) {
      return (
        <div className="pod-history-instance-id text-overflow">
          <Link
            className="emphasize clickable text-overflow"
            to="services-task-details"
            params={{id: this.props.pod.getId(), taskID: row.id}}
            title={row.name}>
            <CollapsingString string={row.name} />
          </Link>
        </div>
      );
    }

    let classes = classNames('pod-history-container-id is-expandable', {
      'is-expanded': rowOptions.isExpanded
    });

    return this.renderWithClickHandler(rowOptions, classes, (
      <CollapsingString string={row.id} />
    ));
  }

  renderColumnAddress(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <CollapsingString string={row.address} />
      ));
  }

  renderColumnStatus(prop, row, rowOptions = {}) {
    let {status} = row;
    return this.renderWithClickHandler(rowOptions, '', (
        <span>
          <span className={status.dotClassName}></span>
          <span className={status.textClassName}>
            {status.displayName}
          </span>
        </span>
      ));
  }

  renderColumnResource(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <span>{Units.formatResource(prop, row[prop])}</span>
      ));
  }

  renderColumnUpdated(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <TimeAgo time={row.updated} />
      ));
  }

  renderColumnVersion(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <CollapsingString string={row.version} />
      ));
  }

  render() {
    var {instances, podSpec} = this.props;
    var {checkedItems} = this.state;

    return (
      <div>
        <ExpandingTable
          allowMultipleSelect={false}
          className="pod-history-table table table-hover inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="pod-history-table-child"
          checkedItemsMap={checkedItems}
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.getTableDataFor(instances, podSpec)}
          getColGroup={this.getColGroup}
          onCheckboxChange={this.handleItemCheck}
          sortBy={{prop: 'startedAt', order: 'desc'}}
          tableComponent={CheckboxTable}
          uniqueProperty="id"
          />
      </div>
    );
  }

}

PodInstancesTable.defaultProps = {
  instances: [],
  inverseStyle: false,
  podSpec: null
};

PodInstancesTable.propTypes = {
  instances: React.PropTypes.array,
  inverseStyle: React.PropTypes.bool,
  podSpec: React.PropTypes.instanceOf(PodSpec)
};

module.exports = PodInstancesTable;
