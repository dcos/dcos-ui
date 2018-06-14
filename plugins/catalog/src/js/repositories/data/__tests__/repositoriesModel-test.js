import { marbles } from "rxjs-marbles/jest";
import { resolvers } from "../repositoriesModel";

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
        const queryResult = m.cold("a|", {
          a: { repositories: data }
        });
        const expected = m.cold("a|", {
          a: ["Universe", "Marvel Universe", "DC Universe"]
        });

        const result = resolvers({
          liveFetchRepositories: () => queryResult
        }).Query.packageRepository(null, { filter: "" });

        m.expect(
          result.map(item => item.map(({ name }) => name))
        ).toBeObservable(expected);
      })
    );

    it(
      "returns filtered repositories",
      marbles(function(m) {
        m.bind();
        const queryResult = m.cold("a|", {
          a: { repositories: data }
        });
        const expected = m.cold("a|", {
          a: ["Marvel Universe"]
        });

        const result = resolvers({
          liveFetchRepositories: () => queryResult
        }).Query.packageRepository(null, { filter: "Marvel" });

        m.expect(
          result.map(item => item.map(({ name }) => name))
        ).toBeObservable(expected);
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

        const addRepository = jest.fn();
        addRepository.mockReturnValue(mutation);

        const result = resolvers({
          addRepository
        }).Mutation.addPackageRepository(null, {
          name: "DC Universe",
          uri: "https://dc.universe.mesosphere.com/batmans-repo",
          index: 2
        });

        m.expect(
          result.map(item => item.map(({ name }) => name))
        ).toBeObservable(expected);

        expect(addRepository).toHaveBeenCalledWith(
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
        const addRepository = jest.fn();
        addRepository.mockReturnValueOnce(mutation);

        const result = resolvers({
          addRepository
        }).Mutation.addPackageRepository(null, {
          name: "DC Universe",
          uri: "https://dc.universe.mesosphere.com/batmans-repo",
          index: 2
        });

        m.expect(result).toBeObservable(expected);

        expect(addRepository).toHaveBeenCalledWith(
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

        const deleteRepository = jest.fn();
        deleteRepository.mockReturnValueOnce(mutation);

        const result = resolvers({
          deleteRepository
        }).Mutation.removePackageRepository(null, {
          name: "Marvel Universe",
          uri: "https://marvel.universe.mesosphere.com"
        });

        m.expect(
          result.map(item => item.map(({ name }) => name))
        ).toBeObservable(expected);

        expect(deleteRepository).toHaveBeenCalledWith(
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

        const deleteRepository = jest.fn();
        deleteRepository.mockReturnValueOnce(mutation);

        const result = resolvers({
          deleteRepository
        }).Mutation.removePackageRepository(null, {});

        m.expect(result).toBeObservable(expected);
      })
    );
  });
});
