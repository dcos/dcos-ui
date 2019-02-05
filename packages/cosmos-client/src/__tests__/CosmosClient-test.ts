const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { from } from "rxjs";
import { take } from "rxjs/operators";

import { CosmosClient } from "../CosmosClient";

describe("CosmosClient", () => {
  let client: CosmosClient;
  beforeEach(() => {
    jest.clearAllMocks();

    client = new CosmosClient("/", "package");
  });

  describe("listPackageVersions", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      client.listPackageVersions("dcos-ui");
      expect(mockRequest).toHaveBeenCalled();
    });

    it("makes a request to the expected URL with expected Headers", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      client.listPackageVersions("dcos-ui");
      expect(mockRequest).toHaveBeenCalledWith("/package/list-versions", {
        method: "POST",
        body: {
          includePackageVersions: true,
          packageName: "dcos-ui"
        },
        headers: {
          Accept:
            "application/vnd.dcos.package.list-versions-response+json;charset=utf-8;version=v1",
          "Content-type":
            "application/vnd.dcos.package.list-versions-request+json;charset=utf-8;version=v1"
        }
      });
    });

    it(
      "emits an event when the data is received",
      marbles(m => {
        const expected$ = m.cold("--(j|)", {
          j: {
            response: {
              results: {
                "1.0.0": "0",
                "1.1.0": "1"
              }
            },
            code: 200,
            message: "OK"
          }
        });
        mockRequest.mockReturnValueOnce(expected$);

        const result$ = client.listPackageVersions("dcos-ui").pipe(take(1));
        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
