const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles, observe } from "rxjs-marbles/jest";
import { of } from "rxjs";
import { catchError, take, tap } from "rxjs/operators";
import gql from "graphql-tag";
import { graphqlObservable } from "@dcos/data-service";

import { default as schema, makeSchema } from "#SRC/js/data/ui-update";

describe("UI-Update Service data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query", () => {
    describe("ui", () => {
      it(
        "handles a graphql query",
        marbles(m => {
          const reqResp$ = m.cold("--j|", {
            j: {
              response: {
                default: false,
                packageVersion: "2.50.1",
                buildVersion: "master+v2.50.1+hfges"
              },
              code: 200,
              message: "OK"
            }
          });
          mockRequest.mockReturnValue(reqResp$);
          // @ts-ignore
          window.DCOS_UI_VERSION = "unit_test+v2.50.1";

          const query = gql`
            query {
              ui {
                clientBuild
                packageVersion
                packageVersionIsDefault
                serverBuild
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, schema, {}).pipe(
            take(1)
          );

          const expected$ = m.cold("--(j|)", {
            j: {
              data: {
                ui: {
                  clientBuild: "unit_test+v2.50.1",
                  packageVersion: "2.50.1",
                  packageVersionIsDefault: false,
                  serverBuild: "master+v2.50.1+hfges"
                }
              }
            }
          });

          m.expect(queryResult$).toBeObservable(expected$);
        })
      );

      it(
        "doesn't call api just for clientBuild",
        observe(() => {
          const reqResp = {
            response: {
              default: false,
              packageVersion: "2.50.1",
              buildVersion: "master+v2.50.1+hfges"
            },
            code: 200,
            message: "OK"
          };
          mockRequest.mockReturnValue(of(reqResp));

          // @ts-ignore
          window.DCOS_UI_VERSION = "unit_test+v1.0.0";

          const query = gql`
            query {
              ui {
                clientBuild
              }
            }
          `;

          return graphqlObservable(query, makeSchema(), {}).pipe(
            take(1),
            tap(value => {
              expect(mockRequest.mock.calls.length).toEqual(0);
              expect(value).toEqual({
                data: {
                  ui: {
                    clientBuild: "unit_test+v1.0.0"
                  }
                }
              });
            })
          );
        })
      );

      it(
        "makes a single version request",
        observe(() => {
          const reqResp = {
            response: {
              default: false,
              packageVersion: "2.50.1",
              buildVersion: "master+v2.50.1+hfges"
            },
            code: 200,
            message: "OK"
          };
          mockRequest.mockReturnValue(of(reqResp));

          const query = gql`
            query {
              ui {
                packageVersion
                packageVersionIsDefault
              }
            }
          `;

          return graphqlObservable(query, makeSchema(), {}).pipe(
            take(1),
            tap(() => {
              expect(mockRequest.mock.calls.length).toEqual(1);
            })
          );
        })
      );

      it(
        "emits an error for non-2XX responses",
        marbles(m => {
          const reqResp$ = m.cold("j|", {
            j: {
              response: "There is a problem",
              code: 500,
              message: "Internal Server Error"
            }
          });
          mockRequest.mockReturnValue(reqResp$);

          const query = gql`
            query {
              ui {
                packageVersion
                packageVersionIsDefault
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, makeSchema(), {}).pipe(
            take(1)
          );
          m.expect(queryResult$).toBeObservable(
            m.cold("#", undefined, {
              message: "There is a problem",
              name: "Error"
            })
          );
        })
      );

      it(
        "tries 3 requests before failing",
        observe(() => {
          mockRequest.mockImplementation(() =>
            of({
              response: "There is a problem",
              code: 500,
              message: "Internal Server Error"
            })
          );

          const query = gql`
            query {
              ui {
                packageVersion
              }
            }
          `;

          return graphqlObservable(query, makeSchema(), {}).pipe(
            take(1),
            catchError(() => {
              expect(mockRequest.mock.calls.length).toEqual(3);
              return of({});
            })
          );
        })
      );

      it(
        "can handle up to two errors",
        marbles(m => {
          const responses = [
            {
              response: "There is a problem",
              code: 500,
              message: "Internal Server Error"
            },
            {
              response: "There is a problem",
              code: 500,
              message: "Internal Server Error"
            },
            {
              response: {
                default: false,
                packageVersion: "2.50.1",
                buildVersion: "master+v2.50.1+hfges"
              },
              code: 200,
              message: "OK"
            }
          ];
          mockRequest.mockImplementation(() =>
            m.cold("--j|", {
              j: responses.shift()
            })
          );

          const query = gql`
            query {
              ui {
                packageVersion
                packageVersionIsDefault
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, schema, {}).pipe(
            take(1)
          );

          const expected$ = m.cold("------(j|)", {
            j: {
              data: {
                ui: {
                  packageVersion: "2.50.1",
                  packageVersionIsDefault: false
                }
              }
            }
          });

          m.expect(queryResult$).toBeObservable(expected$);
        })
      );
    });
  });

  describe("Mutations", () => {
    describe("#updateDCOSUI", () => {
      it(
        "handles executing a mutation",
        marbles(m => {
          const reqResp$ = m.cold("--j|", {
            j: {
              code: 200,
              message: "OK",
              response: "Update to 1.1.0 completed"
            }
          });
          mockRequest.mockReturnValueOnce(reqResp$);

          const updateMutation = gql`
            mutation {
              updateDCOSUI(newVersion: $version)
            }
          `;

          const mutationResult$ = graphqlObservable(updateMutation, schema, {
            version: "1.1.0"
          }).pipe(take(1));

          m.expect(mutationResult$).toBeObservable(
            m.cold("--(j|)", {
              j: {
                data: {
                  updateDCOSUI: "Complete: Update to 1.1.0 completed"
                }
              }
            })
          );
        })
      );

      it(
        "emits an error if request fails",
        marbles(m => {
          const reqResp$ = m.cold("--j|", {
            j: {
              code: 500,
              message: "Internal Server Error",
              response: "Failed"
            }
          });
          mockRequest.mockReturnValueOnce(reqResp$);

          const updateMutation = gql`
            mutation {
              updateDCOSUI(newVersion: $version)
            }
          `;

          const mutationResult$ = graphqlObservable(updateMutation, schema, {
            version: "1.1.0"
          }).pipe(take(1));

          m.expect(mutationResult$).toBeObservable(
            m.cold("--#", undefined, {
              message: "Failed",
              name: "Error"
            })
          );
        })
      );
    });

    describe("#resetDCOSUI", () => {
      it(
        "handles executing a mutation",
        marbles(m => {
          const reqResp$ = m.cold("--j|", {
            j: {
              code: 200,
              message: "OK",
              response: "OK"
            }
          });
          mockRequest.mockReturnValueOnce(reqResp$);

          const resetMutation = gql`
            mutation {
              resetDCOSUI
            }
          `;

          const mutationResult$ = graphqlObservable(
            resetMutation,
            schema,
            {}
          ).pipe(take(1));

          m.expect(mutationResult$).toBeObservable(
            m.cold("--(j|)", {
              j: {
                data: {
                  resetDCOSUI: "Complete: OK"
                }
              }
            })
          );
        })
      );

      it(
        "emits an error if request fails",
        marbles(m => {
          const reqResp$ = m.cold("--j|", {
            j: {
              code: 500,
              message: "Internal Server Error",
              response: "Failed"
            }
          });
          mockRequest.mockReturnValueOnce(reqResp$);

          const resetMutation = gql`
            mutation {
              resetDCOSUI
            }
          `;

          const mutationResult$ = graphqlObservable(
            resetMutation,
            schema,
            {}
          ).pipe(take(1));

          m.expect(mutationResult$).toBeObservable(
            m.cold("--#", undefined, {
              message: "Failed",
              name: "Error"
            })
          );
        })
      );
    });
  });
});
