import Container from "@extension-kid/core/dist/src/Container";

const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import DataLayer, { DataLayerType } from "@extension-kid/data-layer/dataLayer";
import dataLayerContainerModuleFactory from "@extension-kid/data-layer";
import { marbles, observe } from "rxjs-marbles/jest";
import { of } from "rxjs";
import { catchError, take } from "rxjs/operators";
import gql from "graphql-tag";

import extensionFactory from "#SRC/js/data/cosmos";

function createTestContainer() {
  const container = new Container();
  container.load(dataLayerContainerModuleFactory());
  const uiUpdateModule = extensionFactory();
  if (uiUpdateModule) {
    container.load(uiUpdateModule);
  } else {
    throw new Error("Failed to get ui data-layer extension module");
  }
  return container;
}

describe("Cosmos data-layer", () => {
  let container: Container | null = null;
  let dl: DataLayer | null = null;
  beforeEach(() => {
    jest.clearAllMocks();

    container = createTestContainer();
    dl = container.get<DataLayer>(DataLayerType);
  });
  afterEach(() => {
    dl = null;
    container = null;
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
        if (dl === null) {
          throw new Error();
        }

        const queryResult$ = dl.query(query, {
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
        if (dl === null) {
          throw new Error();
        }

        const queryResult$ = dl.query(query, {
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
      observe(() => {
        const badVersionsResult = {
          code: 500,
          message: "Internal Server Error",
          response: {}
        };
        mockRequest.mockImplementation(() => of(badVersionsResult));

        const query = gql`
          query {
            package(name: $packageName) {
              name
              versions
            }
          }
        `;
        if (dl === null) {
          throw new Error();
        }

        return dl
          .query(query, {
            packageName: "dcos-ui"
          })
          .pipe(
            take(1),
            catchError(() => {
              expect(mockRequest.mock.calls.length).toEqual(3);
              return of({});
            })
          );
      })
    );
  });
});
