import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";

import * as React from "react";
import { Table, Column, TextCell, HeaderCell } from "@dcos/ui-kit";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import {
  flattenServicePlan,
  ServicePlan,
  ServicePlanElement
} from "#PLUGINS/services/src/js/types/ServicePlan";
import {
  formatServicePlanStatus,
  ServicePlanStatus
} from "#PLUGINS/services/src/js/types/ServicePlanStatus";

import Icon from "#SRC/js/components/Icon";
import { Tooltip } from "reactjs-components";

const getStatusTooltip = (data: ServicePlanElement): string => {
  const { status } = data;

  switch (status) {
    case "ERROR":
      return i18nMark("Execution has been interrupted.");
    case "WAITING":
      return i18nMark("Execution is waiting for suitable offers.");
    case "PENDING":
      return i18nMark("Execution is waiting for suitable offers.");
    case "PREPARED":
      return "";
    case "STARTING":
      return i18nMark(
        "Execution has performed and has received feedback, but not all success requirements (e.g. readiness checks) have been satisfied."
      );
    case "STARTED":
      return i18nMark("Execution has completed.");
    case "IN_PROGRESS":
      //TODO: Build in-progress tooltip text (This requires the phase and all it's steps), it will also
      // require translating the text inline or returning a <Trans> element to translate with template variables
      return "";
    case "COMPLETE":
      return "";
    default:
      return "";
  }
};

const getStatusIcon = (status: ServicePlanStatus): React.ReactNode => {
  switch (status) {
    case "ERROR":
      return <Icon id="circle-close" family="system" size="mini" color="red" />;
    case "WAITING":
      return <Icon id="yield" family="system" size="mini" color="yellow" />;
    case "PENDING":
      return <Icon id="yield" family="system" size="mini" color="yellow" />;
    case "PREPARED":
      return <Icon id="clock" family="system" size="mini" />;
    case "STARTING":
      return <Icon id="spinner" family="system" size="mini" />;
    case "STARTED":
      return <Icon id="spinner" family="system" size="mini" />;
    case "IN_PROGRESS":
      return <Icon id="spinner" family="system" size="mini" />;
    case "COMPLETE":
      return (
        <Icon id="circle-check" family="system" size="mini" color="green" />
      );
    default:
      return <Icon id="circle-question" family="system" size="mini" />;
  }
};

const phaseColumnRenderer = (data: ServicePlanElement): React.ReactNode => {
  if (data.type === "phase") {
    return (
      <TextCell>
        <strong>
          {data.name} ({data.strategy})
        </strong>
      </TextCell>
    );
  }
  return (
    <TextCell>
      <span style={{ marginLeft: "20px" }}>{data.name}</span>
    </TextCell>
  );
};

const statusColumnRenderer = (data: ServicePlanElement): React.ReactNode => {
  const icon = getStatusIcon(data.status);
  const tooltipText = getStatusTooltip(data);

  if (tooltipText === "") {
    return (
      <TextCell>
        <span>
          {icon}{" "}
          <Trans id={formatServicePlanStatus(data.status)} render="span" />
        </span>
      </TextCell>
    );
  }
  return (
    <TextCell>
      <span>
        <Tooltip content={<Trans id={tooltipText} render="span" />}>
          {icon}{" "}
          <Trans id={formatServicePlanStatus(data.status)} render="span" />
        </Tooltip>
      </span>
    </TextCell>
  );
};

const columnSizer = (args: WidthArgs): number => {
  return Math.max(200, args.width / args.totalColumns);
};

export interface SDKPlanTableProps {
  plan: ServicePlan;
}

class SDKPlanTable extends React.PureComponent<SDKPlanTableProps, {}> {
  getData(plan: ServicePlan) {
    return flattenServicePlan(plan);
  }

  render() {
    return (
      <div className="table-wrapper" style={{ height: "1000px" }}>
        <Table data={this.getData(this.props.plan)}>
          <Column
            header={
              <HeaderCell>
                <Trans render="strong">Phases</Trans>
              </HeaderCell>
            }
            cellRenderer={phaseColumnRenderer}
            width={columnSizer}
          />
          <Column
            header={
              <HeaderCell>
                <Trans render="strong">Status</Trans>
              </HeaderCell>
            }
            cellRenderer={statusColumnRenderer}
            width={columnSizer}
          />
        </Table>
      </div>
    );
  }
}

export default SDKPlanTable;
