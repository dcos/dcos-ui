import * as React from "react";
import { of } from "rxjs";
import { map, startWith, catchError } from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import { Trans } from "@lingui/macro";

import Loader from "#SRC/js/components/Loader";
import container from "#SRC/js/container";

import GroupsQuotaOverviewTable from "./GroupsQuotaOverviewTable";
import EmptyServicesQuotaOverview from "./EmptyServicesQuotaOverview";
import { groupHasQuotaLimit } from "../utils/QuotaUtil";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import { MESOS_STATE_CHANGE } from "#SRC/js/constants/EventTypes";

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
      { mesosStateStore: MesosStateStore }
    )
    .pipe(
      map(({ data: { groups } }) => groups.filter(groupHasQuotaLimit)),
      map(groups => {
        return groups.length > 0 ? (
          <GroupsQuotaOverviewTable groups={groups} />
        ) : (
          <EmptyServicesQuotaOverview />
        );
      }),
      catchError(() => of(<Trans>Error getting groups with Quota</Trans>)),
      startWith(<Loader />)
    );
});

export default class ServicesQuotaOverviewWithMesosState extends React.Component<
  {},
  { mesosStateLoaded: boolean }
> {
  constructor(props: {}) {
    super(props);
    this.onMesosStateChange = this.onMesosStateChange.bind(this);

    this.state = {
      mesosStateLoaded: false
    };
  }

  public componentDidMount() {
    MesosStateStore.addChangeListener(
      MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
    this.onMesosStateChange();
  }

  public componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
  }

  public onMesosStateChange() {
    this.setState({ mesosStateLoaded: true });
  }

  public render() {
    if (this.state.mesosStateLoaded) {
      return <ServicesQuotaOverview />;
    }
    return <Loader />;
  }
}
