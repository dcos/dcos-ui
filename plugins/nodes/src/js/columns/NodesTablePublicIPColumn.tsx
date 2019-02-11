import * as React from "react";
import { TextCell } from "@dcos/ui-kit";

import { default as schema } from "../data/NodesResolver";
import { NodeNetwork } from "../data/NodesNetworkClient";
import graphqlObservable from "reactive-graphql";
import gql from "graphql-tag";
import { map, switchMap, startWith } from "rxjs/operators";
import { componentFromStream } from "@dcos/data-service";
import { Observable } from "rxjs";
import { Trans } from "@lingui/react";

const getGraphQl = (privateIP: string) =>
  graphqlObservable<{ node: { network: NodeNetwork } }>(
    gql`
      query {
        node(privateIP: $privateIP) {
          network {
            public_ips
          }
        }
      }
    `,
    schema,
    { privateIP }
  ).pipe(map(response => response.data));

const Column = componentFromStream<{ privateIP: string }>(
  (props$): Observable<React.ReactNode> => {
    return (props$ as Observable<{ privateIP: string }>).pipe(
      switchMap(({ privateIP }) => getGraphQl(privateIP)),
      map(({ node }: { node: { network: { public_ips: string[] } } }) => {
        if (
          node.network == null ||
          node.network.public_ips == null ||
          node.network.public_ips.length === 0
        ) {
          return (
            <TextCell>
              <Trans>N/A</Trans>
            </TextCell>
          );
        }
        return <TextCell>{node.network.public_ips.join(", ")}</TextCell>;
      }),
      startWith(
        <TextCell>
          <Trans>Loading</Trans>
        </TextCell>
      )
    );
  }
);

export function publicIPCellWidth(): number {
  return 125;
}

export default function({ hostname }: { hostname: string }) {
  return <Column privateIP={hostname} />;
}
