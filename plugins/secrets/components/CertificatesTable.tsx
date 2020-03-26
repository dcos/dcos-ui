import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { Table } from "reactjs-components";

import TableUtil from "#SRC/js/utils/TableUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";

class CertificatesTable extends React.Component {
  static propTypes = {
    certificates: PropTypes.array,
  };
  constructor() {
    super();
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      "text-align-right": prop === "remove",
      active: prop === sortBy.prop,
      clickable: row == null, // this is a header
    });
  }

  renderProp(prop, row) {
    return row[prop];
  }

  renderStatus(prop, row) {
    const status = row.status;
    const dotClassSet = classNames("dot", {
      danger: status === "expired",
      success: status === "active",
    });

    return (
      <span className="button-align-content label flush">
        <span className={dotClassSet} />
        <span>{StringUtil.capitalize(status)}</span>
      </span>
    );
  }

  getColumns() {
    const { getClassName, renderProp, renderStatus } = this;
    let { renderHeading } = ResourceTableUtil;
    renderHeading = renderHeading({
      name: i18nMark("Name"),
      status: i18nMark("Status"),
      expiresAt: i18nMark("Expires"),
    });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "name",
        render: renderProp,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          "description",
          (item) => item.name
        ),
        heading: renderHeading,
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "status",
        render: renderStatus,
        sortable: true,
        sortFunction: TableUtil.getSortFunction("name", (item) => item.status),
        heading: renderHeading,
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "expiresAt",
        render: renderProp,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          "name",
          (item) => item.expiresAt
        ),
        heading: renderHeading,
      },
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col width="50%" />
        <col />
        <col />
        <col />
      </colgroup>
    );
  }

  render() {
    const { certificates } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        columns={columns}
        containerSelector=".gm-scroll-view"
        data={certificates}
        colGroup={this.getColGroup()}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "name", order: "asc" }}
        uniqueProperty="value"
      />
    );
  }
}

export default CertificatesTable;
