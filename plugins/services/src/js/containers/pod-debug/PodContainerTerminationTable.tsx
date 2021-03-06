import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { Table } from "reactjs-components";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import TableUtil from "#SRC/js/utils/TableUtil";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";

class PodContainerTerminationTable extends React.Component {
  static defaultProps = {
    className:
      "table table-flush table-borderless-outer table-borderless-inner-columns flush-bottom",
    containers: [],
  };
  static propTypes = {
    className: PropTypes.string,
    containers: PropTypes.array.isRequired,
  };

  getColumns() {
    const { getClassName } = ResourceTableUtil;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: i18nMark("Container ID"),
        heading: this.getColumnHeading,
        render: this.renderColumnID,
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: i18nMark("Last State"),
        heading: this.getColumnHeading,
        render: this.renderColumnState,
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: i18nMark("Code"),
        heading: this.getColumnHeading,
        render: this.renderColumnTerminationCode,
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: i18nMark("Message"),
        heading: this.getColumnHeading,
        render: this.renderColumnTerminationMessage,
      },
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
  getColumnHeading = (prop, order, sortBy) => {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null,
      "caret--visible": prop === sortBy.prop,
    });

    return (
      <span>
        <Trans render="span" id={prop} />
        <span className={caretClassNames} />
      </span>
    );
  };
  renderColumnID = (prop, row) => {
    return <span>{row.getId()}</span>;
  };
  renderColumnState = (prop, row) => {
    return <span>{row.getLastKnownState()}</span>;
  };
  renderColumnTerminationCode = (prop, row) => {
    return <span>{row.getTermination().exitCode || 0}</span>;
  };
  renderColumnTerminationMessage = (prop, row) => {
    return <span>{row.getTermination().message || "-"}</span>;
  };

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

export default PodContainerTerminationTable;
