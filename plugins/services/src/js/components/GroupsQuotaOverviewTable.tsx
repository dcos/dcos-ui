import * as React from "react";
import { Trans, Plural } from "@lingui/macro";
import {
  Column,
  Table,
  SortableHeaderCell,
  SpacingBox,
  InfoBoxInline,
  Icon
} from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import sort from "array-sort";

import Loader from "#SRC/js/components/Loader";

import { ServiceGroup, QuotaLimitStatuses } from "../types/ServiceGroup";
import { nameRenderer } from "../columns/QuotaOverviewNameColumn";
import { limitRenderer } from "../columns/QuotaOverviewLimitColumn";
import { cpuRenderer } from "../columns/QuotaOverviewCPUConsumedColumn";
import { memRenderer } from "../columns/QuotaOverviewMemoryConsumedColumn";
import { diskRenderer } from "../columns/QuotaOverviewDiskConsumedColumn";
import { gpuRenderer } from "../columns/QuotaOverviewGPUConsumedColumn";

import { SortDirection } from "../types/SortDirection";

export interface GroupsQuotaOverviewTableProps {
  groups: ServiceGroup[];
}

interface GroupsQuotaOverViewTableState {
  groups: ServiceGroup[];
  sortDirection: SortDirection;
  sortColumn: string;
}

const compatatorFor = (prop: string) => (a: ServiceGroup, b: ServiceGroup) =>
  ServiceGroup.getQuotaPercentage(a, prop) -
  ServiceGroup.getQuotaPercentage(b, prop);

function sortForColumn(
  columnName: string
): (a: ServiceGroup, b: ServiceGroup) => number {
  switch (columnName) {
    case "name":
      return (a, b) => a.name.localeCompare(b.name);
    case "limit":
      return (a, b) =>
        (a.quota ? a.quota.limitStatus : QuotaLimitStatuses.na).localeCompare(
          b.quota ? b.quota.limitStatus : QuotaLimitStatuses.na
        );
    case "cpus":
      return compatatorFor("cpus");
    case "mem":
      return compatatorFor("memory");
    case "disk":
      return compatatorFor("disk");
    case "gpus":
      return compatatorFor("gpus");
    default:
      return () => 0;
  }
}

class GroupsQuotaOverviewTable extends React.Component<
  GroupsQuotaOverviewTableProps,
  GroupsQuotaOverViewTableState
> {
  constructor(props: Readonly<GroupsQuotaOverviewTableProps>) {
    super(props);

    this.state = {
      groups: [],
      sortColumn: "name",
      sortDirection: "ASC"
    };
  }

  public componentWillReceiveProps(nextProps: GroupsQuotaOverviewTableProps) {
    this.setState({ groups: this.sortData(nextProps.groups || []) });
  }

  public handleSortClick = (columnName: string) => () => {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState({
      groups: this.sortData(this.state.groups, columnName, toggledDirection),
      sortColumn: columnName,
      sortDirection: toggledDirection
    });
  };

  public sortData = (
    groups: ServiceGroup[],
    sortColumn: string = this.state.sortColumn,
    sortDirection: SortDirection = this.state.sortDirection
  ): ServiceGroup[] =>
    sort(groups.slice(), sortForColumn(sortColumn), {
      reverse: sortDirection !== "ASC"
    });

  public getNoLimitInfobox() {
    const { groups } = this.state;
    const noLimitGroups = groups.filter(
      group =>
        group.quota && group.quota.limitStatus !== QuotaLimitStatuses.applied
    );

    if (!noLimitGroups.length) {
      return null;
    }

    return (
      <SpacingBox side="bottom" spacingSize="l">
        <InfoBoxInline
          appearance="default"
          message={
            <React.Fragment>
              <Icon
                shape={SystemIcons.CircleInformation}
                size={iconSizeXs}
                color="currentColor"
              />{" "}
              <Plural
                render={<span id="quota-no-limit-infobox" />}
                value={noLimitGroups.length}
                one={`# group has services not limited by quota. Update service roles
                to have quota enforced.`}
                other={`# groups have services not limited by
                quota. Update service roles to have quota enforced.`}
              />
            </React.Fragment>
          }
        />
      </SpacingBox>
    );
  }

  public render() {
    const { groups, sortColumn, sortDirection } = this.state;

    if (!groups.length) {
      return <Loader />;
    }

    return (
      <div className="table-wrapper quota-table">
        {this.getNoLimitInfobox()}
        <Table data={groups}>
          <Column
            key="name"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Name</Trans>}
                sortHandler={this.handleSortClick("name")}
                sortDirection={sortColumn === "name" ? sortDirection : null}
              />
            }
            cellRenderer={nameRenderer}
          />
          <Column
            key="limit"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Quota Limit</Trans>}
                sortHandler={this.handleSortClick("limit")}
                sortDirection={sortColumn === "limit" ? sortDirection : null}
              />
            }
            cellRenderer={limitRenderer}
          />
          <Column
            key="cpus"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">CPU Consumed</Trans>}
                sortHandler={this.handleSortClick("cpus")}
                sortDirection={sortColumn === "cpus" ? sortDirection : null}
              />
            }
            cellRenderer={cpuRenderer}
          />
          <Column
            key="mem"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Memory Consumed</Trans>}
                sortHandler={this.handleSortClick("mem")}
                sortDirection={sortColumn === "mem" ? sortDirection : null}
              />
            }
            cellRenderer={memRenderer}
          />
          <Column
            key="disk"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Disk Consumed</Trans>}
                sortHandler={this.handleSortClick("disk")}
                sortDirection={sortColumn === "disk" ? sortDirection : null}
              />
            }
            cellRenderer={diskRenderer}
          />
          <Column
            key="gpus"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">GPU Consumed</Trans>}
                sortHandler={this.handleSortClick("gpus")}
                sortDirection={sortColumn === "gpus" ? sortDirection : null}
              />
            }
            cellRenderer={gpuRenderer}
          />
        </Table>
      </div>
    );
  }
}

export default GroupsQuotaOverviewTable;
