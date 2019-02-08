import { RequestResponse } from "@dcos/http-service";
import { makeExecutableSchema } from "graphql-tools";
import { Observable, of, throwError, timer } from "rxjs";
import { map, share, switchMap } from "rxjs/operators";

import Config from "#SRC/js/config/Config";

import {
  fetchNodesNetwork,
  NodeNetwork,
  NodeNetworkSchema,
  NodesNetwork
} from "./NodesNetworkClient";

export interface ResolverArgs {
  fetchNodesNetwork: () => Observable<RequestResponse<NodesNetwork>>;
  pollingInterval: number;
}

export interface GeneralArgs {
  privateIP?: string;
  privateIPs?: string[];
}

export interface NodeQueryArgs {
  privateIP: string;
}

export interface NodesQueryArgs {
  privateIPs: string[];
}

function isNodeQueryArgs(args: GeneralArgs): args is NodeQueryArgs {
  return typeof (args as NodeQueryArgs).privateIP === "string";
}

function isNodesQueryArgs(args: GeneralArgs): args is NodesQueryArgs {
  return Array.isArray((args as NodesQueryArgs).privateIPs);
}

export const resolvers = ({
  fetchNodesNetwork,
  pollingInterval
}: ResolverArgs) => {
  const pollingInterval$ = timer(0, pollingInterval);
  const nodes$ = pollingInterval$.pipe(
    switchMap(() => fetchNodesNetwork()),
    share()
  );

  return {
    Node: {
      network(parent: { privateIP: string }) {
        return nodes$.pipe(
          map(
            (reqResp: RequestResponse<NodesNetwork>): NodesNetwork => {
              return [
                ...reqResp.response.map(item => ({
                  ...item,
                  updated: new Date(item.updated)
                }))
              ];
            }
          ),
          map(
            (networkNodes: NodesNetwork) =>
              networkNodes.find(
                ({ private_ip }) => private_ip === parent.privateIP
              ) || {}
          )
        );
      }
    },
    Query: {
      node(_parent = {}, args: GeneralArgs) {
        if (!isNodeQueryArgs(args)) {
          return throwError(
            "Nodes resolver arguments aren't valid for type nodesQueryArgs"
          );
        }
        return of({ hostname: args.privateIP, privateIP: args.privateIP });
      },
      nodes(_parent = {}, args: GeneralArgs) {
        if (!isNodesQueryArgs(args)) {
          return throwError(
            "Nodes resolver arguments aren't valid for type nodesQueryArgs"
          );
        }

        return of(
          args.privateIPs.map((privateIP: string) => ({
            hostname: privateIP,
            privateIP
          }))
        );
      }
    }
  };
};

const baseSchema = `
type Node {
  hostname: String
  network: NodeNetwork
}

type Query {
  nodes(privateIPs: [String!]!): [Node]
  node(privateIP: String!): Node
}`;

export const schemas: string[] = [NodeNetworkSchema, baseSchema];

export interface Query {
  network: NodeNetwork | null;
}

export default makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers({
    fetchNodesNetwork,
    pollingInterval: Config.getRefreshRate()
  })
});
