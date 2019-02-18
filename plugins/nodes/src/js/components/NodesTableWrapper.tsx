import * as React from "react";
import gql from "graphql-tag";
import { Observable, combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { graphqlObservable, componentFromStream } from "@dcos/data-service";
import { TableProps } from "@dcos/ui-kit/dist/packages/table/components/Table";

import { NodeNetwork } from "../data/NodesNetworkClient";
import { default as schema } from "../data/NodesResolver";
import Node from "#SRC/js/structs/Node";

interface TableWrapperProps {
  data: any[];
  children: React.ReactElement<TableProps>;
}

const getGraphQl = (privateIP: string) => {
  return graphqlObservable<{ node: { network: NodeNetwork } }>(
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
};
// Put in the same props as you would in the NodesTable
const NodesTableWrapper = componentFromStream<TableWrapperProps>(props$ => {
  const data$ = (props$ as Observable<TableWrapperProps>).pipe(
    map((props: TableWrapperProps) => props.data)
  );
  const dataWithPublicIp$ = data$.pipe(
    switchMap(data => {
      const streamArray = data.map(item => {
        return getGraphQl(item.hostname).pipe(
          map(
            publicIp =>
              new Node({
                ...item.toJSON(),
                network: publicIp.node.network
              })
          )
        );
      });

      return combineLatest(...streamArray).pipe(
        map(items => {
          return items;
        })
      );
    })
  );

  return combineLatest(
    props$ as Observable<TableWrapperProps>,
    dataWithPublicIp$
  ).pipe(
    map(([props, data]) => {
      const { children, ...rest } = props;
      return React.Children.map(children, child => {
        return React.cloneElement(child as React.ReactElement<any>, {
          ...rest,
          data
        });
      });
    })
  );
});

export default NodesTableWrapper;
