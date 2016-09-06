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
import PodContainerStatus from '../constants/PodContainerStatus';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import SaveStateMixin from '../mixins/SaveStateMixin';
import TimeAgo from './TimeAgo';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'getColGroup',
  'handleItemCheck',
  'renderColumn_Address',
  'renderColumn_ID',
  'renderColumn_Resource',
  'renderColumn_Status',
  'renderColumn_Updated',
  'renderColumn_Version'
];

const STATUS_FILTER_BUTTONS = ['all', 'active', 'completed'];

class PodView extends mixin(SaveStateMixin, StoreMixin) {
  constructor() {
    super();

    this.state = {
      checkedItems: {}
    };

    this.saveState_properties = [
    ];

    this.store_listeners = [
    ];

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
      'clickable': row == null
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

  getData() {
    let instances = this.props.pod.getInstanceList();
    let spec = this.props.pod.getSpec();

    return instances.getItems().map(function (instance) {
      let resourcesSummary = {
        cpus: 0, mem: 0, disk: 0, gpus: 0
      };

      let children = instance.getContainers().map(function (container) {
        let containerSpec = spec.getContainerSpec(container.name);
        Object.keys(containerSpec.resources).forEach(function (key) {
          resourcesSummary[key] = containerSpec.resources[key];
        });

        return {
          containerId: container.containerId,
          name: container.name,
          status: container.getContainerStatus(),
          address: container.endpoints.reduce(function (addressString, ep) {
            if (addressString) {
              addressString += ', ';
            }
            addressString += ':' + ep.allocatedHostPort;
            return addressString;
          }, ''),
          cpus: containerSpec.resources.cpus,
          mem: containerSpec.resources.mem,
          updated: container.lastUpdated,
          version: ''
        };
      });

      return {
        id: instance.id,
        name: instance.id,
        address: instance.agent,
        cpus: resourcesSummary.cpus,
        mem: resourcesSummary.mem,
        updated: instance.lastUpdated,
        status: instance.getInstanceStatus(),
        version: spec.getVersion(),
        children
      };
    });

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
        <div className="job-run-history-task-id text-overflow">
          <Link
            className="emphasize clickable text-overflow"
            to="services-task-details"
            params={{id: this.props.pod.getId(), taskID: row.containerId}}
            title={row.name}>
            <CollapsingString string={row.name} />
          </Link>
        </div>
      );
    }

    let classes = classNames('job-run-history-job-id is-expandable', {
      'is-expanded': rowOptions.isExpanded
    });

    return this.renderWithClickHandler(rowOptions, classes, (
        <CollapsingString string={row.address} />
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
        <TimeAgo time={new Date(row.updated)} />
      ));
  }

  renderColumn_Version(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(rowOptions, '', (
        <CollapsingString string={row.version} />
      ));
  }

  render() {
    return (
        <ExpandingTable
          allowMultipleSelect={false}
          className="job-run-history-table table table-hover inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="job-run-history-table-child"
          checkedItemsMap={this.state.checkedItems}
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          getColGroup={this.getColGroup}
          uniqueProperty="id"
          tableComponent={CheckboxTable}
          onCheckboxChange={this.handleItemCheck}
          sortBy={{prop: 'startedAt', order: 'desc'}}
          data={this.getData()}
          />
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
