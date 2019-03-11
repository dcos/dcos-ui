import { Trans } from "@lingui/macro";

import * as React from "react";
import { Table, Column, TextCell, HeaderCell, Icon } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  green,
  iconSizeXs,
  red,
  yellow
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import {
  flattenServicePlanPhases,
  ServicePlan,
  ServicePlanElement,
  NO_DATA_SERVICE_PLAN_ELEMENT
} from "#PLUGINS/services/src/js/types/ServicePlan";
import {
  formatServicePlanStatus,
  ServicePlanStatus
} from "#PLUGINS/services/src/js/types/ServicePlanStatus";

const getStatusTooltip = (data: ServicePlanElement): React.ReactNode | null => {
  const { status } = data;

  switch (status) {
    case "ERROR":
      return <Trans render="span">Execution experienced an error.</Trans>;
    case "WAITING":
      return <Trans render="span">Execution has been interrupted.</Trans>;
    case "PENDING":
      return (
        <Trans render="span">Execution is waiting for suitable offers.</Trans>
      );
    case "PREPARED":
      if (data.type === "step") {
        return (
          <Trans render="span">
            The step has been evaluated, and any Tasks relevant to it have been
            killed if necessary.
          </Trans>
        );
      }
      return (
        <Trans render="span">
          The phase has been evaluated, and any Tasks relevant to it have been
          killed if necessary.
        </Trans>
      );
    case "STARTING":
      return (
        <Trans render="span">
          Execution has performed and is waiting to determine the success of
          those operations.
        </Trans>
      );
    case "STARTED":
      return (
        <Trans render="span">
          Execution has performed and has received feedback, but not all success
          requirements (e.g. readiness checks) have been satisfied.
        </Trans>
      );
    case "IN_PROGRESS":
      if (data.type === "phase" && data.steps) {
        const { totalSteps, completedSteps } = data.steps.reduce(
          (result, step) => {
            result.totalSteps++;
            if (step.status === "COMPLETE") {
              result.completedSteps++;
            }
            return result;
          },
          {
            totalSteps: 0,
            completedSteps: 0
          }
        );
        return (
          <Trans render="span">
            {completedSteps} out of {totalSteps} steps completed.
          </Trans>
        );
      }
      // Steps should never return "IN_PROGRESS" status, only plan & status
      return null;
    case "COMPLETE":
      return <Trans render="span">Execution has completed.</Trans>;
    default:
      return null;
  }
};

export const getStatusIcon = (status: ServicePlanStatus): React.ReactNode => {
  switch (status) {
    case "ERROR":
      return (
        <Icon shape={SystemIcons.CircleClose} size={iconSizeXs} color={red} />
      );
    case "WAITING":
      return (
        <Icon shape={SystemIcons.Yield} size={iconSizeXs} color={yellow} />
      );
    case "PENDING":
      return (
        <Icon shape={SystemIcons.Yield} size={iconSizeXs} color={yellow} />
      );
    case "PREPARED":
      return <Icon shape={SystemIcons.Spinner} size={iconSizeXs} />;
    case "STARTING":
      return <Icon shape={SystemIcons.Spinner} size={iconSizeXs} />;
    case "STARTED":
      return <Icon shape={SystemIcons.Spinner} size={iconSizeXs} />;
    case "IN_PROGRESS":
      return <Icon shape={SystemIcons.Spinner} size={iconSizeXs} />;
    case "COMPLETE":
      return (
        <Icon shape={SystemIcons.CircleCheck} size={iconSizeXs} color={green} />
      );
    default:
      return <Icon shape={SystemIcons.CircleQuestion} size={iconSizeXs} />;
  }
};

const phaseCellRenderer = (data: ServicePlanElement): React.ReactNode => {
  switch (data.type) {
    case "phase":
      return (
        <TextCell>
          <strong>
            {data.name} ({data.strategy})
          </strong>
        </TextCell>
      );
    case "step":
      return (
        <TextCell>
          <span className="pod flush-right flush-vertical">{data.name}</span>
        </TextCell>
      );
    case "nodata":
      return (
        <TextCell>
          <Trans render="span">
            There are no phases available for this plan.
          </Trans>
        </TextCell>
      );
  }
};

const statusCellRenderer = (data: ServicePlanElement): React.ReactNode => {
  if (data.type === "nodata") {
    return <TextCell>{""}</TextCell>;
  }

  const icon = getStatusIcon(data.status);
  const tooltipContent = getStatusTooltip(data);

  if (tooltipContent === null) {
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
        <Tooltip content={tooltipContent} wrapText={true}>
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
  render() {
    const tableData = flattenServicePlanPhases(this.props.plan);

    if (tableData.length === 0) {
      tableData.push(NO_DATA_SERVICE_PLAN_ELEMENT);
    }

    return (
      <div className="table-wrapper">
        <Table data={tableData}>
          <Column
            header={
              <HeaderCell>
                <Trans>Phases</Trans>
              </HeaderCell>
            }
            cellRenderer={phaseCellRenderer}
            width={columnSizer}
          />
          <Column
            header={
              <HeaderCell>
                <Trans>Status</Trans>
              </HeaderCell>
            }
            cellRenderer={statusCellRenderer}
            width={columnSizer}
          />
        </Table>
      </div>
    );
  }
}

export default SDKPlanTable;
