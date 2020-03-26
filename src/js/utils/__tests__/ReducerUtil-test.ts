import * as TransactionType from "../../constants/TransactionTypes";

import * as ReducerUtil from "../ReducerUtil";

let thisItems, thisReducers;

describe("ReducerUtil", () => {
  describe("#combineReducers", () => {
    const idReducer = (state = "", action) => {
      if (action.path.join("") === "id") {
        state = action.value;
      }

      return state;
    };

    beforeEach(() => {
      thisItems = [
        {
          path: ["id"],
          value: "foo",
        },
      ];
      thisReducers = ReducerUtil.combineReducers({
        id: idReducer,
      });
    });

    it("returns a function", () => {
      expect(typeof ReducerUtil.combineReducers()).toBe("function");
    });

    it("works with a simple reducer object", () => {
      const state = thisItems.reduce(thisReducers, {});

      expect(state).toEqual({ id: "foo" });
    });

    it("does not remove existing values", () => {
      const state = thisItems.reduce(thisReducers, { bar: "bar" });

      expect(state).toEqual({ id: "foo", bar: "bar" });
    });

    it("uses context", () => {
      const reducers = ReducerUtil.combineReducers({
        id: idReducer,
        vip(state, action) {
          if (action.path.join("") === "id") {
            this.id = action.value;
          }

          if (action.path.join("") === "port") {
            this.port = action.value;
          }

          if (this.id && this.port) {
            return `${this.id}:${this.port}`;
          }

          return state;
        },
      });
      let array = [
        {
          path: ["id"],
          value: "foo",
        },
        {
          path: ["port"],
          value: "8080",
        },
      ];

      const state = array.reduce(reducers, {});

      array = [
        {
          path: ["id"],
          value: "bar",
        },
      ];

      const secondState = array.reduce(reducers, {});

      expect([state, secondState]).toEqual([
        { id: "foo", vip: "foo:8080" },
        { id: "bar", vip: undefined },
      ]);
    });

    it("uses context in nested combineReducers", () => {
      const reducers = ReducerUtil.combineReducers({
        id: idReducer,
        container: ReducerUtil.combineReducers({
          vip(state, action) {
            if (action.path.join("") === "id") {
              this.id = action.value;
            }

            if (action.path.join("") === "port") {
              this.port = action.value;
            }

            if (this.id && this.port) {
              return `${this.id}:${this.port}`;
            }

            return state;
          },
        }),
      });
      let array = [
        {
          path: ["id"],
          value: "foo",
        },
        {
          path: ["port"],
          value: "8080",
        },
      ];

      const state = array.reduce(reducers, {});

      array = [
        {
          path: ["id"],
          value: "bar",
        },
      ];

      const secondState = array.reduce(reducers, {});

      expect([state, secondState]).toEqual([
        {
          id: "foo",
          container: { vip: "foo:8080" },
        },
        {
          id: "bar",
          container: { vip: undefined },
        },
      ]);
    });

    it("properlies apply a set of user actions", () => {
      const dockerReduce = ReducerUtil.combineReducers({
        id(state, action) {
          if (
            action.action === "SET" &&
            action.path.join(".") === "container.docker"
          ) {
            return action.value;
          }

          return state;
        },
      });

      const reducers = ReducerUtil.combineReducers({
        id(state = "", action) {
          if (action.action === "SET" && action.path.join("") === "id") {
            state = action.value;
          }

          return state;
        },
        cmd(state, action) {
          if (action.action === "SET" && action.path.join("") === "cmd") {
            state = action.value;
          }

          return state;
        },
        container: ReducerUtil.combineReducers({
          docker(state, action) {
            if (
              action.action === "SET" &&
              action.path.join(".") === "container.docker"
            ) {
              return dockerReduce(state, action);
            }

            return state;
          },
        }),
      });

      let state = {};

      const actions = [
        {
          action: "SET",
          path: ["id"],
          value: "foo",
        },
        {
          action: "SET",
          path: ["cmd"],
          value: "sleep 100;",
        },
        {
          action: "SET",
          path: ["container", "docker"],
          value: "nginx",
        },
      ];

      state = actions.reduce((state, action) => {
        state = reducers(state, action);

        return state;
      }, state);

      expect(state).toEqual({
        id: "foo",
        cmd: "sleep 100;",
        container: { docker: { id: "nginx" } },
      });
    });

    it("runs reducers that have not been configured", () => {
      const reducers = ReducerUtil.combineReducers({ id: idReducer });

      const state = thisItems.reduce(reducers, { bar: "bar" });

      expect(state).toEqual({ id: "foo", bar: "bar" });
    });
  });

  describe("#parseIntValue", () => {
    it("returns the integer value parsed", () => {
      expect(ReducerUtil.parseIntValue("10")).toEqual(10);
    });

    it("returns empty string as-is", () => {
      expect(ReducerUtil.parseIntValue("")).toEqual("");
    });

    it("returns unparsable number string as-is", () => {
      expect(ReducerUtil.parseIntValue("foo")).toEqual("foo");
    });

    it("returns numbers as-is", () => {
      expect(ReducerUtil.parseIntValue(123)).toEqual(123);
    });
  });

  describe("#simpleReducer", () => {
    it("returns a function", () => {
      expect(typeof ReducerUtil.simpleReducer()).toBe("function");
    });

    it("returns default state if path doesn't match", () => {
      const simpleReducer = ReducerUtil.simpleReducer("path", "default");
      const action = {
        path: ["something", "else"],
        type: TransactionType.SET,
        value: "something",
      };
      expect(simpleReducer(undefined, action)).toEqual("default");
    });

    it("returns new value if path does match", () => {
      const simpleReducer = ReducerUtil.simpleReducer("path", "default");
      const action = {
        path: ["path"],
        type: TransactionType.SET,
        value: "something",
      };
      expect(simpleReducer(undefined, action)).toEqual("something");
    });

    it("returns new value of deep nested path", () => {
      const simpleReducer = ReducerUtil.simpleReducer(
        "foo.bar.deep.nest",
        "default"
      );
      const action = {
        path: ["foo", "bar", "deep", "nest"],
        type: TransactionType.SET,
        value: "something",
      };
      expect(simpleReducer(undefined, action)).toEqual("something");
    });
  });

  describe("#simpleIntReducer", () => {
    it("returns a function", () => {
      expect(typeof ReducerUtil.simpleIntReducer()).toBe("function");
    });

    it("returns default state if path doesn't match", () => {
      const simpleIntReducer = ReducerUtil.simpleIntReducer("baz", "default");
      const action = {
        path: ["foo", "bar"],
        type: TransactionType.SET,
        value: "quis",
      };
      expect(simpleIntReducer(undefined, action)).toEqual("default");
    });

    it("returns string if cannot be parsed to integer", () => {
      const simpleIntReducer = ReducerUtil.simpleIntReducer(
        "foo.bar",
        "default"
      );
      const action = {
        path: ["foo", "bar"],
        type: TransactionType.SET,
        value: "a1bc",
      };
      expect(simpleIntReducer(undefined, action)).toEqual("a1bc");
    });

    it("returns number if value can be parsed to integer", () => {
      const simpleIntReducer = ReducerUtil.simpleIntReducer(
        "foo.bar",
        "default"
      );
      const action = {
        path: ["foo", "bar"],
        type: TransactionType.SET,
        value: "1.0",
      };
      expect(simpleIntReducer(undefined, action)).toEqual(1);
    });
  });

  describe("#simpleFloatReducer", () => {
    it("returns a function", () => {
      expect(typeof ReducerUtil.simpleFloatReducer()).toBe("function");
    });

    it("returns default state if path doesn't match", () => {
      const simpleFloatReducer = ReducerUtil.simpleFloatReducer(
        "baz",
        "default"
      );
      const action = {
        path: ["foo", "bar"],
        type: TransactionType.SET,
        value: "quis",
      };
      expect(simpleFloatReducer(undefined, action)).toEqual("default");
    });

    it("returns string if cannot be parsed to float", () => {
      const simpleFloatReducer = ReducerUtil.simpleFloatReducer(
        "foo.bar",
        "default"
      );
      const action = {
        path: ["foo", "bar"],
        type: TransactionType.SET,
        value: "a1.05bc",
      };
      expect(simpleFloatReducer(undefined, action)).toEqual("a1.05bc");
    });

    it("returns number if value can be parsed to float", () => {
      const simpleFloatReducer = ReducerUtil.simpleFloatReducer(
        "foo.bar",
        "default"
      );
      const action = {
        path: ["foo", "bar"],
        type: TransactionType.SET,
        value: "1.05",
      };
      expect(simpleFloatReducer(undefined, action)).toEqual(1.05);
    });
  });

  it("returns the old state if action does not fit", () => {
    const simpleReducer = ReducerUtil.simpleReducer("path", "default");
    const action = {
      path: ["something", "else"],
      type: TransactionType.SET,
      value: "something",
    };
    expect(simpleReducer("old", action)).toEqual("old");
  });

  it("returns the new state if action does fit", () => {
    const simpleReducer = ReducerUtil.simpleReducer("path", "default");
    const action = {
      path: ["path"],
      type: TransactionType.SET,
      value: "new value",
    };
    expect(simpleReducer("old", action)).toEqual("new value");
  });
});
