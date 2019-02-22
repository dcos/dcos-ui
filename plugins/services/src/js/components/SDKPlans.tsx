import * as React from "react";

import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import {
  Observable,
  throwError,
  of,
  combineLatest,
  BehaviorSubject
} from "rxjs";
import {
  map,
  distinctUntilChanged,
  retryWhen,
  delay,
  take,
  catchError,
  startWith,
  concat,
  switchMap
} from "rxjs/operators";
import gql from "graphql-tag";
import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
// @ts-ignore
import MesosStateStore from "#SRC/js/stores/MesosStateStore";

import {
  Service,
  compare as ServiceCompare
} from "#PLUGINS/services/src/js/types/Service";
import { default as schema } from "#PLUGINS/services/src/js/data";
import SDKPlansTab from "#PLUGINS/services/src/js/components/SDKPlansTab";

const getGraphQL = (
  serviceId: string
): Observable<{ data: { service: Service } }> => {
  return graphqlObservable(
    gql`
      query {
        service(id: $serviceId) {
          id
          plans {
            name
            errors
            phases
            status
            strategy
          }
        }
      }
    `,
    schema,
    { serviceId }
  );
};

const ErrorScreen = () => {
  return <RequestErrorMsg />;
};

const LoadingScreen = () => {
  return <Loader />;
};

const selectedPlan$ = new BehaviorSubject<string>("");
const handleSelectPlan = (name: string) => {
  selectedPlan$.next(name);
};

const SDKPlans = componentFromStream(props$ => {
  const serviceId$ = (props$ as Observable<{
    service: { getId: () => string };
  }>).pipe(
    map((props: { service: { getId: () => string } }) => props.service.getId()),
    distinctUntilChanged()
  );

  const plans$ = serviceId$.pipe(
    switchMap((serviceId: string) =>
      getGraphQL(serviceId).pipe(
        map((response: { data: { service: Service } }) => response.data.service)
      )
    ),
    distinctUntilChanged(ServiceCompare)
  );

  const schedulerTaskId$ = (props$ as Observable<{
    service: { getName: () => string };
  }>).pipe(
    map((props: { service: { getName: () => string } }) => {
      const tasks = MesosStateStore.getTasksByService(props.service);
      const serviceName = props.service.getName();
      const schedulerTask = tasks.find(
        (task: { name: string }) => task.name === serviceName
      );
      if (schedulerTask) {
        return schedulerTask.id;
      }
      return undefined;
    }),
    distinctUntilChanged()
  );

  return combineLatest([plans$, selectedPlan$, schedulerTaskId$]).pipe(
    map(([service, selectedPlan, schedulerTaskId], index: number) => {
      return (
        <SDKPlansTab
          key={index}
          service={service}
          plan={selectedPlan}
          handleSelectPlan={handleSelectPlan}
          schedulerTaskId={schedulerTaskId}
        />
      );
    }),
    retryWhen(errors =>
      errors.pipe(
        delay(1000),
        take(10),
        concat(throwError(errors))
      )
    ),
    catchError(() => of(<ErrorScreen />)),
    startWith(<LoadingScreen />)
  );
});

export default SDKPlans;
