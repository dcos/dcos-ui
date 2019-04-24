const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { of } from "rxjs";
import { take } from "rxjs/operators";
import { marbles, fakeSchedulers } from "rxjs-marbles/jest";
import { makeExecutableSchema } from "graphql-tools";
import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";

import { schemas, resolvers } from "../index";
import {
  fetchPlanDetails,
  fetchPlans,
  ServicePlanResponse
} from "#PLUGINS/services/src/js/data/ServicePlansClient";

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

function makeResolverConfig(
  m: any,
  plansResponse: string[] = ["plan-01", "plan-02", "plan-03"]
) {
  return {
    fetchServicePlans: (_serviceId: string) =>
      m.cold("(j|)", {
        j: { code: 200, message: "ok", response: plansResponse }
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
  };
}

function makeResolverConfigNoMarble(
  plansResponse: string[] = ["plan-01", "plan-02", "plan-03"]
) {
  return {
    fetchServicePlans: (_serviceId: string) =>
      of({ code: 200, message: "ok", response: plansResponse }),
    fetchServicePlanDetail: (_serviceId: string, _planName: string) =>
      of({
        code: 200,
        message: "ok",
        response: makeFakePlanResponse()
      }),
    pollingInterval: 20
  };
}

describe("Service data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("plans", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolverConfig(m))
        });

        const query = gql`
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
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test"
        });
        const result$ = queryResult$.pipe(take(1));

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
        const fetchServicePlans = (_service: string) =>
          m.cold("j|", {
            j: {
              code: 200,
              message: "ok",
              response: ["plan-01"]
            }
          });
        const fetchServicePlanDetail = (_service: string, _planName: string) =>
          m.cold("--j|", {
            j: {
              code: 200,
              message: "ok",
              response: makeFakePlanResponse()
            }
          });
        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers({
            fetchServicePlans,
            fetchServicePlanDetail,
            pollingInterval: m.time("--|")
          })
        });

        const query = gql`
          query {
            service(id: $serviceId) {
              id
              plans {
                name
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test"
        });

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

        m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
      })
    );

    it(
      "throws an error if plan detail API returns non-2XX",
      marbles(m => {
        const plansResult$ = m.cold("(j|)", {
          j: { code: 500, message: "Internal Server Error", response: {} }
        });
        mockRequest.mockReturnValueOnce(plansResult$);

        const resolversConfig = {
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        };

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolversConfig)
        });

        const query = gql`
          query {
            service(id: $serviceId) {
              id
              plans
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test"
        }).pipe(take(1));

        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plans API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });

        m.expect(queryResult$).toBeObservable(expected$);
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

        const resolversConfig = {
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        };

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolversConfig)
        });

        const query = gql`
          query {
            service(id: $serviceId) {
              id
              plans
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test"
        }).pipe(take(1));

        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plan Detail API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });

        m.expect(queryResult$).toBeObservable(expected$);
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

        const resolversConfig = {
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        };

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolversConfig)
        });

        const query = gql`
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
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test"
        });
        const result$ = queryResult$.pipe(take(1));

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

  describe("single plan", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolverConfig(m))
        });

        const query = gql`
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
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test",
          planName: "plan-01"
        });
        const result$ = queryResult$.pipe(take(1));

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
        const resolversConfig = makeResolverConfigNoMarble();
        resolversConfig.fetchServicePlans = jest.fn(
          resolversConfig.fetchServicePlans
        );
        resolversConfig.fetchServicePlanDetail = jest.fn(
          resolversConfig.fetchServicePlanDetail
        );
        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolversConfig)
        });

        const query = gql`
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
        `;

        graphqlObservable(query, serviceSchema, {
          serviceId: "test",
          planName: "plan-01"
        })
          .pipe(take(1))
          .subscribe();

        advance(20);
        expect(resolversConfig.fetchServicePlans).toHaveBeenCalledTimes(0);
        expect(resolversConfig.fetchServicePlanDetail).toHaveBeenCalledTimes(1);
      })
    );

    it(
      "polls the endpoint",
      marbles(m => {
        const resolversConfig = makeResolverConfig(m);

        resolversConfig.fetchServicePlanDetail = (
          _service: string,
          _planName: string
        ) =>
          m.cold("-j|", {
            j: {
              code: 200,
              message: "ok",
              response: makeFakePlanResponse()
            }
          });
        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolversConfig)
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

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test",
          planName: "plan-02"
        });

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

        m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
      })
    );

    it(
      "throws an error if API returns non-2XX",
      marbles(m => {
        const planDetailResult$ = m.cold("(j|)", {
          j: { code: 500, message: "Internal Server Error", response: {} }
        });
        mockRequest.mockReturnValueOnce(planDetailResult$);

        const resolversConfig = {
          fetchServicePlans: fetchPlans,
          fetchServicePlanDetail: fetchPlanDetails,
          pollingInterval: m.time("--|")
        };

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolversConfig)
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

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceId: "test",
          planName: "plan-01"
        }).pipe(take(1));

        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plan Detail API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });

        m.expect(queryResult$).toBeObservable(expected$);
      })
    );
  });
});
