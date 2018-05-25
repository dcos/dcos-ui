import { marbles } from "rxjs-marbles/jest";
import { resolvers } from "../data/repositoriesModel";

const data = [
  {
    name: "Universe",
    uri: "https://universe.mesosphere.com/repo",
    priority: 0
  },
  {
    name: "Marvel Universe",
    uri: "https://marvel.universe.mesosphere.com",
    priority: 1
  },
  {
    name: "DC Universe",
    uri: "https://dc.universe.mesosphere.com/batmans-repo",
    priority: 2
  }
];

describe("Repository Model", function() {
  describe("#packageRepository", function() {
    it(
      "returns all repositories without filter",
      marbles(function(m) {
        m.bind();
        const query = m.cold("a|", {
          a: { repositories: data }
        });
        const expected = m.cold("a|", {
          a: ["Universe", "Marvel Universe", "DC Universe"]
        });
        const context = {
          query: { packageRepository: query }
        };

        const result = resolvers.Query.packageRepository(
          null,
          { filter: "" },
          context
        );

        m
          .expect(result.map(item => item.map(({ name }) => name)))
          .toBeObservable(expected);
      })
    );

    it(
      "returns filtered repositories",
      marbles(function(m) {
        m.bind();
        const query = m.cold("a|", {
          a: { repositories: data }
        });
        const expected = m.cold("a|", {
          a: ["Marvel Universe"]
        });
        const context = {
          query: { packageRepository: query }
        };

        const result = resolvers.Query.packageRepository(
          null,
          { filter: "Marvel" },
          context
        );

        m
          .expect(result.map(item => item.map(({ name }) => name)))
          .toBeObservable(expected);
      })
    );
  });

  describe("#addPackageRepository", function() {
    it(
      "passes the result of the provider",
      marbles(function(m) {
        m.bind();
        const mutation = m.cold("a|", {
          a: { repositories: data }
        });
        const expected = m.cold("a|", {
          a: ["Universe", "Marvel Universe", "DC Universe"]
        });
        const context = {
          mutation: {
            addPackageRepository: jest.fn(() => mutation)
          }
        };

        const result = resolvers.Mutation.addPackageRepository(
          null,
          {
            name: "DC Universe",
            uri: "https://dc.universe.mesosphere.com/batmans-repo",
            index: 2
          },
          context
        );

        m
          .expect(result.map(item => item.map(({ name }) => name)))
          .toBeObservable(expected);
        expect(context.mutation.addPackageRepository).toHaveBeenCalledWith(
          "DC Universe",
          "https://dc.universe.mesosphere.com/batmans-repo",
          2
        );
      })
    );

    it(
      "passes the error if provider fails",
      marbles(function(m) {
        m.bind();
        const mutation = m.cold("#", {}, new Error("Could not add repository"));
        const expected = m.cold("#", {}, new Error("Could not add repository"));
        const context = {
          mutation: {
            addPackageRepository: jest.fn(() => mutation)
          }
        };

        const result = resolvers.Mutation.addPackageRepository(
          null,
          {
            name: "DC Universe",
            uri: "https://dc.universe.mesosphere.com/batmans-repo",
            index: 2
          },
          context
        );

        m.expect(result).toBeObservable(expected);
        expect(context.mutation.addPackageRepository).toHaveBeenCalledWith(
          "DC Universe",
          "https://dc.universe.mesosphere.com/batmans-repo",
          2
        );
      })
    );
  });

  describe("#removePackageRepository", function() {
    it(
      "passes the result of the provider",
      marbles(function(m) {
        m.bind();
        const mutation = m.cold("a|", {
          a: { repositories: data }
        });
        const expected = m.cold("a|", {
          a: ["Universe", "Marvel Universe", "DC Universe"]
        });
        const context = {
          mutation: {
            removePackageRepository: jest.fn(() => mutation)
          }
        };

        const result = resolvers.Mutation.removePackageRepository(
          null,
          {
            name: "Marvel Universe",
            uri: "https://marvel.universe.mesosphere.com"
          },
          context
        );

        m
          .expect(result.map(item => item.map(({ name }) => name)))
          .toBeObservable(expected);
        expect(context.mutation.removePackageRepository).toHaveBeenCalledWith(
          "Marvel Universe",
          "https://marvel.universe.mesosphere.com"
        );
      })
    );

    it(
      "passes the error if provider fails",
      marbles(function(m) {
        m.bind();
        const mutation = m.cold("#", {}, new Error("Could not add repository"));
        const expected = m.cold("#", {}, new Error("Could not add repository"));
        const context = {
          mutation: {
            removePackageRepository: jest.fn(() => mutation)
          }
        };

        const result = resolvers.Mutation.removePackageRepository(
          null,
          {
            name: "Marvel Universe",
            uri: "https://marvel.universe.mesosphere.com"
          },
          context
        );

        m.expect(result).toBeObservable(expected);
        expect(context.mutation.removePackageRepository).toHaveBeenCalledWith(
          "Marvel Universe",
          "https://marvel.universe.mesosphere.com"
        );
      })
    );
  });
});
