import classNames from 'classnames';
import React from 'react';
import {Table} from 'reactjs-components';

import DateUtil from '../utils/DateUtil';
import Icon from './Icon';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TableUtil from '../utils/TableUtil';
import TaskDirectoryHeaderLabels from '../constants/TaskDirectoryHeaderLabels';
import TaskDirectoryActions from '../events/TaskDirectoryActions';
import Units from '../utils/Units';

function renderByProperty(prop, directoryItem) {
  return directoryItem.get(prop);
}

class TaskDirectoryTable extends React.Component {
  handleTaskClick(path) {
    this.props.onFileClick(path);
  }

  renderHeadline(prop, directoryItem) {
    let label;
    let {nodeID} = this.props;
    let filePath = directoryItem.get('path');
    let iconID = 'page';
    let value = directoryItem.getName();

    if (directoryItem.isDirectory()) {
      iconID = 'folder';
      label = (
        <a
          className="emphasize clickable"
          onClick={this.handleTaskClick.bind(this, value)}>
          {value}
        </a>
      );
    } else {
      label = (
        <a
          className="emphasize"
          href={TaskDirectoryActions.getDownloadURL(nodeID, filePath)}>
          {value}
        </a>
      );
    }

    let openLogView;
    if (directoryItem.isLogFile()) {
      openLogView = (
        <div
          className="table-cell-icon table-cell-icon-mini table-display-on-row-hover fade-in-on-hover clickable"
          onClick={this.props.onOpenLogClick.bind(this, directoryItem, this.props.directoryPath)}>
          <Icon
            className="icon-margin-left"
            color="grey"
            family="mini"
            id="search"
            size="mini" />
        </div>
      );
    }

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <div className="table-cell-icon table-cell-icon-mini">
          <Icon
            className="icon-margin-right inverse"
            color="grey"
            family="mini"
            id={iconID}
            size="mini" />
        </div>
        <span title={value} className="table-cell-value text-overflow">
          {label}
        </span>
        {openLogView}
      </div>
    );
  }

  renderStats(prop, directoryItem) {
    return (
      <span>
        {Units.filesize(directoryItem.get(prop), 1)}
      </span>
    );
  }

  renderDate(prop, directoryItem) {
    let ms = directoryItem.get(prop) * 1000;

    return (
      <span title={DateUtil.msToDateStr(ms)}>
        {DateUtil.msToRelativeTime(ms)}
      </span>
    );
  }

  getClassName(prop, sortBy, row) {
    let isHeader = row == null;
    let propsToRight = ['uid', 'size', 'mtime'];

    return classNames({
      'text-align-right': propsToRight.includes(prop),
      'highlight': prop === sortBy.prop && isHeader,
      'clickable': isHeader
    });
  }

  getDirectorySortFunction(baseProp) {
    return function (prop, order) {
      return function (a, b) {
        let aIsDirectory = a.isDirectory();
        let bIsDirectory = b.isDirectory();

        if (aIsDirectory && !bIsDirectory) {
          if (order === 'desc') {
            return 1;
          }

          return -1;
        }

        if (!aIsDirectory && bIsDirectory) {
          if (order === 'desc') {
            return -1;
          }

          return 1;
        }

        return TableUtil.compareValues(
          a.get(prop),
          b.get(prop),
          a.get(baseProp),
          b.get(baseProp)
        );
      };
    };
  }

  getColumns() {
    let className = this.getClassName;
    let heading = ResourceTableUtil.renderHeading(TaskDirectoryHeaderLabels);
    let sortFunction = this.getDirectorySortFunction('path');

    let defaultColumnSettings = {
      className,
      heading,
      headerClassName: className,
      render: null,
      sortable: true,
      sortFunction
    };

    return [
      {
        prop: 'path',
        render: this.renderHeadline.bind(this)
      },
      {
        prop: 'mode',
        render: renderByProperty
      },
      {
        prop: 'uid',
        render: renderByProperty
      },
      {
        prop: 'size',
        render: this.renderStats,
        sortFunction
      },
      {
        prop: 'mtime',
        render: this.renderDate,
        sortFunction
      }
    ].map(function (columnSetting) {
      return Object.assign({}, defaultColumnSettings, columnSetting);
    });
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{width: '150px'}}/>
        <col style={{width: '110px'}}/>
        <col style={{width: '100px'}}/>
        <col style={{width: '125px'}}/>
      </colgroup>
    );
  }

  render() {
    return (
      <Table
        className="table table-borderless-outer table-borderless-inner-columns flush-bottom inverse"
        colGroup={this.getColGroup()}
        columns={this.getColumns()}
        containerSelector=".gm-scroll-view"
        data={this.props.files}
        sortBy={{prop: 'path', order: 'asc'}} />
    );
  }
}

TaskDirectoryTable.defaultProps = {
  onOpenLogClick: function () {},
  files: []
};

TaskDirectoryTable.propTypes = {
  directoryPath: React.PropTypes.string,
  onOpenLogClick: React.PropTypes.func,
  files: React.PropTypes.array
};

module.exports = TaskDirectoryTable;
