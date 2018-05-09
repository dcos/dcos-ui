import { marbles } from "rxjs-marbles/jest";
import { resolvers } from "../data/repositoriesModel";

describe("Repository Model", function() {
  describe("#packageRepository", function() {
    let data;
    beforeEach(function() {
      data = [
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
    });

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
          query
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
          query
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
});
