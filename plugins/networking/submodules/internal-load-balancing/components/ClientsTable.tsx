import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import * as React from "react";
import { Table } from "reactjs-components";

import FilterInputText from "#SRC/js/components/FilterInputText";
import TableUtil from "#SRC/js/utils/TableUtil";
import StringUtil from "#SRC/js/utils/StringUtil";

const RIGHT_ALIGNED_TABLE_CELLS = ["p99Latency"];

class ClientsTable extends React.Component {
  constructor() {
    super();

    this.state = {
      searchString: ""
    };
  }

  componentDidMount() {
    this.mountedAt = Date.now();
  }
  alignTableCellRight = prop => {
    return RIGHT_ALIGNED_TABLE_CELLS.indexOf(prop) > -1;
  };

  getClientsTable(clients) {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns
          table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={clients}
        sortBy={{ prop: "ip", order: "asc" }}
      />
    );
  }

  getColumns() {
    const className = this.getTableCellClassNameFn();
    const heading = this.renderHeading({
      ip: i18nMark("Client"),
      p99Latency: i18nMark("P99 Latency")
    });
    const sortFunction = TableUtil.getSortFunction(
      "ip",
      (item, prop) => item[prop]
    );

    return [
      {
        className,
        headerClassName: className,
        prop: "ip",
        sortable: true,
        sortFunction,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "p99Latency",
        render: this.renderMilliseconds,
        sortable: true,
        heading
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "50%" }} />
        <col />
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

  getHeader(clients) {
    const numClients = clients.length;

    return numClients === 1 ? (
      <Trans render="h3" className="text-align-left flush-top">
        1 Client
      </Trans>
    ) : (
      <Trans render="h3" className="text-align-left flush-top">
        {numClients} Clients
      </Trans>
    );
  }

  getTableCellClassNameFn() {
    const { alignTableCellRight } = this;

    return (prop, sortBy, row) =>
      classNames({
        "text-align-right": alignTableCellRight(prop),
        active: prop === sortBy.prop,
        clickable: row == null
      });
  }
  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
  };

  processClients(clientList) {
    return clientList.getItems().map(client => ({
      ip: client.getIP(),
      p99Latency: client.getP99Latency()
    }));
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
          <Trans render="span" className="table-header-title" id={title} />
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

  render() {
    const { searchString } = this.state;
    let clients = this.processClients(this.props.clients);

    if (searchString !== "") {
      clients = StringUtil.filterByString(clients, "ip", searchString);
    }

    return (
      <div className="flex-container-col flex-grow">
        {this.getHeader(clients)}
        <div className="flex-box control-group">
          <FilterInputText
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
          />
        </div>
        {this.getClientsTable(clients)}
      </div>
    );
  }
}

export default ClientsTable;
