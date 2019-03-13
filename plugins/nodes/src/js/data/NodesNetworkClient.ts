import { request, RequestResponse } from "@dcos/http-service";
import { merge, Observable } from "rxjs";
import { partition, tap, share } from "rxjs/operators";

export interface NodeNetwork {
  updated: string | Date;
  public_ips: string[];
  private_ip: string;
  hostname: string;
}

export interface NodeNetworkResponse extends NodeNetwork {
  updated: string;
}

export type NodesNetwork = NodeNetwork[];
export type NodesNetworkResponse = NodeNetworkResponse[];

export const NodeNetworkSchema = `
scalar Date

type NodeNetwork {
  updated: Date
  public_ips: [String]
  private_ip: String
  hostname: String
}
`;

export function fetchNodesNetwork(): Observable<
  RequestResponse<NodesNetworkResponse>
> {
  const [success, error] = partition(
    (response: RequestResponse<NodesNetworkResponse>) => response.code < 300
  )(request<NodeNetworkResponse[]>("/net/v1/nodes").pipe(share()));

  return merge(
    success,
    error.pipe(
      tap((response: RequestResponse<NodesNetworkResponse>) => {
        const responseMessage =
          response.response && typeof response.response === "object"
            ? JSON.stringify(response.response)
            : response.response;
        throw new Error(
          `Network Nodes API request failed: ${response.code} ${
            response.message
          }:${responseMessage}`
        );
      })
    )
  );
}
