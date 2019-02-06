const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { take } from "rxjs/operators";
import gql from "graphql-tag";
import { graphqlObservable } from "@dcos/data-service";

import { default as schema } from "#SRC/js/data/cosmos";

describe("Cosmos data-layer", () => {
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

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, schema, {
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
      "throw an error for non-2XX responses",
      marbles(m => {
        const badVersionsResult$ = m.cold("--j|", {
          j: {
            code: 500,
            message: "Internal Server Error",
            response: {}
          }
        });

        mockRequest.mockImplementation(() => badVersionsResult$);

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, schema, {
          packageName: "dcos-ui"
        });

        const result$ = queryResult$.pipe(take(1));
        const expected$ = m.cold("------#", undefined, {
          message: "Internal Server Error",
          name: "Error"
        });

        m.expect(result$).toBeObservable(expected$);
      })
    );

    it(
      "retries twice on errors",
      marbles(m => {
        const badVersionsResult$ = m.cold("--j|", {
          j: {
            code: 500,
            message: "Internal Server Error",
            response: {}
          }
        });
        mockRequest.mockImplementation(() => badVersionsResult$);

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, schema, {
          packageName: "dcos-ui"
        });

        queryResult$.pipe(take(1)).subscribe(jest.fn(), jest.fn(), () => {
          expect(mockRequest).toHaveBeenCalledTimes(3);
        });
      })
    );
  });
});
