const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { from } from "rxjs";
import { take } from "rxjs/operators";

import { DCOSUIUpdateClient } from "../DCOSUIUpdateClient";

describe("DCOSUIUpdateClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("#fetchVersion", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      DCOSUIUpdateClient.fetchVersion();
      expect(mockRequest).toHaveBeenCalled();
    });

    it("calls correct endpoint", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      DCOSUIUpdateClient.fetchVersion();
      expect(mockRequest).toHaveBeenCalledWith(
        "/dcos-ui-update-service/api/v1/version/"
      );
    });

    it(
      "can handle json response",
      marbles(m => {
        const mockResult$ = m.cold("--(j|)", {
          j: {
            code: 200,
            message: "OK",
            response: {
              default: false,
              packageVersion: "1.2.3",
              buildVersion: "master+v1.2.3+abcdefg"
            }
          }
        });
        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = DCOSUIUpdateClient.fetchVersion().pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: {
              code: 200,
              message: "OK",
              response: {
                default: false,
                packageVersion: "1.2.3",
                buildVersion: "master+v1.2.3+abcdefg"
              }
            }
          })
        );
      })
    );

    it(
      "emits an error for non-2XX responses",
      marbles(m => {
        const mockResult$ = m.cold("--(j|)", {
          j: {
            code: 500,
            message: "Internal Server Error",
            response: "server had an error"
          }
        });
        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = DCOSUIUpdateClient.fetchVersion().pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--#", undefined, {
            message: "server had an error",
            name: "Error"
          })
        );
      })
    );
  });
});
