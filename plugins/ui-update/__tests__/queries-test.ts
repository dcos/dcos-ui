const mockDataLayer = jest.fn();
jest.mock("@dcos/data-service", () => ({
  graphqlObservable: mockDataLayer
}));

import { marbles } from "rxjs-marbles/jest";
import {
  queryCosmosForUIVersions,
  queryUIServiceForMetadata
} from "#PLUGINS/ui-update/queries";
import { take } from "rxjs/operators";
import { of } from "rxjs";
import { DEFAULT_UI_METADATA } from "#SRC/js/data/ui-update/UIMetadata";

describe("queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("#queryCosmosForUIVersions", () => {
    it(
      "returns package result from query",
      marbles(m => {
        const queryResp$ = m.cold("--j|", {
          j: {
            data: {
              package: {
                name: "dcos-ui",
                versions: [
                  {
                    version: "2.0.0",
                    revision: "1"
                  }
                ]
              }
            }
          }
        });
        mockDataLayer.mockReturnValueOnce(queryResp$);

        const query$ = queryCosmosForUIVersions();
        const result$ = query$.pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: {
              name: "dcos-ui",
              versions: [
                {
                  version: "2.0.0",
                  revision: "1"
                }
              ]
            }
          })
        );
      })
    );

    it("makes a single query to data-layer", () => {
      mockDataLayer.mockReturnValueOnce(of({}));

      queryCosmosForUIVersions();
      expect(mockDataLayer).toHaveBeenCalledTimes(1);
    });
  });
  describe("#queryUIServiceForMetadata", () => {
    it(
      "returns result from ui-update-service",
      marbles(m => {
        const queryResp$ = m.cold("--j|", {
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
        mockDataLayer.mockReturnValueOnce(queryResp$);

        const query$ = queryUIServiceForMetadata();
        const result$ = query$.pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: {
              clientBuild: "unit_test+v2.50.1",
              packageVersion: "2.50.1",
              packageVersionIsDefault: false,
              serverBuild: "master+v2.50.1+hfges"
            }
          })
        );
      })
    );

    it(
      "makes a single query to data-layer",
      marbles(m => {
        const queryResp$ = m.cold("--j|", {
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
        mockDataLayer.mockReturnValueOnce(queryResp$);

        queryUIServiceForMetadata();
        expect(mockDataLayer).toHaveBeenCalledTimes(1);
      })
    );

    it(
      "returns default ui metadata if query errors",
      marbles(m => {
        const queryResp$ = m.cold("--#", undefined, {
          message: "Query Failed",
          name: "Error"
        });
        mockDataLayer.mockReturnValueOnce(queryResp$);

        const query$ = queryUIServiceForMetadata();
        const result$ = query$.pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: DEFAULT_UI_METADATA
          })
        );
      })
    );
  });
});
