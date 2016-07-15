import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FilterBar from './FilterBar';
import FilterButtons from './FilterButtons';
import FilterHeadline from './FilterHeadline';
import FilterInputText from './FilterInputText';
import KillTaskModal from './KillTaskModal';
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

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  handleStatusFilterChange(filterByStatus) {
    this.setState({filterByStatus});
  }

  handleKillSuccess() {
    this.setState({checkedItems: {}, killAction: ''});
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
    return this.state.mesosStateErrorCount >= 5;
  }

  getLoadingScreen() {
    if (this.hasLoadingError()) {
      return <RequestErrorMsg />;
    }

    return (
      <div className="container container-pod container-fluid text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
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
      <span className="button-align-content">
        <span className="label">{StringUtil.capitalize(filterName)}</span>
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
    let {inverseStyle, tasks} = this.props;
    let {checkedItems, filterByStatus, searchString} = this.state;

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

    let rightAlignLastNChildren = 0;
    let hasCheckedTasks = Object.keys(checkedItems).length !== 0;
    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          inverseStyle={inverseStyle}
          onReset={this.resetFilter}
          name="Task"
          currentLength={tasks.length}
          totalLength={totalNumberOfTasks} />
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
        {this.getTaskTable(tasks, checkedItems)}
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

TaskTable.defaultProps = {
  inverseStyle: false,
  itemID: '',
  tasks: []
};

TaskView.propTypes = {
  inverseStyle: React.PropTypes.bool,
  itemID: React.PropTypes.string,
  parentRouter: React.PropTypes.func,
  tasks: React.PropTypes.array
};

module.exports = TaskView;
