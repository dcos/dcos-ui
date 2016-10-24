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
import Loader from '../../../components/Loader';
import MesosStateStore from '../../../stores/MesosStateStore';
import Overlay from '../../../structs/Overlay';
import RequestErrorMsg from '../../../components/RequestErrorMsg';
import TaskUtil from '../../../utils/TaskUtil';
import VirtualNetworkUtil from '../../../utils/VirtualNetworkUtil';
import Util from '../../../utils/Util';

const headerMapping = {
  id: 'TASK',
  ip_address: 'CONTAINER IP',
  port_mappings: 'PORT MAPPINGS'
};
const METHODS_TO_BIND = [
  'handleSearchStringChange',
  'renderAgentIP',
  'renderID',
  'renderPorts',
  'resetFilter'
];

const agentIPPath = 'statuses.0.container_status.network_infos.0.ip_addresses';

class VirtualNetworkTaskTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      errorMessage: null,
      searchString: '',
      tasksDataReceived: false
    };

    this.store_listeners = [{
      name: 'state',
      events: ['success', 'error'],
      suppressUpdate: true
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

  handleSearchStringChange(searchString = '') {
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
      'active': prop === sortBy.prop
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
        getValue: this.getAgentIP,
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
      <div className="container container-fluid container-pod">
        <Loader className="inverse" />
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
        key={value}
        params={{overlayName: this.props.overlay.getName(), taskID}}
        title={title}
        to="virtual-networks-tab-detail-tasks-detail">
        {value}
      </Link>
    );
  }

  getTitle(portMappings) {
    return portMappings.map(function (mapping) {
      return `${mapping.container_port} > ${mapping.host_port} (${mapping.protocol})`;
    }).join(', ');
  }

  getAgentIP(task) {
    let ipAddresses = Util.findNestedPropertyInObject(task, agentIPPath);

    if (!ipAddresses || !Array.isArray(ipAddresses)) {
      return ipAddresses;
    }

    return ipAddresses.map(function (ipAddress) {
      return ipAddress.ip_address;
    }).join(', ');
  }

  renderAgentIP(prop, task) {
    let ipAddress = this.getAgentIP(task);

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
      let mapTo = null;

      if (mapping.host_port) {
        mapTo = (
          <span>
            <Icon
              className="list-inline-separator"
              family="tiny"
              id="caret-right"
              size="tiny" />
            {this.getTaskLink(id, `${mapping.host_port} (${mapping.protocol})`, title)}
          </span>
        );
      }

      return (
        <div key={index} className="table-cell-value">
          <div className="table-cell-details-secondary flex-box flex-box-align-vertical-center table-cell-flex-box">
            <div className="text-overflow service-link">
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
          onReset={this.resetFilter}
          name="Task"
          currentLength={filteredTasks.length}
          totalLength={tasks.length} />
        <FilterBar>
          <FilterInputText
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange} />
        </FilterBar>
        <Table
          className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
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
};

module.exports = VirtualNetworkTaskTab;
