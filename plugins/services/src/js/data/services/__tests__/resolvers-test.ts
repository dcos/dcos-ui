const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import Container from "@extension-kid/core/dist/src/Container";
import DataLayer, { DataLayerType } from "@extension-kid/data-layer/dataLayer";
import { fakeSchedulers, marbles } from "rxjs-marbles/jest";
import gql from "graphql-tag";
import { take } from "rxjs/operators";

import { createTestContainer } from "../../__tests__/extension-test";
import TestModule from "../../__tests__/test-module";
import {
  fetchPlanDetails,
  fetchPlans,
  ServicePlanResponse
} from "#PLUGINS/services/src/js/data/ServicePlansClient";
import { ResolverArgs } from "#PLUGINS/services/src/js/data";
import { of } from "rxjs";

function makeFakePlanResponse(): ServicePlanResponse {
  return {
    strategy: "serial",
    status: "IN_PROGRESS",
    errors: [],
    phases: [
      {
        id: "0001",
        name: "phase-0",
        strategy: "serial",
        status: "IN_PROGRESS",
        steps: [
          {
            id: "000A",
            name: "step-0",
            status: "IN_PROGRESS",
            message: "this is a test"
          }
        ]
      }
    ]
  };
}

describe("Service Data Layer - Services", () => {
  let container: Container | null = null;
  let dl: DataLayer | null = null;
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    dl = null;
    container = null;
  });
  function setupDL(args: ResolverArgs | null = null): DataLayer {
    container = createTestContainer(TestModule(args));
    dl = container.get<DataLayer>(DataLayerType);
    return dl;
  }

  describe("Query - service.plans", () => {
    it(
      "handles query for services",
      marbles(m => {
        dl = setupDL({
          fetchServicePlans: (_serviceId: string) =>
            m.cold("(j|)", {
              j: {
                code: 200,
                message: "ok",
                response: ["plan-01", "plan-02", "plan-03"]
              }
            }),
          fetchServicePlanDetail: (_serviceId: string, _planName: string) =>
            m.cold("(j|)", {
              j: {
                code: 200,
                message: "ok",
                response: makeFakePlanResponse()
              }
            }),
          pollingInterval: m.time("--|")
        });
        const result$ = dl
          .query(
            gql`
              query {
                service(id: $serviceId) {
                  id
                  plans {
                    name
                    status
                    strategy
                  }
                }
              }
            `,
            { serviceId: "test" }
          )
          .pipe(take(1));
        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              service: {
                id: "test",
                plans: [
                  {
                    name: "plan-01",
                    status: "IN_PROGRESS",
                    strategy: "serial"
                  },
                  {
                    name: "plan-02",
                    status: "IN_PROGRESS",
                    strategy: "serial"
                  },
                  {
                    name: "plan-03",
                    status: "IN_PROGRESS",
                    strategy: "serial"
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
      "polls the endpoints",
      marbles(m => {
        dl = setupDL({
          fetchServicePlans: (_service: string) =>
            m.cold("j|", {
              j: {
                code: 200,
                message: "ok",
                response: ["plan-01"]
              }
            }),
          fetchServicePlanDetail: (_service: string, _planName: string) =>
            m.cold("--j|", {
              j: {
                code: 200,
                message: "ok",
                response: makeFakePlanResponse()
              }
            }),
          pollingInterval: m.time("--|")
        });

        const result$ = dl
          .query(
            gql`
              query {
                service(id: $serviceId) {
                  id
                  plans {
                    name
                  }
                }
              }
            `,
            { serviceId: "test" }
          )
          .pipe(take(3));
        const expected$ = m.cold("--x-x-(x|)", {
          x: {
            data: {
              service: {
                id: "test",
                plans: [
                  {
                    name: "plan-01"
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
      "throws an error if plan detail API returns non-2XX",
      marbles(m => {
        const plansResult$ = m.cold("(j|)", {
          j: { code: 500, message: "Internal Server Error", response: {} }
        });
        mockRequest.mockReturnValueOnce(plansResult$);
        dl = setupDL({
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        });

        const result$ = dl
          .query(
            gql`
              query {
                service(id: $serviceId) {
                  id
                  plans
                }
              }
            `,
            { serviceId: "test" }
          )
          .pipe(take(1));
        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plans API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });
        m.expect(result$).toBeObservable(expected$);
      })
    );
    it(
      "throws an error if plans API returns non-2XX",
      marbles(m => {
        const plansResult$ = m.cold("(j|)", {
          j: { code: 200, message: "ok", response: ["plan-01"] }
        });
        const planDetailResult$ = m.cold("(j|)", {
          j: { code: 500, message: "Internal Server Error", response: {} }
        });
        const results = [plansResult$, planDetailResult$];
        mockRequest.mockImplementation(() => results.shift());
        dl = setupDL({
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        });

        const result$ = dl
          .query(
            gql`
              query {
                service(id: $serviceId) {
                  id
                  plans
                }
              }
            `,
            { serviceId: "test" }
          )
          .pipe(take(1));
        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plan Detail API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });
        m.expect(result$).toBeObservable(expected$);
      })
    );
    it(
      "works with ServicePlansClient",
      marbles(m => {
        const plansResult$ = m.cold("(j|)", {
          j: { code: 200, message: "ok", response: ["client-plan"] }
        });
        const planDetailResult$ = m.cold("(j|)", {
          j: {
            code: 200,
            message: "ok",
            response: makeFakePlanResponse()
          }
        });
        const results = [plansResult$, planDetailResult$];
        mockRequest.mockImplementation(() => results.shift());
        dl = setupDL({
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        });

        const result$ = dl
          .query(
            gql`
              query {
                service(id: $serviceId) {
                  id
                  plans {
                    name
                    status
                    strategy
                  }
                }
              }
            `,
            { serviceId: "test" }
          )
          .pipe(take(1));
        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              service: {
                id: "test",
                plans: [
                  {
                    name: "client-plan",
                    status: "IN_PROGRESS",
                    strategy: "serial"
                  }
                ]
              }
            }
          }
        });
        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
  describe("Query - service.plan", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        dl = setupDL({
          fetchServicePlans: (_serviceId: string) =>
            m.cold("(j|)", {
              j: {
                code: 200,
                message: "ok",
                response: ["plan-01", "plan-02", "plan-03"]
              }
            }),
          fetchServicePlanDetail: (_serviceId: string, _planName: string) =>
            m.cold("(j|)", {
              j: {
                code: 200,
                message: "ok",
                response: makeFakePlanResponse()
              }
            }),
          pollingInterval: m.time("--|")
        });
        const result$ = dl
          .query(
            gql`
              query {
                service(id: $serviceId) {
                  id
                  plans(name: $planName) {
                    name
                    status
                    strategy
                  }
                }
              }
            `,
            { serviceId: "test", planName: "plan-01" }
          )
          .pipe(take(1));
        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              service: {
                id: "test",
                plans: [
                  {
                    name: "plan-01",
                    status: "IN_PROGRESS",
                    strategy: "serial"
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
      "queries only one plan if name given",
      fakeSchedulers(advance => {
        jest.useFakeTimers();
        const resolverArgs = {
          fetchServicePlans: jest.fn((_serviceId: string) =>
            of({ code: 200, message: "ok", response: ["plan-01"] })
          ),
          fetchServicePlanDetail: jest.fn(
            (_serviceId: string, _planName: string) =>
              of({
                code: 200,
                message: "ok",
                response: makeFakePlanResponse()
              })
          ),
          pollingInterval: 20
        };

        dl = setupDL(resolverArgs);
        dl.query(
          gql`
            query {
              service(id: $serviceId) {
                id
                plans(name: $planName) {
                  name
                  status
                  strategy
                }
              }
            }
          `,
          { serviceId: "test", planName: "plan-01" }
        )
          .pipe(take(1))
          .subscribe();
        advance(20);
        expect(resolverArgs.fetchServicePlans).toHaveBeenCalledTimes(0);
        expect(resolverArgs.fetchServicePlanDetail).toHaveBeenCalledTimes(1);
      })
    );
    it(
      "polls the endpoint",
      marbles(m => {
        dl = setupDL({
          fetchServicePlans: (_serviceId: string) =>
            m.cold("(j|)", {
              j: {
                code: 200,
                message: "ok",
                response: ["plan-01", "plan-02", "plan-03"]
              }
            }),
          fetchServicePlanDetail: (_serviceId: string, _planName: string) =>
            m.cold("-j|", {
              j: {
                code: 200,
                message: "ok",
                response: makeFakePlanResponse()
              }
            }),
          pollingInterval: m.time("--|")
        });
        const query = gql`
          query {
            service(id: $serviceId) {
              id
              plans(name: $planName) {
                name
                status
              }
            }
          }
        `;
        const result$ = dl
          .query(query, { serviceId: "test", planName: "plan-02" })
          .pipe(take(3));
        const expected$ = m.cold("-x-x-(x|)", {
          x: {
            data: {
              service: {
                id: "test",
                plans: [
                  {
                    name: "plan-02",
                    status: "IN_PROGRESS"
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
      "throws an error if API returns non-2XX",
      marbles(m => {
        const planDetailResult$ = m.cold("(j|)", {
          j: { code: 500, message: "Internal Server Error", response: {} }
        });
        mockRequest.mockReturnValueOnce(planDetailResult$);
        dl = setupDL({
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        });
        const query = gql`
          query {
            service(id: $serviceId) {
              id
              plans(name: $planName) {
                name
              }
            }
          }
        `;
        const result$ = dl
          .query(query, { serviceId: "test", planName: "plan-01" })
          .pipe(take(1));
        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plan Detail API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });
        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
