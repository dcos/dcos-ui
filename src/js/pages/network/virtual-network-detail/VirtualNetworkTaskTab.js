import classNames from 'classnames';
import {Link} from 'react-router';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Table} from 'reactjs-components';

import FilterBar from '../../../components/FilterBar';
import FilterHeadline from '../../../components/FilterHeadline';
import FilterInputText from '../../../components/FilterInputText';
import Icon from '../../../components/Icon';
import MesosStateStore from '../../../stores/MesosStateStore';
import Overlay from '../../../structs/Overlay';
import RequestErrorMsg from '../../../components/RequestErrorMsg';
import TaskUtil from '../../../utils/TaskUtil';
import VirtualNetworkUtil from '../../../utils/VirtualNetworkUtil';
import Util from '../../../utils/Util';

const headerMapping = {
  id: 'TASK',
  ip_address: 'AGENT IP',
  port_mappings: 'PORT MAPPINGS'
};
const METHODS_TO_BIND = [
  'handleSearchStringChange',
  'renderID',
  'renderPorts',
  'resetFilter'
];

class VirtualNetworkTaskTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorMessage: null,
      tasksDataReceived: false
    };

    this.store_listeners = [{
      name: 'state',
      events: ['success', 'error']
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onStateStoreError(errorMessage) {
    this.setState({tasksDataReceived: true, errorMessage});
  }

  onStateStoreSuccess() {
    this.setState({tasksDataReceived: true, errorMessage: null});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  resetFilter() {
    this.setState({searchString: ''});
  }

  isLoading() {
    return !this.state.tasksDataReceived;
  }

  getFilteredTasks(tasks, searchString = '') {
    if (searchString === '') {
      return tasks;
    }

    return tasks.filter(function (task) {
      return task.name.includes(searchString) ||
        task.id.includes(searchString);
    });
  }

  getClassName(prop, sortBy) {
    return classNames({
      'highlight': prop === sortBy.prop
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = this.renderHeading;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'id',
        render: this.renderID,
        sortable: false
      },
      {
        className: getClassName,
        getValue: function (task) {
          return Util.findNestedPropertyInObject(
            task,
            'statuses.0.container_status.network_infos.0.ip_address'
          );
        },
        headerClassName: getClassName,
        heading,
        prop: 'ip_address',
        render: this.renderAgentIP,
        sortable: false
      },
      {
        className: getClassName,
        getValue: TaskUtil.getPortMappings,
        headerClassName: getClassName,
        heading,
        prop: 'port_mappings',
        render: this.renderPorts,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '50%'}} />
        <col />
        <col />
      </colgroup>
    );
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getTaskLink(taskID, value, title) {
    if (!value) {
      value = taskID;
    }

    if (!title) {
      title = taskID;
    }

    return (
      <Link
        className="clickable"
        params={{overlayName: this.props.overlay.getName(), taskID}}
        title={title}
        to="virtual-networks-tab-detail-tasks-detail">
        {value}
      </Link>
    );
  }

  getTitle(portMappings) {
    return portMappings.map(function (mapping) {
      return `${mapping.container_port} > ${mapping.host_port} (${mapping.protocol})`
    }).join(', ')
  }

  renderAgentIP(task) {
    let ipAddress = Util.findNestedPropertyInObject(
      task,
      'statuses.0.container_status.network_infos.0.ip_address'
    );

    if (!ipAddress) {
      return 'N/A';
    }

    return ipAddress;
  }

  renderHeading(prop) {
    return (
      <span className="table-header-title">{headerMapping[prop]}</span>
    );
  }

  renderID(prop, task) {
    return this.getTaskLink(task.id);
  }

  renderPorts(prop, task) {
    let portMappings = TaskUtil.getPortMappings(task);
    if (!portMappings) {
      return 'N/A';
    }

    let title = this.getTitle(portMappings);
    if (portMappings.length > 3) {
      portMappings = portMappings.slice(0, 2);
      portMappings.push({container_port: '...'});
    }

    let {id} = task;
    return portMappings.map((mapping, index) => {
      let mapTo = [];

      if (mapping.host_port) {
        mapTo.push(
          <Icon
            className="list-inline-separator"
            family="tiny"
            id="caret-right"
            size="tiny" />
        );
        mapTo.push(this.getTaskLink(
          id,
          `${mapping.host_port} (${mapping.protocol})`,
          title
        ));
      }

      return (
        <div key={index} className="table-cell-value">
          <div className="table-cell-details-secondary flex-box flex-box-align-vertical-center table-cell-flex-box">
            <div className="text-overflow service-link inverse">
              {this.getTaskLink(id, mapping.container_port, title)}
              {mapTo}
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    let {errorMessage, searchString} = this.state;
    if (this.isLoading()) {
      return this.getLoadingScreen();
    }

    if (errorMessage) {
      return this.getErrorScreen();
    }

    let {overlay} = this.props;
    if (!overlay) {
      return VirtualNetworkUtil.getEmptyNetworkScreen();
    }

    let tasks = MesosStateStore.getTasksFromVirtualNetworkName(
      overlay.getName()
    );
    let filteredTasks = this.getFilteredTasks(tasks, searchString);

    return (
      <div>
        <FilterHeadline
          inverseStyle={true}
          onReset={this.resetFilter}
          name="Task"
          currentLength={filteredTasks.length}
          totalLength={tasks.length} />
        <FilterBar>
          <FilterInputText
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true} />
        </FilterBar>
        <Table
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={filteredTasks} />
      </div>
    );
  }
}

VirtualNetworkTaskTab.contextTypes = {
  router: React.PropTypes.func
};

VirtualNetworkTaskTab.propTypes = {
  overlay: React.PropTypes.instanceOf(Overlay)
}

module.exports = VirtualNetworkTaskTab;
