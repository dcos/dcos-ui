import React from "react";
import { of, Observable, combineLatest } from "rxjs";
import {
  map,
  startWith,
  catchError,
  distinctUntilChanged
} from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import Loader from "#SRC/js/components/Loader";

import container from "#SRC/js/container";

import ServicesQuotaOverviewTable from "./ServicesQuotaOverviewTable";
import ServicesQuotaOverviewDetail from "./ServicesQuotaOverviewDetail";
import EmptyServicesQuotaOverview from "./EmptyServicesQuotaOverview";

const EMPTY_ID = "/";

export interface ServicesQuotaOverviewProps {
  id: string;
}

const ServicesQuotaOverview = componentFromStream(props$ => {
  const dl = container.get<DataLayer>(DataLayerType);
  const id$ = (props$ as Observable<ServicesQuotaOverviewProps>).pipe(
    map(props => props.id),
    distinctUntilChanged()
  );

  const groups$ = dl
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
    .pipe(map(response => response.data.groups));

  return combineLatest([id$, groups$]).pipe(
    map(([id, groups]) => {
      if (groups.length === 0) {
        return <EmptyServicesQuotaOverview />;
      }

      if (id !== EMPTY_ID) {
        const group = groups.filter(
          (group: { id: string }) => group.id === id
        )[0];
        return <ServicesQuotaOverviewDetail group={group} />;
      }

      return <ServicesQuotaOverviewTable groups={groups} />;
    }),
    catchError(() => of(<div>Error getting groups with Quota</div>)),
    startWith(<Loader />)
  );
});

export default ServicesQuotaOverview;
