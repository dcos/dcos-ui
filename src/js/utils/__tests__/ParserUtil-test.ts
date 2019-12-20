import * as ParserUtil from "../ParserUtil";

const SET = "SET";

describe("ParserUtil", () => {
  describe("#combinePasers", () => {
    function idParser(state) {
      return {
        type: SET,
        path: "id",
        value: state.id
      };
    }

    it("returns a function", () => {
      expect(typeof ParserUtil.combineParsers()).toBe("function");
    });

    it("returns the right TransactionLog", () => {
      const parsers = ParserUtil.combineParsers([idParser]);
      expect(parsers({ id: "test" })).toEqual([
        {
          type: SET,
          path: "id",
          value: "test"
        }
      ]);
    });

    it("has the right ordered TransactionLog with multiple parsers", () => {
      const parser = ParserUtil.combineParsers([
        idParser,
        state => ({
          type: SET,
          path: "cmd",
          value: state.cmd
        })
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
    it("has the right order for nested parsers", () => {
      const containerParser = state => {
        if (state.container != null && state.container.docker != null) {
          return ParserUtil.combineParsers([
            state => ({
              type: SET,
              path: "container.docker.image",
              value: state.container.docker.image
            })
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
