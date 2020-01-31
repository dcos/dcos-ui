import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import classNames from "classnames";
import { Link } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { Table } from "reactjs-components";

import TableUtil from "#SRC/js/utils/TableUtil";

import "../styles/components/service-addresses-table/styles.less";

const columnClasses = {
  name: "service-addresses-table-column-name",
  successLastMinute: "service-addresses-table-column-successes",
  failLastMinute: "service-addresses-table-column-failures",
  failurePercent: "service-addresses-table-column-failure-perecent",
  p99Latency: "service-addresses-table-column-p99latency"
};

const RIGHT_ALIGNED_TABLE_CELLS = [
  "successLastMinute",
  "failLastMinute",
  "failurePercent",
  "applicationReachabilityPercent",
  "machineReachabilityPercent",
  "p99Latency"
];

class VIPsTable extends React.Component {
  static propTypes = {
    vips: PropTypes.arrayOf(
      PropTypes.shape({
        vip: PropTypes.string,
        successLastMinute: PropTypes.number,
        failLastMinute: PropTypes.number,
        failurePercent: PropTypes.number,
        applicationReachabilityPercent: PropTypes.number,
        machineReachabilityPercent: PropTypes.number,
        p99Latency: PropTypes.number
      })
    )
  };
  constructor() {
    super();
  }

  alignTableCellRight(prop) {
    return RIGHT_ALIGNED_TABLE_CELLS.indexOf(prop) > -1;
  }

  getColumns() {
    const className = this.getColumnClassname;
    const heading = this.renderHeading({
      name: i18nMark("Name"),
      successLastMinute: i18nMark("Successes"),
      failLastMinute: i18nMark("Failures"),
      failurePercent: i18nMark("Failure %"),
      applicationReachabilityPercent: i18nMark("App Reach"),
      machineReachabilityPercent: i18nMark("IP Reach"),
      p99Latency: i18nMark("P99 Latency")
    });
    const sortFunction = TableUtil.getSortFunction(
      "name",
      (item, prop) => item[prop]
    );

    return [
      {
        className,
        headerClassName: className,
        prop: "name",
        render: this.renderName,
        sortable: true,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "successLastMinute",
        render: this.getFailSuccessRenderFn("success"),
        sortable: true,
        heading,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        prop: "failLastMinute",
        render: this.getFailSuccessRenderFn("fail"),
        sortable: true,
        heading,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        prop: "failurePercent",
        render: this.renderPercentage,
        sortable: true,
        heading,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        prop: "p99Latency",
        sortable: true,
        render: this.renderMilliseconds,
        heading,
        sortFunction
      }
    ];
  }
  getColumnClassname = (prop, sortBy, row) => {
    return classNames(columnClasses[prop], {
      active: prop === sortBy.prop,
      clickable: row == null
    });
  };

  getColGroup() {
    return (
      <colgroup>
        <col className={columnClasses.name} />
        <col className={columnClasses.successLastMinute} />
        <col className={columnClasses.failLastMinute} />
        <col className={columnClasses.failurePercent} />
        <col className={columnClasses.p99Latency} />
      </colgroup>
    );
  }

  getFailSuccessRenderFn(type) {
    const classes = classNames({
      "text-danger": type === "fail",
      "text-success": type === "success"
    });

    return (prop, item) => <span className={classes}>{item[prop]}</span>;
  }

  renderHeading(config) {
    return (prop, order, sortBy) => {
      const title = config[prop];
      const caret = {
        before: null,
        after: null
      };
      const caretClassSet = classNames("caret", {
        [`caret--${order}`]: order != null,
        "caret--visible": prop === sortBy.prop
      });

      if (this.alignTableCellRight(prop)) {
        caret.before = <span className={caretClassSet} />;
      } else {
        caret.after = <span className={caretClassSet} />;
      }

      return (
        <span>
          {caret.before}
          <Trans render="span" id={title} className="table-header-title" />
          {caret.after}
        </span>
      );
    };
  }

  renderMilliseconds(prop, item) {
    return `${item[prop]}ms`;
  }

  renderPercentage(prop, item) {
    return `${item[prop]}%`;
  }

  renderName(prop, item) {
    const { protocol, ip: vip, port, name } = item.fullVIP;

    const displayedVIP = (
      <Link
        className="table-cell-link-primary clickable"
        to={`/networking/service-addresses/internal/service-address-detail/${vip}/${protocol}/${port}`}
      >
        {name}:{port}
      </Link>
    );

    return <div className="text-overflow">{displayedVIP}</div>;
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={this.props.vips}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "vip", order: "asc" }}
      />
    );
  }
}

VIPsTable.defaultProps = {
  vips: []
};

export default VIPsTable;
