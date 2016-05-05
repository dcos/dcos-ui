import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';

import EventTypes from '../constants/EventTypes';
import FilterBar from './FilterBar';
import FilterButtons from './FilterButtons';
import FilterHeadline from './FilterHeadline';
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
  'onMesosStateRequestError',
  'resetFilter'
];

const STATUS_FILTER_BUTTONS = ['all', 'active', 'completed'];

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

  resetFilter() {
    this.setState({
      searchString: '',
      filterByStatus: 'all'
    });
  }

  getButtonContent(filterName, count) {
    return (
      <span className="button-align-content">
        <span className="label">{StringUtil.capitalize(filterName)}</span>
        <span className="badge">{count || 0}</span>
      </span>
    );
  }

  getContent() {
    let {inverseStyle, tasks} = this.props;
    let {filterByStatus, searchString} = this.state;

    let totalNumberOfTasks = tasks.length;

    // Get task states based on TaskStates types
    let taskStates = tasks.map(function (task) {
      let {stateTypes} = TaskStates[task.state];

      return stateTypes.find(function (state) {
        return state === 'active' || state === 'completed';
      });
    });

    if (searchString !== '') {
      tasks = StringUtil.filterByString(tasks, 'name', searchString);
    }

    tasks = this.filterByCurrentStatus(tasks);

    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          inverseStyle={inverseStyle}
          onReset={this.resetFilter}
          name="Tasks"
          currentLength={tasks.length}
          totalLength={totalNumberOfTasks} />
        <FilterBar>
          <FilterButtons
            renderButtonContent={this.getButtonContent}
            filters={STATUS_FILTER_BUTTONS}
            onFilterChange={this.handleStatusFilterChange}
            inverseStyle={inverseStyle}
            itemList={taskStates}
            selectedFilter={filterByStatus} />
          <div className="form-group flush-bottom">
            <FilterInputText
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
              inverseStyle={inverseStyle} />
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
  parentRouter: React.PropTypes.func.isRequired,
  tasks: React.PropTypes.array
};

module.exports = TaskView;
