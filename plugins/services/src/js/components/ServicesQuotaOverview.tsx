import React from "react";
import { of } from "rxjs";
import { map, startWith, catchError } from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import { Trans } from "@lingui/macro";

import Loader from "#SRC/js/components/Loader";
import container from "#SRC/js/container";

import ServicesQuotaOverviewTable from "./ServicesQuotaOverviewTable";
import EmptyServicesQuotaOverview from "./EmptyServicesQuotaOverview";
import { groupHasQuotaLimit } from "../utils/QuotaUtil";

const ServicesQuotaOverview = componentFromStream(() => {
  const dl = container.get<DataLayer>(DataLayerType);

  return dl
    .query(
      gql`
        query {
          groups {
            id
            name
            quota
          }
        }
      `,
      {}
    )
    .pipe(
      map(({ data: { groups } }) => groups.filter(groupHasQuotaLimit)),
      map(groups => {
        return groups.length > 0 ? (
          <ServicesQuotaOverviewTable groups={groups} />
        ) : (
          <EmptyServicesQuotaOverview />
        );
      }),
      catchError(() => of(<Trans>Error getting groups with Quota</Trans>)),
      startWith(<Loader />)
    );
});

export default ServicesQuotaOverview;
