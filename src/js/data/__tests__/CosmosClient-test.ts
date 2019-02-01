const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { from } from "rxjs";
import { take } from "rxjs/operators";

import * as CosmosClient from "../CosmosClient";

const listVersionsResponse: CosmosClient.PackageVersionsResponse = {
  results: {
    "1.0.0": "0",
    "1.1.0": "1"
  }
};

describe("CosmosClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("#fetchPackageDetails", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      CosmosClient.fetchPackageVersions("dcos-ui");
      expect(mockRequest).toHaveBeenCalled();
    });

    it("makes a request to the correct URL", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      CosmosClient.fetchPackageVersions("dcos-ui");
      expect(mockRequest).toHaveBeenCalledWith("/package/list-versions", {
        method: "POST",
        body: {
          includePackageVersions: true,
          packageName: "dcos-ui"
        },
        headers: {
          accept:
            "application/vnd.dcos.package.list-versions-response+json;charset=utf-8;version=v1",
          "content-type":
            "application/vnd.dcos.package.list-versions-request+json;charset=utf-8;version=v1"
        }
      });
    });

    it(
      "emits an event when the data is received",
      marbles(m => {
        const expected$ = m.cold("--(j|)", {
          j: {
            response: listVersionsResponse,
            code: 200,
            message: "OK"
          }
        });
        mockRequest.mockReturnValueOnce(expected$);

        const result$ = CosmosClient.fetchPackageVersions("dcos-ui").pipe(
          take(1)
        );
        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
