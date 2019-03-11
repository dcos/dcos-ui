import { RequestResponse } from "@dcos/http-service";
import { makeExecutableSchema } from "graphql-tools";
import { Observable, timer } from "rxjs";
import { map, share, switchMap } from "rxjs/operators";

import Config from "#SRC/js/config/Config";

import {
  fetchNodesNetwork,
  NodeNetwork,
  NodeNetworkSchema,
  NodesNetwork
} from "#PLUGINS/nodes/src/js/data/NodesNetworkClient";

export interface ResolverArgs {
  fetchNodesNetwork: () => Observable<RequestResponse<NodesNetwork>>;
  pollingInterval: number;
}

export interface GeneralArgs {
  privateIPs?: string[];
}

export const resolvers = ({
  fetchNodesNetwork,
  pollingInterval
}: ResolverArgs) => {
  const pollingInterval$ = timer(0, pollingInterval);
  const nodesNetwork$ = pollingInterval$.pipe(
    switchMap(() => fetchNodesNetwork()),
    share()
  );

  return {
    Query: {
      networks(_parent = {}, args: GeneralArgs) {
        const networks$ = nodesNetwork$.pipe(
          map(
            (reqResp: RequestResponse<NodesNetwork>): NodesNetwork => {
              return [
                ...reqResp.response.map(item => ({
                  ...item,
                  updated: new Date(item.updated)
                }))
              ];
            }
          )
        );

        const { privateIPs = [] } = args;
        if (privateIPs.length === 0) {
          return networks$;
        }

        return networks$.pipe(
          map((networkNodes: NodesNetwork) =>
            networkNodes.filter(({ private_ip }) =>
              privateIPs.includes(private_ip)
            )
          )
        );
      }
    }
  };
};

const baseSchema = `
type Query {
  networks(privateIPs: [String!]): [NodeNetwork!]!
}`;

export const schemas: string[] = [NodeNetworkSchema, baseSchema];

export interface Query {
  networks: NodeNetwork[] | null;
}

export default makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers({
    fetchNodesNetwork,
    pollingInterval: Config.getRefreshRate()
  })
});
