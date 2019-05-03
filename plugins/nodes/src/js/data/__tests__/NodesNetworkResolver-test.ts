const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));
import { NodesNetworkResponse } from "#PLUGINS/nodes/src/js/data/NodesNetworkClient";

import { of } from "rxjs";
import { take } from "rxjs/operators";
import { marbles } from "rxjs-marbles/jest";
import { makeExecutableSchema } from "graphql-tools";
import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";

import {
  schemas,
  resolvers
} from "#PLUGINS/nodes/src/js/data/NodesNetworkResolver";

function makeFakeNodesNetworkResponse(): NodesNetworkResponse {
  return [
    {
      updated: "2019-02-05T13:12:00.979Z",
      public_ips: ["3.2.2.96"],
      private_ip: "13.0.6.125",
      hostname: "ip-13-0-6-125"
    },
    {
      updated: "2019-02-05T13:10:47.965Z",
      public_ips: ["3.2.2.134"],
      private_ip: "13.0.6.96",
      hostname: "ip-13-0-6-96"
    },
    {
      updated: "2019-02-05T13:12:01.553Z",
      public_ips: [],
      private_ip: "13.0.1.42",
      hostname: "ip-13-0-1-42"
    }
  ];
}

function makeResolverConfig(m: any) {
  return {
    fetchNodesNetwork: () =>
      m.cold("(j|)", {
        j: {
          code: 200,
          message: "ok",
          response: makeFakeNodesNetworkResponse()
        }
      }),
    pollingInterval: m.time("--|")
  };
}

describe("Nodes data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("nodes", () => {
    describe("network", () => {
      it(
        "handles a graphql query",
        marbles(m => {
          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers(makeResolverConfig(m))
          });

          const query = gql`
            query {
              networks(privateIPs: $privateIPs) {
                public_ips
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, nodesSchema, {
            privateIPs: ["13.0.6.96", "13.0.6.125"]
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                networks: [
                  {
                    public_ips: ["3.2.2.96"]
                  },
                  {
                    public_ips: ["3.2.2.134"]
                  }
                ]
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "returns all networks",
        marbles(m => {
          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers(makeResolverConfig(m))
          });

          const query = gql`
            query {
              networks {
                public_ips
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, nodesSchema, {});

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                networks: [
                  {
                    public_ips: ["3.2.2.96"]
                  },
                  {
                    public_ips: ["3.2.2.134"]
                  },
                  {
                    public_ips: []
                  }
                ]
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );
      it(
        "returns a full network object",
        marbles(m => {
          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers(makeResolverConfig(m))
          });

          const query = gql`
            query {
              networks(privateIPs: $privateIPs) {
                public_ips
                hostname
                private_ip
                updated
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, nodesSchema, {
            privateIPs: ["13.0.6.96", "13.0.6.125"]
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                networks: [
                  {
                    updated: new Date("2019-02-05T13:12:00.979Z"),
                    public_ips: ["3.2.2.96"],
                    private_ip: "13.0.6.125",
                    hostname: "ip-13-0-6-125"
                  },
                  {
                    updated: new Date("2019-02-05T13:10:47.965Z"),
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                ]
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );
      it(
        "Does not fail if one network is not yet available",
        marbles(m => {
          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers(makeResolverConfig(m))
          });

          const query = gql`
            query {
              networks(privateIPs: $privateIPs) {
                public_ips
                hostname
                private_ip
                updated
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, nodesSchema, {
            privateIPs: ["13.0.6.96", "13.0.6.126"]
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                networks: [
                  {
                    updated: new Date("2019-02-05T13:10:47.965Z"),
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                ]
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "polls the endpoint for 1 item",
        marbles(m => {
          const fetchNodesNetwork = () => {
            return m.cold("j|", {
              j: {
                code: 200,
                message: "ok",
                response: [
                  {
                    updated: "2019-02-05T13:10:47.965Z",
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                ]
              }
            });
          };
          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers({
              fetchNodesNetwork,
              pollingInterval: m.time("--|")
            })
          });

          const query = gql`
            query {
              networks(privateIPs: $privateIPs) {
                public_ips
                hostname
                private_ip
                updated
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, nodesSchema, {
            privateIPs: ["13.0.6.96"]
          });

          const expected$ = m.cold("x-x-(x|)", {
            x: {
              data: {
                networks: [
                  {
                    updated: new Date("2019-02-05T13:10:47.965Z"),
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                ]
              }
            }
          });

          m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
        })
      );

      it(
        "polls the endpoints for 2 item",
        marbles(m => {
          const fetchNodesNetwork = () => {
            return m.cold("j|", {
              j: {
                code: 200,
                message: "ok",
                response: [
                  {
                    updated: "2019-02-05T13:10:47.965Z",
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  },
                  {
                    updated: "2019-02-05T13:12:00.979Z",
                    public_ips: ["3.2.2.96"],
                    private_ip: "13.0.6.125",
                    hostname: "ip-13-0-6-125"
                  }
                ]
              }
            });
          };
          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers({
              fetchNodesNetwork,
              pollingInterval: m.time("----|")
            })
          });

          const query = gql`
            query {
              networks(privateIPs: $privateIPs) {
                public_ips
                hostname
                private_ip
                updated
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, nodesSchema, {
            privateIPs: ["13.0.6.96", "13.0.6.125"]
          });

          const expected$ = m.cold("x---x---(x|)", {
            x: {
              data: {
                networks: [
                  {
                    updated: new Date("2019-02-05T13:10:47.965Z"),
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  },
                  {
                    updated: new Date("2019-02-05T13:12:00.979Z"),
                    public_ips: ["3.2.2.96"],
                    private_ip: "13.0.6.125",
                    hostname: "ip-13-0-6-125"
                  }
                ]
              }
            }
          });

          m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
        })
      );
      it(
        "shares the subscription",
        marbles(async m => {
          const resolverConfig = makeResolverConfig(m);
          resolverConfig.fetchNodesNetwork = jest
            .fn(resolverConfig.fetchNodesNetwork)
            .mockReturnValue(of({ response: makeFakeNodesNetworkResponse() }));

          const nodesSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers(resolverConfig)
          });

          const query = gql`
            query {
              networks(privateIPs: $privateIPs) {
                public_ips
              }
            }
          `;

          const output$ = graphqlObservable(query, nodesSchema, {
            privateIPs: ["13.0.6.125", "13.0.6.96", "13.0.1.42"]
          }).pipe(take(1));

          await output$.toPromise();
          expect(resolverConfig.fetchNodesNetwork).toHaveBeenCalledTimes(1);
        })
      );
    });
  });
});
