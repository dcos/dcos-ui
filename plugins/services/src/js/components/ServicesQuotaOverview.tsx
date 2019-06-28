import React from "react";
import { of } from "rxjs";
import { map, startWith, catchError } from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import Loader from "#SRC/js/components/Loader";

import container from "#SRC/js/container";

import ServicesQuotaOverviewTable from "./ServicesQuotaOverviewTable";
import EmptyServicesQuotaOverview from "./EmptyServicesQuotaOverview";

const ServicesQuotaOverview = componentFromStream(() => {
  const dl = container.get<DataLayer>(DataLayerType);

  return dl
    .query(
      gql`
        query {
          groups(filter: $groupsFilter) {
            id
            name
            quota
          }
        }
      `,
      { groupsFilter: JSON.stringify({ quota: { enforced: true } }) }
    )
    .pipe(
      map(response => response.data.groups),
      map(groups => {
        if (groups.length === 0) {
          return <EmptyServicesQuotaOverview />;
        }
        return <ServicesQuotaOverviewTable groups={groups} />;
      }),
      catchError(() => of(<div>Error getting groups with Quota</div>)),
      startWith(<Loader />)
    );
});

export default ServicesQuotaOverview;
