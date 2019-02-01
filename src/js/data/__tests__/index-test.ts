import { marbles } from "rxjs-marbles";

const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { makeExecutableSchema } from "graphql-tools";
import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";

import { schemas, resolvers } from "../index";
import { take } from "rxjs/operators";
import { fetchPackageVersions } from "#SRC/js/data/CosmosClient";

function makeResolversConfig(m: any) {
  return {
    fetchPackageVersions,
    pollingInterval: m.time("--|")
  };
}

describe("data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("package", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        const reqResp$ = m.cold("--j|", {
          j: {
            response: { results: { "1.0.0": "1", "1.1.0": "0" } },
            code: 200,
            message: "OK"
          }
        });
        mockRequest.mockReturnValueOnce(reqResp$);

        const dlSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolversConfig(m))
        });

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, dlSchema, {
          packageName: "dcos-ui"
        });
        const result$ = queryResult$.pipe(take(1));

        const expected$ = m.cold("--(j|)", {
          j: {
            data: {
              package: {
                name: "dcos-ui",
                versions: [
                  {
                    version: "1.0.0",
                    revision: "1"
                  },
                  {
                    version: "1.1.0",
                    revision: "0"
                  }
                ]
              }
            }
          }
        });

        m.expect(result$).toBeObservable(expected$);
      })
    );

    it(
      "polls the versions endpoint",
      marbles(m => {
        const reqResp$ = m.cold("--j|", {
          j: {
            response: { results: { "1.0.0": "1", "1.1.0": "0" } },
            code: 200,
            message: "OK"
          }
        });
        mockRequest.mockReturnValue(reqResp$);

        const dlSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolversConfig(m))
        });

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, dlSchema, {
          packageName: "dcos-ui"
        });

        const expected$ = m.cold("--j-j-(j|)", {
          j: {
            data: {
              package: {
                name: "dcos-ui",
                versions: [
                  {
                    version: "1.0.0",
                    revision: "1"
                  },
                  {
                    version: "1.1.0",
                    revision: "0"
                  }
                ]
              }
            }
          }
        });

        m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
      })
    );

    it(
      "filters out non-2XX responses",
      marbles(m => {
        const goodVersionsResult$ = m.cold("(j|)", {
          j: {
            code: 200,
            message: "ok",
            response: { results: { "1.0.0": "0" } }
          }
        });
        const badVersionsResult$ = m.cold("(j|)", {
          j: {
            code: 500,
            message: "ok",
            response: {}
          }
        });

        const results = [badVersionsResult$, goodVersionsResult$];
        mockRequest.mockImplementation(() => results.shift());

        const dlSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolversConfig(m))
        });

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, dlSchema, {
          packageName: "dcos-ui"
        });

        const expected$ = m.cold("--(j|)", {
          j: {
            data: {
              package: {
                name: "dcos-ui",
                versions: [
                  {
                    version: "1.0.0",
                    revision: "0"
                  }
                ]
              }
            }
          }
        });

        m.expect(queryResult$.pipe(take(1))).toBeObservable(expected$);
      })
    );
  });
});
