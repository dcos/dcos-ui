const mockMarathonGet = jest.fn();
const mockRequest = jest.fn();
jest.mock("../../../stores/MarathonStore", () => ({
  get: mockMarathonGet
}));
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { Container } from "@extension-kid/core";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import gql from "graphql-tag";
import { marbles } from "rxjs-marbles/jest";
import { take } from "rxjs/operators";

import { createTestContainer } from "../../__tests__/extension-test";
import ServiceTree from "../../../structs/ServiceTree";
//@ts-ignore
import MarathonUtil from "../../../utils/MarathonUtil";

const marathonGroups = require("./_fixtures/marathon-groups.json");
const rolesDev = require("./_fixtures/roles-dev.json");

function makeServiceTree(groupsResponse = {}): ServiceTree {
  return new ServiceTree(MarathonUtil.parseGroups(groupsResponse));
}

describe("Services Data Layer - Groups", () => {
  let container: Container;
  let dl: DataLayer;
  beforeEach(() => {
    container = createTestContainer();
    dl = container.get<DataLayer>(DataLayerType);

    jest.clearAllMocks();
  });

  describe("Query - groups", () => {
    it(
      "handles query for all groups",
      marbles(m => {
        const marathonServiceTree = makeServiceTree(marathonGroups);
        const roles$ = m.cold("(a|)", {
          a: {
            code: 200,
            message: "OK",
            response: JSON.stringify(rolesDev)
          }
        });
        mockMarathonGet.mockReturnValue(marathonServiceTree);
        mockRequest.mockReturnValue(roles$);

        const query = gql`
          query {
            groups {
              id
              quota {
                enforced
                cpus
                memory
                disk
                gpus
              }
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              groups: [
                {
                  id: "/dev",
                  quota: {
                    enforced: true,
                    cpus: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    },
                    memory: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    },
                    disk: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    },
                    gpus: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    }
                  }
                },
                {
                  id: "/staging",
                  quota: {
                    enforced: false,
                    cpus: undefined,
                    memory: undefined,
                    disk: undefined,
                    gpus: undefined
                  }
                },
                {
                  id: "/prod",
                  quota: {
                    enforced: false,
                    cpus: undefined,
                    memory: undefined,
                    disk: undefined,
                    gpus: undefined
                  }
                }
              ]
            }
          }
        });
        m.expect(dl.query(query, {}).pipe(take(1))).toBeObservable(expected$);
      })
    );

    it(
      "handles query for filtering enforce quota",
      marbles(m => {
        const marathonServiceTree = makeServiceTree(marathonGroups);
        const roles$ = m.cold("(a|)", {
          a: {
            code: 200,
            message: "OK",
            response: JSON.stringify(rolesDev)
          }
        });
        mockMarathonGet.mockReturnValue(marathonServiceTree);
        mockRequest.mockReturnValue(roles$);

        const query = gql`
          query {
            groups(filter: $filter) {
              id
              quota {
                enforced
                cpus
                memory
                disk
                gpus
              }
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              groups: [
                {
                  id: "/dev",
                  quota: {
                    enforced: true,
                    cpus: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    },
                    memory: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    },
                    disk: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    },
                    gpus: {
                      guarantee: 0,
                      limit: 0,
                      consumed: 0
                    }
                  }
                }
              ]
            }
          }
        });
        m.expect(
          dl
            .query(query, {
              filter: JSON.stringify({ quota: { enforced: true } })
            })
            .pipe(take(1))
        ).toBeObservable(expected$);
      })
    );

    it(
      "handles query for filtering enforce quota is false",
      marbles(m => {
        const marathonServiceTree = makeServiceTree(marathonGroups);
        const roles$ = m.cold("(a|)", {
          a: {
            code: 200,
            message: "OK",
            response: JSON.stringify(rolesDev)
          }
        });
        mockMarathonGet.mockReturnValue(marathonServiceTree);
        mockRequest.mockReturnValue(roles$);

        const query = gql`
          query {
            groups(filter: $filter) {
              id
              quota {
                enforced
                cpus
                memory
                disk
                gpus
              }
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              groups: [
                {
                  id: "/staging",
                  quota: {
                    enforced: false,
                    cpus: undefined,
                    memory: undefined,
                    disk: undefined,
                    gpus: undefined
                  }
                },
                {
                  id: "/prod",
                  quota: {
                    enforced: false,
                    cpus: undefined,
                    memory: undefined,
                    disk: undefined,
                    gpus: undefined
                  }
                }
              ]
            }
          }
        });
        m.expect(
          dl
            .query(query, {
              filter: JSON.stringify({ quota: { enforced: false } })
            })
            .pipe(take(1))
        ).toBeObservable(expected$);
      })
    );
  });

  describe("Query - group", () => {
    it(
      "returns a group when given id",
      marbles(m => {
        const marathonServiceTree = makeServiceTree(marathonGroups);
        const roles$ = m.cold("(a|)", {
          a: {
            code: 200,
            message: "OK",
            response: JSON.stringify(rolesDev)
          }
        });
        mockMarathonGet.mockReturnValue(marathonServiceTree);
        mockRequest.mockReturnValue(roles$);

        const query = gql`
          query {
            group(id: "/dev") {
              id
              quota
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              group: {
                id: "/dev",
                quota: {
                  enforced: true,
                  cpus: {
                    guarantee: 0,
                    limit: 0,
                    consumed: 0
                  },
                  memory: {
                    guarantee: 0,
                    limit: 0,
                    consumed: 0
                  },
                  disk: {
                    guarantee: 0,
                    limit: 0,
                    consumed: 0
                  },
                  gpus: {
                    guarantee: 0,
                    limit: 0,
                    consumed: 0
                  }
                }
              }
            }
          }
        });
        m.expect(dl.query(query, {}).pipe(take(1))).toBeObservable(expected$);
      })
    );

    it(
      "returns an error when query not given an id",
      marbles(m => {
        const query = gql`
          query {
            group {
              id
              quota {
                enforced
              }
            }
          }
        `;
        const expected$ = m.cold(
          "#",
          undefined,
          "Group resolver arguments aren't valid for type ServiceGroupQueryArgs"
        );
        m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
      })
    );

    // Skip until our reactive graphql can be updated through data-service
    it.skip(
      "returns undefined if group not found",
      marbles(m => {
        const marathonServiceTree = makeServiceTree(marathonGroups);
        const roles$ = m.cold("(a|)", {
          a: {
            code: 200,
            message: "OK",
            response: JSON.stringify(rolesDev)
          }
        });
        mockMarathonGet.mockReturnValue(marathonServiceTree);
        mockRequest.mockReturnValue(roles$);

        const query = gql`
          query {
            group(id: "/test") {
              id
              quota
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              group: undefined
            }
          }
        });
        m.expect(dl.query(query, {}).pipe(take(1))).toBeObservable(expected$);
      })
    );
  });
});
