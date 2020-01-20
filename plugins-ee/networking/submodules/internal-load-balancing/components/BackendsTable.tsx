import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { Table } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import CompositeState from "#SRC/js/structs/CompositeState";
import CollapsingString from "#SRC/js/components/CollapsingString";
import StringUtil from "#SRC/js/utils/StringUtil";
import FilterInputText from "#SRC/js/components/FilterInputText";

const COLUMNS_TO_HIDE_MINI = [
  "failurePercent",
  "applicationReachabilityPercent",
  "machineReachabilityPercent"
];

const RIGHT_ALIGNED_TABLE_CELLS = [
  "successLastMinute",
  "failLastMinute",
  "p99Latency",
  "appReachability",
  "machineReachability"
];

class BackendsTable extends React.Component {
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

  getBackendsTable(backends) {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns
          table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={backends}
        sortBy={{ prop: "ip", order: "asc" }}
      />
    );
  }

  getColumns() {
    const className = this.getTableCellClassName();
    const { displayedData } = this.props;
    const heading = this.renderHeading({
      ip: i18nMark("Name"),
      successLastMinute: i18nMark("Successes"),
      failLastMinute: i18nMark("Failures"),
      p99Latency: i18nMark("P99 Latency"),
      appReachability: i18nMark("Application Reachability"),
      machineReachability: i18nMark("IP Reachability")
    });

    const columns = [
      {
        className,
        headerClassName: className,
        prop: "ip",
        render: this.renderBackendName,
        sortable: true,
        heading
      }
    ];

    if (displayedData === "app-reachability") {
      return columns.concat([
        {
          className,
          headerClassName: className,
          prop: "appReachability",
          render: this.renderPercent,
          sortable: true,
          heading
        }
      ]);
    }

    if (displayedData === "machine-reachability") {
      return columns.concat([
        {
          className,
          headerClassName: className,
          prop: "machineReachability",
          render: this.renderPercent,
          sortable: true,
          heading
        }
      ]);
    }

    // default is 'success'
    return columns.concat([
      {
        className,
        headerClassName: className,
        prop: "successLastMinute",
        render: this.getFailSuccessRender("success"),
        sortable: true,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: "failLastMinute",
        render: this.getFailSuccessRender("fail"),
        sortable: true,
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
    ]);
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "35%" }} />
        <col className="hidden-small-down" />
        <col className="hidden-small-down" />
      </colgroup>
    );
  }

  getFailSuccessRender(type) {
    const classes = classNames({
      "text-danger": type === "fail",
      "text-success": type === "success"
    });

    return (prop, item) => <span className={classes}>{item[prop]}</span>;
  }

  getHeader(backends) {
    const numBackends = backends.length;

    return numBackends === 1 ? (
      <Trans render="h3" className="text-align-left flush-top">
        1 Backend
      </Trans>
    ) : (
      <Trans render="h3" className="text-align-left flush-top">
        {numBackends} Backends
      </Trans>
    );
  }

  getTableCellClassName() {
    const { alignTableCellRight, hideColumnAtMini } = this;

    return (prop, sortBy, row) =>
      classNames({
        "text-align-right": alignTableCellRight(prop),
        "hidden-small-down": hideColumnAtMini(prop),
        active: prop === sortBy.prop,
        clickable: row == null
      });
  }
  handleBackendClick = (backend_protocol, backend_vip, backend_port) => {
    const { vip, protocol, port } = this.props.params;
    this.context.router.push(
      `/networking/service-addresses/internal/service-address-detail/${vip}/${protocol}/${port}/backend-detail/${backend_vip}/${backend_protocol}/${backend_port}`
    );
  };
  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
  };

  hideColumnAtMini(prop) {
    return COLUMNS_TO_HIDE_MINI.indexOf(prop) > -1;
  }

  processBackends(backendsList) {
    return backendsList.getItems().map(backend => ({
      ip: backend.getIP(),
      port: backend.getPort(),
      successLastMinute: backend.getSuccessLastMinute(),
      failLastMinute: backend.getFailLastMinute(),
      p99Latency: backend.getP99Latency(),
      taskID: backend.getTaskID(),
      frameworkID: backend.getFrameworkID(),
      machineReachability: backend.getMachineReachabilityPercent(),
      appReachability: backend.getApplicationReachabilityPercent(),
      fullIPString: `${backend.getIP()}:${backend.getPort()}`
    }));
  }
  renderBackendName = (prop, item) => {
    let backendSubheading;
    let frameworkName = item.frameworkID;
    const selectedService =
      CompositeState.getServiceList().filter({
        ids: [frameworkName]
      }) || [];
    const taskID = item.taskID;

    if (selectedService[0] && selectedService[0].name) {
      frameworkName = selectedService[0].name;
    }

    if (frameworkName != null && taskID != null) {
      backendSubheading = [
        <div
          className="backends-table-task-details-framework-id
          table-cell-value"
          key="framework-name"
        >
          <CollapsingString string={frameworkName} />
        </div>,
        <span className="list-inline-separator" key="separator">
          <Icon
            color={greyDark}
            shape={SystemIcons.CaretRight}
            size={iconSizeXs}
          />
        </span>,
        <div
          className="backends-table-task-details-task-id table-cell-value"
          key="task-id"
        >
          <CollapsingString string={taskID} />
        </div>
      ];
    } else if (taskID == null && frameworkName != null) {
      backendSubheading = (
        <div
          className="backends-table-task-details-framework-id
          table-cell-value"
        >
          <div className="text-overflow" title={item.frameworkID}>
            {frameworkName}
          </div>
        </div>
      );
    } else if (taskID != null && frameworkName == null) {
      backendSubheading = (
        <div className="backends-table-task-details-task-id table-cell-value">
          <div className="text-overflow" title={taskID}>
            {taskID}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="backends-table-ip-address emphasize">
          <a
            className="clickable table-cell-link-primary text-overflow"
            onClick={this.handleBackendClick.bind(
              this,
              this.props.vipProtocol,
              item.ip,
              item.port
            )}
            title={`${item.ip}:${item.port}`}
          >
            {item.ip}:{item.port}
          </a>
        </div>
        <div
          className="backends-table-task-details table-cell-details-secondary
          flex-box flex-box-align-vertical-center table-cell-flex-box
          deemphasize"
        >
          {backendSubheading}
        </div>
      </div>
    );
  };

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

  renderPercent(prop, item) {
    return `${item[prop]}%`;
  }

  render() {
    let backends = this.processBackends(this.props.backends);

    if (this.state.searchString !== "") {
      backends = StringUtil.filterByString(
        backends,
        "fullIPString",
        this.state.searchString
      );
    }

    return (
      <div className="flex-container-col flex-grow">
        {this.getHeader(backends)}
        <div className="flex-box control-group">
          <FilterInputText
            searchString={this.state.searchString}
            handleFilterChange={this.handleSearchStringChange}
          />
        </div>
        {this.getBackendsTable(backends)}
      </div>
    );
  }
}

BackendsTable.contextTypes = {
  router: PropTypes.object
};

export default BackendsTable;
