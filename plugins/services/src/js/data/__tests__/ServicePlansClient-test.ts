const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { from, of } from "rxjs";
import { take } from "rxjs/operators";

import * as ServicePlansClient from "../ServicePlansClient";

const planDetailData: ServicePlansClient.ServicePlanResponse = require("./_fixtures/service-plan-in-progress");

describe("ServicePlansClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("#fetchPlans", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      ServicePlansClient.fetchPlans("fakeService");
      expect(mockRequest).toHaveBeenCalled();
    });

    it("makes a request to the correct URL", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      ServicePlansClient.fetchPlans("fakeService");
      expect(mockRequest).toHaveBeenCalledWith("/service/fakeService/v1/plans");
    });

    it(
      "emits an event when the data is received",
      marbles(m => {
        const expectedResult = ["plan01", "plan02", "plan03"];
        const expected$ = m.cold("--(j|)", {
          j: {
            response: expectedResult,
            code: 200,
            message: "OK"
          }
        });

        mockRequest.mockReturnValueOnce(expected$);

        const result$ = ServicePlansClient.fetchPlans("test").pipe(take(1));
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
            response: []
          }
        });

        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = ServicePlansClient.fetchPlans("fakeService");

        const expected$ = m.cold("--#", undefined, {
          message:
            "Service Plans API request failed: 500 Internal Server Error:[]",
          name: "Error"
        });

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#fetchPlanDetail", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      ServicePlansClient.fetchPlanDetails("fakeService", "test-plan");
      expect(mockRequest).toHaveBeenCalled();
    });

    it("makes a request to the correct URL", () => {
      mockRequest.mockReturnValueOnce(of([{}]));
      ServicePlansClient.fetchPlanDetails("fakeService", "test-plan01");
      expect(mockRequest).toHaveBeenCalledWith(
        "/service/fakeService/v1/plans/test-plan01"
      );
    });

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--(j|)", {
          j: {
            response: planDetailData,
            code: 200,
            message: "OK"
          }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = ServicePlansClient.fetchPlanDetails(
          "fakeService",
          "test-plan03"
        );

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
            response: {}
          }
        });

        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = ServicePlansClient.fetchPlanDetails(
          "fakeService",
          "test-plan03"
        );

        const expected$ = m.cold("--#", undefined, {
          message:
            "Service Plan Detail API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
