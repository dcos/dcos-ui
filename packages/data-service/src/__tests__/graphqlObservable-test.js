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
      return ctx.mutation.map(() => ({
        name: args.name
      }));
    },
    createShuttleList: (parent, args, ctx) => {
      return ctx.mutation.map(() => [
        { name: "discovery" },
        { name: "challenger" },
        { name: args.name }
      ]);
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: mockResolvers
});

const fieldResolverSchema = makeExecutableSchema({
  typeDefs: `
    type Plain {
      noFieldResolver: String!
      fieldResolver: String!
      giveMeTheParentFieldResolver: String!
      giveMeTheArgsFieldResolver(arg: String!): String!
      giveMeTheContextFieldResolver: String!
    }

    type ObjectValue {
      value: String!
    }

    type Item {
      nodeFieldResolver: ObjectValue!
      giveMeTheParentFieldResolver: ObjectValue!
      giveMeTheArgsFieldResolver(arg: String!): ObjectValue!
      giveMeTheContextFieldResolver: ObjectValue!
    }

    type Nested {
      firstFieldResolver: Nesting!
    }

    type Nesting {
      noFieldResolverValue: String!
      secondFieldResolver: String!
    }

    type Query {
      plain: Plain!
      item: Item!
      nested: Nested!
    }
  `,
  resolvers: {
    Plain: {
      fieldResolver() {
        return Observable.of("I am a field resolver");
      },
      giveMeTheParentFieldResolver(parent) {
        return Observable.of(JSON.stringify(parent));
      },
      giveMeTheArgsFieldResolver(_parent, args) {
        return Observable.of(JSON.stringify(args));
      },
      giveMeTheContextFieldResolver(_parent, _args, context) {
        return Observable.of(context.newValue);
      }
    },
    Item: {
      nodeFieldResolver() {
        return Observable.of({ value: "I am a node field resolver" });
      },
      giveMeTheParentFieldResolver(parent) {
        return Observable.of({ value: JSON.stringify(parent) });
      },
      giveMeTheArgsFieldResolver(_parent, args) {
        return Observable.of({ value: JSON.stringify(args) });
      },
      giveMeTheContextFieldResolver(_parent, _args, context) {
        return Observable.of({ value: context.newValue });
      }
    },
    Nested: {
      firstFieldResolver(_parent, _args, ctx) {
        ctx.contextValue = " resolvers are great";

        return Observable.of({ noFieldResolverValue: "nested" });
      }
    },
    Nesting: {
      secondFieldResolver({ noFieldResolverValue }, _, { contextValue }) {
        return Observable.of(
          noFieldResolverValue.toLocaleUpperCase() + contextValue
        );
      }
    },
    Query: {
      plain(_parent, _args, ctx) {
        ctx.newValue = "ContextValue";

        return Observable.of({
          noFieldResolver: "Yes"
        });
      },
      item(_parent, _args, ctx) {
        ctx.newValue = "NodeContextValue";

        return Observable.of({ thisIsANodeFieldResolver: "Yes" });
      },

      nested() {
        return Observable.of({});
      }
    }
  }
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

itMarbles.only = (title, test) => {
  // eslint-disable-next-line
  return it.only(
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
      const expected = m.cold("(a|)", {
        a: { data: { launched: expectedData } }
      });

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

      const expectedData = [{ name: "apollo11" }, { name: "challenger" }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { data: { launched: [expectedData[0]] } }
      });

      const nameFilter = Observable.of("apollo11");
      const result = graphqlObservable(query, schema, {
        query: dataSource,
        nameFilter
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("filters by static argument", function(m) {
      const query = gql`
        query {
          launched(name: "apollo13") {
            name
            firstFlight
          }
        }
      `;

      const expectedData = [{ name: "apollo13" }, { name: "challenger" }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { data: { launched: [expectedData[0]] } }
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
        a: { data: { launched: [{ name: "discovery" }] } }
      });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    itMarbles("resolve with name alias", function(m) {
      const query = gql`
        query {
          launched {
            title: name
          }
        }
      `;

      const expectedData = [{ name: "challenger", firstFlight: 1984 }];
      const dataSource = Observable.of(expectedData);
      const expected = m.cold("(a|)", {
        a: { data: { launched: [{ title: "challenger" }] } }
      });

      const result = graphqlObservable(query, schema, {
        query: dataSource
      });

      m.expect(result.take(1)).toBeObservable(expected);
    });

    describe("Field Resolvers", function() {
      describe("Leafs", function() {
        itMarbles("defaults to return the property on the object", function(m) {
          const query = gql`
            query {
              plain {
                noFieldResolver
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: { data: { plain: { noFieldResolver: "Yes" } } }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("if defined it executes the field resolver", function(m) {
          const query = gql`
            query {
              plain {
                fieldResolver
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: { data: { plain: { fieldResolver: "I am a field resolver" } } }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("the field resolvers 1st argument is parent", function(m) {
          const query = gql`
            query {
              plain {
                giveMeTheParentFieldResolver
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                plain: {
                  giveMeTheParentFieldResolver: JSON.stringify({
                    noFieldResolver: "Yes"
                  })
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("the field resolvers 2nd argument is arguments", function(m) {
          const query = gql`
            query {
              plain {
                giveMeTheArgsFieldResolver(arg: "My passed arg")
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                plain: {
                  giveMeTheArgsFieldResolver: JSON.stringify({
                    arg: "My passed arg"
                  })
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("the field resolvers 3rd argument is context", function(m) {
          const query = gql`
            query {
              plain {
                giveMeTheContextFieldResolver
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                plain: {
                  giveMeTheContextFieldResolver: "ContextValue"
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });
      });

      describe("Nodes", function() {
        itMarbles("if defined it executes the field resolver", function(m) {
          const query = gql`
            query {
              item {
                nodeFieldResolver {
                  value
                }
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                item: {
                  nodeFieldResolver: { value: "I am a node field resolver" }
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("the field resolvers 1st argument is parent", function(m) {
          const query = gql`
            query {
              item {
                giveMeTheParentFieldResolver {
                  value
                }
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                item: {
                  giveMeTheParentFieldResolver: {
                    value: JSON.stringify({
                      thisIsANodeFieldResolver: "Yes"
                    })
                  }
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("the field resolvers 2nd argument is arguments", function(m) {
          const query = gql`
            query {
              item {
                giveMeTheArgsFieldResolver(arg: "My passed arg") {
                  value
                }
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                item: {
                  giveMeTheArgsFieldResolver: {
                    value: JSON.stringify({
                      arg: "My passed arg"
                    })
                  }
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });

        itMarbles("the field resolvers 3rd argument is context", function(m) {
          const query = gql`
            query {
              item {
                giveMeTheContextFieldResolver {
                  value
                }
              }
            }
          `;
          const expected = m.cold("(a|)", {
            a: {
              data: {
                item: {
                  giveMeTheContextFieldResolver: { value: "NodeContextValue" }
                }
              }
            }
          });
          const result = graphqlObservable(query, fieldResolverSchema, {});
          m.expect(result.take(1)).toBeObservable(expected);
        });
      });

      itMarbles("nested resolvers pass down the context and parent", function(
        m
      ) {
        const query = gql`
          query {
            nested {
              firstFieldResolver {
                noFieldResolverValue
                secondFieldResolver
              }
            }
          }
        `;
        const expected = m.cold("(a|)", {
          a: {
            data: {
              nested: {
                firstFieldResolver: {
                  noFieldResolverValue: "nested",
                  secondFieldResolver: "NESTED resolvers are great"
                }
              }
            }
          }
        });
        const result = graphqlObservable(query, fieldResolverSchema, {});
        m.expect(result.take(1)).toBeObservable(expected);
      });
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
        a: { data: { createShuttle: { name: "RocketShip" } } }
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

        const commandContext = Observable.of("a request");

        const result = graphqlObservable(mutation, schema, {
          mutation: commandContext
        });

        const expected = m.cold("(a|)", {
          a: {
            data: {
              createShuttleList: [
                { name: "discovery" },
                { name: "challenger" },
                { name: "RocketShip" }
              ]
            }
          }
        });

        m.expect(result).toBeObservable(expected);
      }
    );

    itMarbles("accept alias name", function(m) {
      const mutation = gql`
        mutation {
          shut: createShuttle(name: $name) {
            name
          }
        }
      `;

      const commandContext = Observable.of("a resquest");

      const result = graphqlObservable(mutation, schema, {
        mutation: commandContext,
        name: "RocketShip"
      });

      const expected = m.cold("(a|)", {
        a: { data: { shut: { name: "RocketShip" } } }
      });

      m.expect(result).toBeObservable(expected);
    });
  });
});
