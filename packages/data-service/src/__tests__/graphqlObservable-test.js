import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/interval";
import "rxjs/add/observable/of";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/map";
import "rxjs/add/operator/take";

import { marbles } from "rxjs-marbles/jest";

import { makeExecutableSchema } from "graphql-tools";
import gql from "graphql-tag";

import { graphqlObservable } from "../graphqlObservable";

const typeDefs = `
  type Shuttle {
    name: String!
  }
  
  type Query {
    launched(name: String): [Shuttle!]!
  }
  
  type Mutation {
    createShuttle(name: String): Shuttle!
    createShuttleList(name: String): [Shuttle!]!
  }  
`;

const mockResolvers = {
  Query: {
    launched: (parent, args, ctx) => {
      const { name } = args;

      // act according with the type of filter
      if (name === undefined) {
        // When no filter is passed
        return ctx.query;
      } else if (typeof name === "string") {
        // When the filter is a value
        return ctx.query.map(els => els.filter(el => el.name === name));
      } else {
        // when the filter is an observable
        return ctx.query
          .combineLatest(name, (res, name) => [res, name])
          .map(els => els[0].filter(el => el.name === els[1]));
      }
    }
  },
  Mutation: {
    createShuttle: (parent, args, ctx) => {
      return ctx.mutation;
    },
    createShuttleList: (parent, args, ctx) => {
      return ctx.mutation;
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: mockResolvers
});

// jest helper who binds the marbles for you
const itMarbles = (title, test) => {
  return it(
    title,
    marbles(m => {
      m.bind();
      test(m);
    })
  );
};

describe("graphqlObservable", function() {
  describe("Query", function() {
    itMarbles("solves listing all fields", function(m) {
      const query = gql`
        query {
          launched {
            name
          }
        }
      `;

      const expectedData = [{ name: "discovery" }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", { a: { launched: expectedData } });

      const result = graphqlObservable(query, schema, { query: dataSource });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("filters by variable argument", function(m) {
      const query = gql`
        query {
          launched(name: $nameFilter) {
            name
            firstFlight
          }
        }
      `;

      const expectedData = [{ name: "discovery" }, { name: "challenger" }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", { a: { launched: [expectedData[0]] } });

      const nameFilter = Observable.of("discovery");
      const result = graphqlObservable(query, schema, {
        query: dataSource,
        nameFilter
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("filters by static argument", function(m) {
      const query = gql`
        query {
          launched(name: "discovery") {
            name
            firstFlight
          }
        }
      `;

      const expectedData = [{ name: "discovery" }, { name: "challenger" }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", { a: { launched: [expectedData[0]] } });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("filters out fields", function(m) {
      const query = gql`
        query {
          launched {
            name
          }
        }
      `;

      const expectedData = [{ name: "discovery", firstFlight: 1984 }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { launched: [{ name: "discovery" }] }
      });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("filters out fields", function(m) {
      const query = gql`
        query {
          launched {
            name
          }
        }
      `;

      const expectedData = [{ name: "discovery", firstFlight: 1984 }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { launched: [{ name: "discovery" }] }
      });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("resolve with query alias", function(m) {
      const query = gql`
        query nasa {
          launched {
            name
          }
        }
      `;

      const expectedData = [{ name: "discovery", firstFlight: 1984 }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { nasa: [{ name: "discovery" }] }
      });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("resolve multiple queries with alias", function(m) {
      const query = gql`
        query nasa {
          launched {
            name
          }
        }

        query roscosmos {
          launched {
            name
          }
        }
      `;

      const expectedData = [{ name: "discovery", firstFlight: 1984 }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { nasa: [{ name: "discovery" }], roscosmos: [{ name: "discovery" }] }
      });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });
  });

  describe("Mutation", function() {
    itMarbles("createShuttle adds a shuttle and return its name", function(m) {
      const mutation = gql`
        mutation {
          createShuttle(name: "RocketShip") {
            name
          }
        }
      `;

      const fakeRequest = { name: "RocketShip" };
      const commandContext = Observable.of(fakeRequest);

      const result = graphqlObservable(mutation, schema, {
        mutation: commandContext
      });

      const expected = m.cold("(a|)", {
        a: { createShuttle: { name: "RocketShip" } }
      });

      m.expect(result).toBeObservable(expected);
    });

    itMarbles(
      "createShuttleList adds a shuttle and return all shuttles",
      function(m) {
        const mutation = gql`
          mutation {
            createShuttleList(name: "RocketShip") {
              name
            }
          }
        `;

        const fakeRequest = [
          { name: "discovery" },
          { name: "challenger" },
          { name: "RocketShip" }
        ];
        const commandContext = Observable.of(fakeRequest);

        const result = graphqlObservable(mutation, schema, {
          mutation: commandContext
        });

        const expected = m.cold("(a|)", {
          a: {
            createShuttleList: [
              { name: "discovery" },
              { name: "challenger" },
              { name: "RocketShip" }
            ]
          }
        });

        m.expect(result).toBeObservable(expected);
      }
    );

    itMarbles("accept alias name", function(m) {
      const mutation = gql`
        mutation addShuttle($name: String) {
          createShuttle(name: $name) {
            name
          }
        }
      `;

      const fakeRequest = { name: "RocketShip" };
      const commandContext = Observable.of(fakeRequest);

      const result = graphqlObservable(mutation, schema, {
        mutation: commandContext,
        name: "RocketShip"
      });

      const expected = m.cold("(a|)", {
        a: { addShuttle: { name: "RocketShip" } }
      });

      m.expect(result).toBeObservable(expected);
    });
  });
});
