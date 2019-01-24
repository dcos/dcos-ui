import React from "react";

import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import { Observable } from "rxjs";
import gql from "graphql-tag";
import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import { Service } from "../types/Service";
import { default as schema } from "../data";

const getGraphQL = (
  serviceName: string
): Observable<{ data: { service: Service } }> => {
  return graphqlObservable(
    gql`
      query {
        service(name: $serviceName) {
          name
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
    { serviceName }
  );
};

const LoadingScreen = () => {
  return <Loader />;
};

const ErrorScreen = () => {
  return <RequestErrorMsg />;
};

const SDKPlans = componentFromStream(props$ => {
  const name$ = (props$ as Observable<{ service: { getId: () => string } }>)
    .map((props: { service: { getId: () => string } }) => props.service.getId())
    .distinctUntilChanged();

  const plans$ = name$.concatMap((serviceName: string) =>
    getGraphQL(serviceName).map(
      (response: { data: { service: Service } }) => response.data.service
    )
  );

  return plans$
    .map((service: Service, index: number) => {
      return <pre key={index}>{JSON.stringify(service.plans, null, 2)}</pre>;
    })
    .retryWhen(errors =>
      errors
        .delay(1000)
        .take(10)
        .concat(Observable.throw(errors))
    )
    .catch(() => Observable.of(<ErrorScreen />))
    .startWith(<LoadingScreen />);
});

export default SDKPlans;
