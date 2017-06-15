import classNames from "classnames";
import React from "react";
import { ResourceTableUtil } from "foundation-ui";
import { Table } from "reactjs-components";

import Icon from "../../../../../src/js/components/Icon";
import TableUtil from "../../../../../src/js/utils/TableUtil";
import TaskDirectoryHeaderLabels from "../constants/TaskDirectoryHeaderLabels";
import TaskDirectoryActions from "../events/TaskDirectoryActions";
import TimeAgo from "../../../../../src/js/components/TimeAgo";
import Units from "../../../../../src/js/utils/Units";

function renderByProperty(prop, directoryItem) {
  return directoryItem.get(prop);
}

class TaskDirectoryTable extends React.Component {
  handleTaskClick(path) {
    this.props.onFileClick(path);
  }

  renderHeadline(prop, directoryItem) {
    let label;
    const { nodeID } = this.props;
    const filePath = directoryItem.get("path");
    let iconID = "page";
    const value = directoryItem.getName();

    if (directoryItem.isDirectory()) {
      iconID = "folder";
      label = (
        <a
          className="table-cell-link-primary clickable"
          onClick={this.handleTaskClick.bind(this, value)}
        >
          {value}
        </a>
      );
    } else {
      label = (
        <a
          className="table-cell-link-primary"
          href={TaskDirectoryActions.getDownloadURL(nodeID, filePath)}
        >
          {value}
        </a>
      );
    }

    let openLogView;
    if (directoryItem.isLogFile()) {
      openLogView = (
        <div
          className="table-cell-icon table-display-on-row-hover fade-in-on-hover clickable"
          onClick={this.props.onOpenLogClick.bind(
            this,
            directoryItem,
            this.props.directoryPath
          )}
        >
          <Icon
            className="icon-margin-left"
            color="grey"
            id="search"
            size="mini"
          />
        </div>
      );
    }

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <div className="table-cell-icon">
          <Icon
            className="icon-margin-right"
            color="grey"
            id={iconID}
            size="mini"
          />
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
    const ms = directoryItem.get(prop) * 1000;

    return <TimeAgo time={ms} autoUpdate={false} />;
  }

  getClassName(prop, sortBy, row) {
    const isHeader = row == null;
    const propsToRight = ["uid", "size", "mtime"];

    return classNames({
      "text-align-right": propsToRight.includes(prop),
      active: prop === sortBy.prop && isHeader,
      clickable: isHeader
    });
  }

  getDirectorySortFunction(baseProp) {
    return function(prop, order) {
      return function(a, b) {
        const aIsDirectory = a.isDirectory();
        const bIsDirectory = b.isDirectory();

        if (aIsDirectory && !bIsDirectory) {
          if (order === "desc") {
            return 1;
          }

          return -1;
        }

        if (!aIsDirectory && bIsDirectory) {
          if (order === "desc") {
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
    const className = this.getClassName;
    const heading = ResourceTableUtil.renderHeading(TaskDirectoryHeaderLabels);
    const sortFunction = this.getDirectorySortFunction("path");

    const defaultColumnSettings = {
      className,
      heading,
      headerClassName: className,
      render: null,
      sortable: true,
      sortFunction
    };

    return [
      {
        prop: "path",
        render: this.renderHeadline.bind(this)
      },
      {
        prop: "mode",
        render: renderByProperty
      },
      {
        prop: "uid",
        render: renderByProperty
      },
      {
        prop: "size",
        render: this.renderStats,
        sortFunction
      },
      {
        prop: "mtime",
        render: this.renderDate,
        sortFunction
      }
    ].map(function(columnSetting) {
      return Object.assign({}, defaultColumnSettings, columnSetting);
    });
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{ width: "150px" }} />
        <col style={{ width: "110px" }} />
        <col style={{ width: "100px" }} />
        <col style={{ width: "125px" }} />
      </colgroup>
    );
  }

  render() {
    return (
      <Table
        className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
        colGroup={this.getColGroup()}
        columns={this.getColumns()}
        containerSelector=".gm-scroll-view"
        data={this.props.files}
        sortBy={{ prop: "path", order: "asc" }}
      />
    );
  }
}

TaskDirectoryTable.defaultProps = {
  onOpenLogClick() {},
  files: []
};

TaskDirectoryTable.propTypes = {
  directoryPath: React.PropTypes.string,
  onOpenLogClick: React.PropTypes.func,
  files: React.PropTypes.array
};

module.exports = TaskDirectoryTable;
