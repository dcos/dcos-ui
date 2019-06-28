import React from "react";
import { Trans } from "@lingui/macro";
import { Column, Table, HeaderCell } from "@dcos/ui-kit";

import { ServiceGroup } from "../types/ServiceGroup";

import { nameRenderer } from "../columns/QuotaOverviewNameColumn";
import { cpuRenderer } from "../columns/QuotaOverviewCPUConsumedColumn";
import { memRenderer } from "../columns/QuotaOverviewMemoryConsumedColumn";
import { diskRenderer } from "../columns/QuotaOverviewDiskConsumedColumn";
import { gpuRenderer } from "../columns/QuotaOverviewGPUConsumedColumn";

export interface ServicesQuotaOverviewTableProps {
  groups: ServiceGroup[];
}

class ServicesQuotaOverviewTable extends React.Component<
  ServicesQuotaOverviewTableProps,
  {}
> {
  render() {
    return (
      <div className="table-wrapper service-table">
        <Table data={this.props.groups}>
          <Column
            header={
              <HeaderCell>
                <Trans>Name</Trans>
              </HeaderCell>
            }
            cellRenderer={nameRenderer}
          />
          <Column
            header={
              <HeaderCell>
                <Trans>CPU Consumed</Trans>
              </HeaderCell>
            }
            cellRenderer={cpuRenderer}
          />
          <Column
            header={
              <HeaderCell>
                <Trans>Memory Consumed</Trans>
              </HeaderCell>
            }
            cellRenderer={memRenderer}
          />
          <Column
            header={
              <HeaderCell>
                <Trans>Disk Consumed</Trans>
              </HeaderCell>
            }
            cellRenderer={diskRenderer}
          />
          <Column
            header={
              <HeaderCell>
                <Trans>GPU Consumed</Trans>
              </HeaderCell>
            }
            cellRenderer={gpuRenderer}
          />
        </Table>
      </div>
    );
  }
}

export default ServicesQuotaOverviewTable;
