import * as Networks from "../Networks";
import { ADD_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

describe("Networks", () => {
  describe("#JSONParser", () => {
    it("returns an empty array", () => {
      expect(Networks.JSONParser({})).toEqual([]);
    });

    it("defaults mode to CONTAINER when name is defined", () => {
      const state = {
        networks: [
          {
            mode: "host",
            name: "dcos",
          },
        ],
      };
      expect(Networks.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: {
            mode: "host",
            name: "dcos",
          },
          path: ["networks"],
        },
        { type: SET, value: "dcos", path: ["networks", 0, "name"] },
        { type: SET, value: "CONTAINER", path: ["networks", 0, "mode"] },
      ]);
    });

    it("sets BRIDGE mode", () => {
      const state = {
        networks: [{ mode: "container/bridge" }],
      };
      expect(Networks.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: { mode: "container/bridge" },
          path: ["networks"],
        },
        { type: SET, value: "BRIDGE", path: ["networks", 0, "mode"] },
      ]);
    });

    it("sets HOST mode", () => {
      const state = {
        networks: [{ mode: "host" }],
      };
      expect(Networks.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: { mode: "host" }, path: ["networks"] },
        { type: SET, value: "HOST", path: ["networks", 0, "mode"] },
      ]);
    });

    it("keeps unknown attributes", () => {
      const network = {
        mode: "container",
        name: "dcos",
        labels: {
          foo: "bar",
        },
      };
      const state = {
        networks: [network],
      };

      expect(Networks.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: network, path: ["networks"] },
        { type: SET, value: "dcos", path: ["networks", 0, "name"] },
        { type: SET, value: "CONTAINER", path: ["networks", 0, "mode"] },
      ]);
    });
  });
});
