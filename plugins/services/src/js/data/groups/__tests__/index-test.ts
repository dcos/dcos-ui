import { Container } from "@extension-kid/core";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import gql from "graphql-tag";
import { marbles } from "rxjs-marbles/jest";

import { createTestContainer } from "../../__tests__/extension-test";
import { take } from "rxjs/operators";

describe("Services Data Layer - Groups", () => {
  let container: Container;
  let dl: DataLayer;
  beforeEach(() => {
    container = createTestContainer();
    dl = container.get<DataLayer>(DataLayerType);
  });

  describe("Query - groups", () => {
    it(
      "returns an empty array",
      marbles(m => {
        const query = gql`
          query {
            groups {
              id
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              groups: []
            }
          }
        });
        m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
      })
    );
  });

  describe("Query - group", () => {
    it(
      "returns a group when given id",
      marbles(m => {
        const query = gql`
          query {
            group(id: "/test") {
              id
              quota {
                enforced
              }
            }
          }
        `;
        const expected$ = m.cold("(a|)", {
          a: {
            data: {
              group: {
                id: "/test",
                quota: {
                  enforced: false
                }
              }
            }
          }
        });
        m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
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
  });
});
