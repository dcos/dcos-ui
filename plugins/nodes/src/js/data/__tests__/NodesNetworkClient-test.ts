const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { from } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { take } from "rxjs/operators";

import * as NodesNetworkClient from "../NodesNetworkClient";

describe("Network Nodes Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("makes a request", () => {
    mockRequest.mockReturnValueOnce(from([{}]));
    NodesNetworkClient.fetchNodesNetwork();
    expect(mockRequest).toHaveBeenCalled();
  });

  it(
    "emits an event when the data is received",
    marbles(m => {
      const expectedResult = [
        {
          updated: "2019-02-04T14:17:12.697Z",
          public_ips: ["18.185.33.115"],
          private_ip: "10.0.6.192",
          hostname: "ip-10-0-6-192"
        }
      ];
      const expected$ = m.cold("--(j|)", {
        j: {
          response: expectedResult,
          code: 200,
          message: "OK"
        }
      });

      mockRequest.mockReturnValueOnce(expected$);

      const result$ = NodesNetworkClient.fetchNodesNetwork().pipe(take(1));
      m.expect(result$).toBeObservable(expected$);
    })
  );

  it(
    "emits an error if non-2XX API response",
    marbles(m => {
      const mockResult$ = m.cold("--j", {
        j: {
          code: 500,
          message: "Internal Server Error",
          response: ["Backend Error :-("]
        }
      });

      mockRequest.mockReturnValueOnce(mockResult$);

      const result$ = NodesNetworkClient.fetchNodesNetwork();

      const expected$ = m.cold("--#", undefined, {
        message:
          'Network Nodes API request failed: 500 Internal Server Error:["Backend Error :-("]',
        name: "Error"
      });

      m.expect(result$).toBeObservable(expected$);
    })
  );
});
