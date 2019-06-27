import React from "react";
import { Trans } from "@lingui/macro";
import { Column, Table, HeaderCell } from "@dcos/ui-kit";

import { ServiceGroup } from "../types/ServiceGroup";

import { nameRenderer } from "../columns/QuotaOverviewNameColumn";

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
        </Table>
      </div>
    );
  }
}

export default ServicesQuotaOverviewTable;
