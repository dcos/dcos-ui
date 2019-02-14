import { Observable, merge } from "rxjs";
import { request, RequestResponse } from "@dcos/http-service";
import { partition, tap } from "rxjs/operators";

export interface NodeNetwork {
  updated: string;
  public_ips: string[];
  private_ip: string;
  hostname: string;
}

export type NodesNetwork = NodeNetwork[];

export function fetchNodesNetwork(): Observable<RequestResponse<NodesNetwork>> {
  const [success, error] = partition(
    (response: RequestResponse<NodesNetwork>) => response.code < 300
  )(request("/net/v1/nodes"));

  return merge(
    success,
    error.pipe(
      tap((response: RequestResponse<NodesNetwork>) => {
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
