import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FilterBar from './FilterBar';
import FilterButtons from './FilterButtons';
import FilterHeadline from './FilterHeadline';
import FilterInputText from './FilterInputText';
import KillTaskModal from './KillTaskModal';
import Loader from './Loader';
import MesosStateStore from '../stores/MesosStateStore';
import RequestErrorMsg from './RequestErrorMsg';
import SaveStateMixin from '../mixins/SaveStateMixin';
import StringUtil from '../utils/StringUtil';
import TaskStates from '../constants/TaskStates';
import TaskTable from './TaskTable';

const METHODS_TO_BIND = [
  'handleItemCheck',
  'handleKillClose',
  'handleKillSuccess',
  'handleSearchStringChange',
  'handleStatusFilterChange',
  'onStateStoreSuccess',
  'onStateStoreError',
  'resetFilter'
];

const STATUS_FILTER_BUTTONS = ['all', 'active', 'completed'];

class TaskView extends mixin(SaveStateMixin, StoreMixin) {
  constructor() {
    super();

    this.state = {
      checkedItems: {},
      killAction: '',
      mesosStateErrorCount: 0,
      searchString: '',
      filterByStatus: 'active'
    };

    this.saveState_properties = ['filterByStatus'];

    this.store_listeners = [
      {
        name: 'state',
        events: ['success', 'error'],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  componentWillMount() {
    this.saveState_key = `taskView#${this.props.itemID}`;
    super.componentWillMount();
  }

  componentWillReceiveProps(nextProps) {
    let prevCheckedItems = this.state.checkedItems;
    let checkedItems = {};

    nextProps.tasks.forEach(function (task) {
      if (prevCheckedItems[task.id]) {
        checkedItems[task.id] = true;
      }
    });

    this.setState({checkedItems});
  }

  onStateStoreSuccess() {
    if (this.state.mesosStateErrorCount !== 0) {
      this.setState({mesosStateErrorCount: 0});
    }
  }

  onStateStoreError() {
    this.setState({mesosStateErrorCount: this.state.mesosStateErrorCount + 1});
  }

  handleItemCheck(idsChecked) {
    let checkedItems = {};
    idsChecked.forEach(function (id) {
      checkedItems[id] = true;
    });

    this.setState({checkedItems});
  }

  handleKillClick(killAction) {
    this.setState({killAction});
  }

  handleKillClose() {
    this.setState({killAction: ''});
  }

  handleSearchStringChange(searchString = '') {
    this.setState({searchString});
  }

  handleStatusFilterChange(filterByStatus) {
    this.setState({filterByStatus});
  }

  handleKillSuccess() {
    this.setState({checkedItems: {}, killAction: ''});
  }

  hasLoadingError() {
    return this.state.mesosStateErrorCount >= 5;
  }

  getFilteredTasks() {
    let {tasks} = this.props;
    let {filterByStatus, searchString} = this.state;

    if (searchString !== '') {
      tasks = StringUtil.filterByString(tasks, 'id', searchString);
    }

    if (filterByStatus !== 'all') {
      tasks = tasks.filter(function (task) {
        return TaskStates[task.state].stateTypes.includes(filterByStatus);
      });
    }

    return tasks;
  }

  getLoadingScreen() {
    if (this.hasLoadingError()) {
      return <RequestErrorMsg />;
    }

    return (
      <div className="container container-fluid container-pod">
        <Loader />
      </div>
    );
  }

  getTaskTable(tasks, checkedItems) {
    let {inverseStyle, parentRouter} = this.props;

    let classSet = classNames({
      'table table-borderless-outer table-borderless-inner-columns': true,
      'flush-bottom': true,
      'inverse': inverseStyle
    });

    return (
      <TaskTable
        checkedItemsMap={checkedItems}
        className={classSet}
        onCheckboxChange={this.handleItemCheck}
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
      <span className="button-align-content badge-container label flush">
        <span className="badge-container-text">
          {StringUtil.capitalize(filterName)}
        </span>
        <span className="badge">{count || 0}</span>
      </span>
    );
  }

  getKillButtons(hasCheckedTasks) {
    if (!hasCheckedTasks) {
      return null;
    }

    return (
      <div className="button-collection flush-bottom">
        <div
          className="button button-stroke button-danger"
          onClick={this.handleKillClick.bind(this, 'killAndScale')}>
          Kill and Scale
        </div>
        <div
          className="button button-stroke button-danger"
          onClick={this.handleKillClick.bind(this, 'kill')}>
          Kill
        </div>
      </div>
    );
  }

  getKillTaskModal(checkedItems, hasCheckedTasks) {
    if (!hasCheckedTasks) {
      return null;
    }

    let {killAction} = this.state;
    let tasks = Object.keys(checkedItems);

    return (
      <KillTaskModal
        action={killAction}
        selectedItems={tasks}
        onClose={this.handleKillClose}
        onSuccess={this.handleKillSuccess}
        open={!!killAction} />
    );
  }

  getContent() {
    let {inverseStyle, label, tasks} = this.props;
    let {checkedItems, filterByStatus, searchString} = this.state;
    let filteredTasks = this.getFilteredTasks();

    // Get task states based on TaskStates types
    let taskStates = tasks.map(function (task) {
      let {stateTypes} = TaskStates[task.state];

      return stateTypes.find(function (state) {
        return state === 'active' || state === 'completed';
      });
    });

    let rightAlignLastNChildren = 0;
    let hasCheckedTasks = Object.keys(checkedItems).length !== 0;

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          currentLength={filteredTasks.length}
          inverseStyle={inverseStyle}
          isFiltering={filterByStatus !== 'all' || searchString !== ''}
          onReset={this.resetFilter}
          name={label}
          totalLength={tasks.length} />
        <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
          <FilterInputText
            className="flush-bottom"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={inverseStyle} />
          <FilterButtons
            renderButtonContent={this.getButtonContent}
            filters={STATUS_FILTER_BUTTONS}
            onFilterChange={this.handleStatusFilterChange}
            inverseStyle={inverseStyle}
            itemList={taskStates}
            selectedFilter={filterByStatus} />
          {this.getKillButtons(hasCheckedTasks)}
        </FilterBar>
        {this.getTaskTable(filteredTasks, checkedItems)}
        {this.getKillTaskModal(checkedItems, hasCheckedTasks)}
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

TaskView.defaultProps = {
  inverseStyle: false,
  itemID: '',
  label: 'Task',
  tasks: []
};

TaskView.propTypes = {
  inverseStyle: React.PropTypes.bool,
  itemID: React.PropTypes.string,
  label: React.PropTypes.string,
  parentRouter: React.PropTypes.func,
  tasks: React.PropTypes.array
};

module.exports = TaskView;
