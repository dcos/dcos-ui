const ParserUtil = require("../ParserUtil");

const SET = "SET";

describe("ParserUtil", function() {
  describe("#combinePasers", function() {
    function idParser(state) {
      return {
        type: SET,
        path: "id",
        value: state.id
      };
    }

    it("should return a function", function() {
      expect(typeof ParserUtil.combineParsers()).toBe("function");
    });

    it("should return the right TransactionLog", function() {
      const parsers = ParserUtil.combineParsers([idParser]);
      expect(parsers({ id: "test" })).toEqual([
        {
          type: SET,
          path: "id",
          value: "test"
        }
      ]);
    });

    it("should have the right ordered TransactionLog with multiple parsers", function() {
      const parser = ParserUtil.combineParsers([
        idParser,
        function(state) {
          return {
            type: SET,
            path: "cmd",
            value: state.cmd
          };
        }
      ]);
      const appDefinition = {
        id: "test",
        cmd: "sleep 100;"
      };
      expect(parser(appDefinition)).toEqual([
        {
          type: SET,
          path: "id",
          value: "test"
        },
        {
          type: SET,
          path: "cmd",
          value: "sleep 100;"
        }
      ]);
    });
    it("should have the right order for nested parsers", function() {
      const containerParser = function(state) {
        if (state.container != null && state.container.docker != null) {
          return ParserUtil.combineParsers([
            function(state) {
              return {
                type: SET,
                path: "container.docker.image",
                value: state.container.docker.image
              };
            }
          ])(state);
        }

        return [];
      };

      const parser = ParserUtil.combineParsers([idParser, containerParser]);

      const state = {
        id: "docker",
        container: {
          docker: {
            image: "nginx"
          }
        }
      };

      expect(parser(state)).toEqual([
        {
          type: SET,
          path: "id",
          value: "docker"
        },
        {
          type: SET,
          path: "container.docker.image",
          value: "nginx"
        }
      ]);
    });
  });
});
