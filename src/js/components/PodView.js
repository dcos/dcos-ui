import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';
import {Link} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CollapsingString from './CollapsingString';
import CheckboxTable from './CheckboxTable';
import ExpandingTable from './ExpandingTable';
import Pod from '../structs/Pod';
import PodTableHeaderLabels from '../constants/PodTableHeaderLabels';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import PodUtil from '../utils/PodUtil';
import PodViewFilter from './PodViewFilter';
import SaveStateMixin from '../mixins/SaveStateMixin';
import TimeAgo from './TimeAgo';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'getColGroup',
  'handleItemCheck',
  'handleFilterChange',
  'renderColumn_Address',
  'renderColumn_ID',
  'renderColumn_Resource',
  'renderColumn_Status',
  'renderColumn_Updated',
  'renderColumn_Version'
];

class PodView extends mixin(SaveStateMixin, StoreMixin) {
  constructor() {
    super();

    this.state = {
      checkedItems: {},
      filter: {
        text: '',
        status: 'active'
      }
    };

    this.saveState_properties = [
    ];

    this.store_listeners = [
    ];

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  handleFilterChange(filter) {
    this.setState({filter});
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
        render: this.renderColumn_ID,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'address',
        render: this.renderColumn_Address,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'status',
        render: this.renderColumn_Status,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'cpus',
        render: this.renderColumn_Resource,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'mem',
        render: this.renderColumn_Resource,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'updated',
        render: this.renderColumn_Updated,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'version',
        render: this.renderColumn_Version,
        sortable: true
      }
    ];
  }

  getTableDataFor(instances, filter) {
    let spec = this.props.pod.getSpec();

    return instances.getItems().map(function (instance) {
      let resourcesSummary = {
        cpus: 0, mem: 0, disk: 0, gpus: 0
      };

      let children = instance.getContainers()
        .filter(function (container) {
          return PodUtil.isContainerMatchingText(container, filter.text);
        })
        .map(function (container) {
          let containerSpec = spec.getContainerSpec(container.name);
          Object.keys(containerSpec.resources).forEach(function (key) {
            resourcesSummary[key] = containerSpec.resources[key];
          });

          return {
            id: container.getId(),
            name: container.getName(),
            status: container.getContainerStatus(),
            address: container.endpoints.reduce(function (components, ep) {
              components.push(
                <a className="text-muted"
                  href={
                    'http://' +
                    instance.getAgentAddress() + ':' +
                    ep.allocatedHostPort
                  }
                  target="_blank"
                  title="Open in a new window">
                  {':' + ep.allocatedHostPort}
                </a>
              );

              return components;
            }, []),
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
        version: spec.getVersion(),
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

  renderColumn_ID(prop, row, rowOptions = {}) {
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

  renderColumn_Address(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <CollapsingString string={row.address} />
      ));
  }

  renderColumn_Status(prop, row, rowOptions = {}) {
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

  renderColumn_Resource(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <span>{Units.formatResource(prop, row[prop])}</span>
      ));
  }

  renderColumn_Updated(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <TimeAgo time={row.updated} />
      ));
  }

  renderColumn_Version(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <CollapsingString string={row.version} />
      ));
  }

  render() {
    var {inverseStyle, pod} = this.props;
    var {checkedItems, filter} = this.state;
    let allItems = pod.getInstanceList();
    let filteredTextItems = allItems;
    let filteredItems = allItems;

    if (filter.text) {
      filteredTextItems = allItems.filterItems((instance) => {
        return PodUtil.isInstanceOrChildrenMatchingText(instance, filter.text);
      });
      filteredItems = filteredTextItems;
    }

    if (filter.status && (filter.status !== 'all')) {
      filteredItems = filteredTextItems.filterItems((instance) => {
        return this.getInstanceFilterStatus(instance) === filter.status;
      });
    }

    return (
      <div>
        <PodViewFilter
          filter={filter}
          inverseStyle={inverseStyle}
          items={filteredTextItems.getItems()}
          onFilterChange={this.handleFilterChange}
          statusChoices={['all', 'active', 'completed']}
          statusMapper={this.getInstanceFilterStatus}
          />
        <ExpandingTable
          allowMultipleSelect={false}
          className="pod-history-table table table-hover inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="pod-history-table-child"
          checkedItemsMap={checkedItems}
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.getTableDataFor(filteredItems, filter)}
          expandAll={!!filter.text}
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

PodView.defaultProps = {
  inverseStyle: false,
  pod: []
};

PodView.propTypes = {
  inverseStyle: React.PropTypes.bool,
  parentRouter: React.PropTypes.func,
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodView;
