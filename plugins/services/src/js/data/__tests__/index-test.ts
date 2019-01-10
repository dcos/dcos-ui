const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { Observable } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
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
    fetchServicePlans: (_serviceName: string) =>
      m.cold("(j|)", {
        j: { code: 200, message: "ok", response: plansResponse }
      }),
    fetchServicePlanDetail: (_serviceName: string, _planName: string) =>
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

describe("Service data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("plans", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        m.bind();

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolverConfig(m))
        });

        const query = gql`
          query {
            service(name: $serviceName) {
              name
              plans {
                name
                status
                strategy
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test"
        });
        const result$ = queryResult$.take(1);

        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              service: {
                name: "test",
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
        m.bind();

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
            service(name: $serviceName) {
              name
              plans {
                name
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test"
        });

        const expected$ = m.cold("--x-x-(x|)", {
          x: {
            data: {
              service: {
                name: "test",
                plans: [
                  {
                    name: "plan-01"
                  }
                ]
              }
            }
          }
        });

        m.expect(queryResult$.take(3)).toBeObservable(expected$);
      })
    );

    it(
      "shares the subscription",
      marbles(m => {
        m.bind();

        const resolverConfig = makeResolverConfig(m);
        resolverConfig.fetchServicePlans = jest.fn(
          resolverConfig.fetchServicePlans
        );

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolverConfig)
        });

        const query = gql`
          query {
            service(name: "test") {
              name
              plans {
                name
              }
            }
          }
        `;

        Observable.concat(
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1)
        ).subscribe(jest.fn(), jest.fn(), () => {
          expect(resolverConfig.fetchServicePlans).toHaveBeenCalledTimes(1);
        });
      })
    );

    it(
      "throws an error if plan detail API returns non-200",
      marbles(m => {
        m.bind();

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
            service(name: $serviceName) {
              name
              plans
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test"
        }).take(1);

        const expected$ = m.cold("#", undefined, {
          message:
            "Service Plans API request failed: 500 Internal Server Error:{}",
          name: "Error"
        });

        m.expect(queryResult$).toBeObservable(expected$);
      })
    );

    it(
      "throws an error if plans API returns non-200",
      marbles(m => {
        m.bind();

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
            service(name: $serviceName) {
              name
              plans
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test"
        }).take(1);

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
        m.bind();

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
            service(name: $serviceName) {
              name
              plans {
                name
                status
                strategy
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test"
        });
        const result$ = queryResult$.take(1);

        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              service: {
                name: "test",
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
        m.bind();

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolverConfig(m))
        });

        const query = gql`
          query {
            service(name: $serviceName) {
              name
              plans(name: $planName) {
                name
                status
                strategy
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test",
          planName: "plan-01"
        });
        const result$ = queryResult$.take(1);

        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              service: {
                name: "test",
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
      marbles(m => {
        m.bind();
        const resolversConfig = makeResolverConfig(m);
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
            service(name: $serviceName) {
              name
              plans(name: $planName) {
                name
                status
                strategy
              }
            }
          }
        `;

        graphqlObservable(query, serviceSchema, {
          serviceName: "test",
          planName: "plan-01"
        })
          .take(1)
          .subscribe(jest.fn(), jest.fn(), () => {
            expect(resolversConfig.fetchServicePlans).toHaveBeenCalledTimes(0);
            expect(
              resolversConfig.fetchServicePlanDetail
            ).toHaveBeenCalledTimes(1);
          });
      })
    );

    it(
      "polls the endpoint",
      marbles(m => {
        m.bind();

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
            service(name: $serviceName) {
              name
              plans(name: $planName) {
                name
                status
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test",
          planName: "plan-02"
        });

        const expected$ = m.cold("-x-x-(x|)", {
          x: {
            data: {
              service: {
                name: "test",
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

        m.expect(queryResult$.take(3)).toBeObservable(expected$);
      })
    );

    it(
      "shares the subscription",
      marbles(m => {
        m.bind();

        const resolverConfig = makeResolverConfig(m);
        resolverConfig.fetchServicePlanDetail = jest.fn(
          resolverConfig.fetchServicePlanDetail
        );

        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(resolverConfig)
        });

        const query = gql`
          query {
            service(name: "test") {
              name
              plans(name: "test-plan") {
                name
              }
            }
          }
        `;

        Observable.concat(
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1),
          graphqlObservable(query, serviceSchema, {}).take(1)
        ).subscribe(jest.fn(), jest.fn(), () => {
          expect(resolverConfig.fetchServicePlanDetail).toHaveBeenCalledTimes(
            1
          );
        });
      })
    );

    it(
      "throws an error if API returns non-200",
      marbles(m => {
        m.bind();

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
            service(name: $serviceName) {
              name
              plans(name: $planName) {
                name
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          serviceName: "test",
          planName: "plan-01"
        }).take(1);

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
