import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Table } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import TimeAgo from "#SRC/js/components/TimeAgo";
import Units from "#SRC/js/utils/Units";

import TaskDirectoryActions from "../events/TaskDirectoryActions";
import TaskDirectoryHeaderLabels from "../constants/TaskDirectoryHeaderLabels";

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
            color="light-grey"
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
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
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
  directoryPath: PropTypes.string,
  onOpenLogClick: PropTypes.func,
  files: PropTypes.array
};

module.exports = TaskDirectoryTable;
