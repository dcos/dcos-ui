import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';

import EventTypes from '../constants/EventTypes';
import FilterBar from './FilterBar';
import FilterByTaskState from './FilterByTaskState';
import FilterInputText from './FilterInputText';
import MesosStateStore from '../stores/MesosStateStore';
import RequestErrorMsg from './RequestErrorMsg';
import SaveStateMixin from '../mixins/SaveStateMixin';
import StringUtil from '../utils/StringUtil';
import TaskStates from '../constants/TaskStates';
import TaskTable from './TaskTable';

const METHODS_TO_BIND = [
  'handleSearchStringChange',
  'handleStatusFilterChange',
  'onMesosStateRequestError'
];

class TaskView extends mixin(SaveStateMixin) {
  constructor() {
    super();

    this.state = {
      mesosStateErrorCount: 0,
      searchString: '',
      filterByStatus: 'all'
    };
    this.saveState_properties = ['filterByStatus'];

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  componentWillMount() {
    this.saveState_key = `taskView#${this.props.itemID}`;
    super.componentWillMount();

    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_REQUEST_ERROR,
      this.onMesosStateRequestError
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_REQUEST_ERROR,
      this.onMesosStateRequestError
    );
  }

  onMesosStateRequestError() {
    this.setState({mesosStateErrorCount: this.state.mesosStateErrorCount + 1});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  handleStatusFilterChange(filterByStatus) {
    this.setState({filterByStatus});
  }

  filterByCurrentStatus(tasks) {
    let status = this.state.filterByStatus;
    if (status === 'all') {
      return tasks;
    }

    return tasks.filter(function (task) {
      return TaskStates[task.state].stateTypes.includes(status);
    });
  }

  hasLoadingError() {
    return this.state.mesosStateErrorCount >= 3;
  }

  getStatusCounts(tasks) {
    let statusCount = {active: 0, completed: 0};

    tasks.forEach(function (task) {
      if (TaskStates[task.state].stateTypes.includes('active')) {
        statusCount.active += 1;
      }

      if (TaskStates[task.state].stateTypes.includes('completed')) {
        statusCount.completed += 1;
      }
    });

    return statusCount;
  }

  getStatuses(tasks) {
    let statusCount = this.getStatusCounts(tasks);
    return [{
      count: statusCount.active,
      id: 'active',
      name: 'Active Tasks',
      value: 'active'
    }, {
      count: statusCount.completed,
      id: 'completed',
      name: 'Completed Tasks',
      value: 'completed'
    }];
  }

  getLoadingScreen() {
    if (this.hasLoadingError()) {
      return <RequestErrorMsg />;
    }

    return (
      <div className="container container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getTaskTable(tasks) {
    let {inverseStyle, parentRouter} = this.props;

    let classSet = classNames({
      'table table-borderless-outer table-borderless-inner-columns': true,
      'flush-bottom': true,
      'inverse': inverseStyle
    });

    return (
      <TaskTable
        className={classSet}
        parentRouter={parentRouter}
        tasks={tasks} />
    );
  }

  getHeaderText(tasks) {
    let currentStatus = this.state.filterByStatus;
    let tasksLength = tasks.length;
    if (currentStatus === 'all') {
      return `${tasksLength} ${StringUtil.pluralize('Task', tasksLength)}`;
    }

    const displayNameMap = {
      active: 'Active',
      completed: 'Completed'
    };

    let statusCount = this.getStatusCounts(tasks)[currentStatus];
    let displayName = displayNameMap[currentStatus];
    let pluralizedTasks = StringUtil.pluralize('Task', statusCount);
    return `${statusCount} ${displayName} ${pluralizedTasks}`;
  }

  getContent() {
    let {inverseStyle, tasks} = this.props;
    let {filterByStatus, searchString} = this.state;

    let headerClassSet = classNames({
      'h4 text-align-left flush-top': true,
      'inverse': inverseStyle
    });

    let filterDropdownClassSet = classNames({
      'button dropdown-toggle text-align-left': true,
      'button-inverse': inverseStyle
    });

    let filterDropdownMenuClassSet = classNames({
      'dropdown-menu': true,
      'inverse': inverseStyle
    });

    if (searchString !== '') {
      tasks = StringUtil.filterByString(tasks, 'name', searchString);
    }

    tasks = this.filterByCurrentStatus(tasks);

    return (
      <div className="flex-container-col flex-grow">
        <span className={headerClassSet}>
          {this.getHeaderText(tasks)}
        </span>
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={inverseStyle} />
          <div className="form-group flush-bottom">
            <FilterByTaskState
              className={filterDropdownClassSet}
              dropdownMenuClassName={filterDropdownMenuClassSet}
              statuses={this.getStatuses(tasks)}
              handleFilterChange={this.handleStatusFilterChange}
              totalTasksCount={tasks.length}
              currentStatus={filterByStatus}/>
          </div>
        </FilterBar>
        {this.getTaskTable(tasks)}
      </div>
    );
  }

  render() {
    var showLoading = this.hasLoadingError() ||
      Object.keys(MesosStateStore.get('lastMesosState')).length === 0;

    if (showLoading) {
      return this.getLoadingScreen();
    } else {
      return this.getContent();
    }
  }
}

TaskTable.defaultProps = {
  inverseStyle: false,
  itemID: '',
  tasks: []
};

TaskView.propTypes = {
  inverseStyle: React.PropTypes.bool,
  itemID: React.PropTypes.string,
  tasks: React.PropTypes.array
};

module.exports = TaskView;
