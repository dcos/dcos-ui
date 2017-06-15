import classNames from "classnames";
import React from "react";
import { ResourceTableUtil } from "foundation-ui";
import { Table } from "reactjs-components";

import TableUtil from "../../../../../../src/js/utils/TableUtil";

const METHODS_TO_BIND = [
  "getColumnHeading",
  "renderColumnID",
  "renderColumnState",
  "renderColumnTerminationCode",
  "renderColumnTerminationMessage"
];

class PodContainerTerminationTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getColumns() {
    const { getClassName } = ResourceTableUtil;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "Container ID",
        heading: this.getColumnHeading,
        render: this.renderColumnID
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "Last State",
        heading: this.getColumnHeading,
        render: this.renderColumnState
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "Code",
        heading: this.getColumnHeading,
        render: this.renderColumnTerminationCode
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "Message",
        heading: this.getColumnHeading,
        render: this.renderColumnTerminationMessage
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{ width: "160px" }} />
        <col style={{ width: "80px" }} />
        <col style={{ width: "160px" }} />
      </colgroup>
    );
  }

  getColumnHeading(prop, order, sortBy) {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null,
      "caret--visible": prop === sortBy.prop
    });

    return (
      <span>
        {prop}
        <span className={caretClassNames} />
      </span>
    );
  }

  renderColumnID(prop, row) {
    return <span>{row.getId()}</span>;
  }

  renderColumnState(prop, row) {
    return <span>{row.getLastKnownState()}</span>;
  }

  renderColumnTerminationCode(prop, row) {
    return <span>{row.getTermination().exitCode || 0}</span>;
  }

  renderColumnTerminationMessage(prop, row) {
    return <span>{row.getTermination().message || "-"}</span>;
  }

  render() {
    return (
      <Table
        className={this.props.className}
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.containers}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "ID", order: "desc" }}
      />
    );
  }
}

PodContainerTerminationTable.defaultProps = {
  className: "table table-borderless-outer table-borderless-inner-columns flush-bottom",
  containers: []
};

PodContainerTerminationTable.propTypes = {
  className: React.PropTypes.string,
  containers: React.PropTypes.array.isRequired
};

module.exports = PodContainerTerminationTable;
