import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import * as Volumes from "../Volumes";

describe("Volumes", () => {
  describe("#JSONReducer", () => {
    it("returns an empty array if no volumes are set", () => {
      expect(new Batch().reduce(Volumes.JSONReducer.bind({}), [])).toEqual([]);
    });

    it("returns a local volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT", SET))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: null,
          persistent: {
            size: null,
          },
          mode: "RW",
        },
      ]);
    });

    it("parses wrong values in local volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "size"], "123", SET))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT", SET))
          .add(new Transaction(["volumes", 0, "mode"], 123, SET))
          .add(new Transaction(["volumes", 0, "containerPath"], 123, SET))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "123",
          persistent: {
            size: 123,
          },
          mode: "123",
        },
      ]);
    });

    it("parses wrong values in local volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], 123, SET))
          .add(new Transaction(["volumes", 0, "mode"], 123, SET))
          .add(new Transaction(["volumes", 0, "hostPath"], 123, SET))
          .add(new Transaction(["volumes", 0, "containerPath"], 123, SET))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([{ hostPath: "123", containerPath: "123", mode: "123" }]);
    });

    it("returns an external volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "EXTERNAL"))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: null,
          external: {
            name: null,
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray",
            },
          },
          mode: "RW",
        },
      ]);
    });

    it("parses wrong values in external volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "EXTERNAL", SET))
          .add(new Transaction(["volumes", 0, "provider"], 123, SET))
          .add(new Transaction(["volumes", 0, "name"], 123, SET))
          .add(new Transaction(["volumes", 0, "containerPath"], 123, SET))
          .add(new Transaction(["volumes", 0, "size"], "123", SET))
          .add(new Transaction(["volumes", 0, "mode"], 123, SET))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "123",
          external: {
            name: "123",
            provider: "123",
            size: 123,
            options: {
              "dvdi/driver": "rexray",
            },
          },
          mode: "123",
        },
      ]);
    });

    it("will change from host to external volume", () => {
      expect(
        new Batch()

          .add(
            new Transaction(
              ["volumes"],
              {
                containerPath: "test",
                hostPath: "test",
                mode: "RW",
              },
              ADD_ITEM
            )
          )
          .add(new Transaction(["volumes", 0, "type"], "EXTERNAL", SET))
          .add(new Transaction(["volumes", 0, "name"], "test", SET))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          mode: "RW",
          containerPath: "test",
          external: {
            name: "test",
            provider: "dvdi",
            options: { "dvdi/driver": "rexray" },
          },
        },
      ]);
    });
    it("returns a local and an external volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT", SET))
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 1, "type"], "EXTERNAL", SET))

          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: null,
          persistent: {
            size: null,
          },
          mode: "RW",
        },
        {
          containerPath: null,
          external: {
            name: null,
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray",
            },
          },
          mode: "RW",
        },
      ]);
    });

    it("returns a fully filled local volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT", SET))
          .add(
            new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
          )
          .add(new Transaction(["volumes", 0, "size"], 1024, SET))
          .add(new Transaction(["volumes", 0, "mode"], "READ", SET))

          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "/dev/null",
          persistent: {
            size: 1024,
          },
          mode: "READ",
        },
      ]);
    });

    it("returns a fully filled external volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "EXTERNAL", SET))
          .add(
            new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
          )
          .add(new Transaction(["volumes", 0, "name"], "null", SET))
          .add(
            new Transaction(["volumes", 0, "options"], { someValue: true }, SET)
          )
          .add(new Transaction(["volumes", 0, "provider"], "provider", SET))
          .add(new Transaction(["volumes", 0, "size"], 1024, SET))

          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "/dev/null",
          external: {
            size: 1024,
            name: "null",
            provider: "provider",
            options: {
              someValue: true,
            },
          },
          mode: "RW",
        },
      ]);
    });

    it("removes the right local volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT", SET))
          .add(new Transaction(["volumes", 1, "type"], "PERSISTENT", SET))
          .add(
            new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
          )
          .add(new Transaction(["volumes", 0, "size"], 1024, SET))
          .add(new Transaction(["volumes", 0, "mode"], "READ", SET))
          .add(
            new Transaction(["volumes", 1, "containerPath"], "/dev/one", SET)
          )
          .add(new Transaction(["volumes", 1, "size"], 512, SET))
          .add(new Transaction(["volumes"], 0, REMOVE_ITEM))

          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "/dev/one",
          persistent: {
            size: 512,
          },
          mode: "RW",
        },
      ]);
    });

    it("removes the right external volume", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "EXTERNAL", SET))
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 1, "type"], "EXTERNAL", SET))
          .add(
            new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
          )
          .add(new Transaction(["volumes", 0, "name"], "null", SET))
          .add(
            new Transaction(["volumes", 0, "options"], { someValue: true }, SET)
          )
          .add(new Transaction(["volumes", 0, "provider"], "provider", SET))
          .add(
            new Transaction(["volumes", 1, "containerPath"], "/dev/one", SET)
          )
          .add(new Transaction(["volumes", 1, "name"], "one", SET))
          .add(new Transaction(["volumes"], 0, REMOVE_ITEM))

          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "/dev/one",
          external: {
            name: "one",
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray",
            },
          },
          mode: "RW",
        },
      ]);
    });

    it("contains a mixed combination of volumes", () => {
      expect(
        new Batch()
          // Add the first external Volume
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "EXTERNAL"))
          .add(
            new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
          )
          .add(new Transaction(["volumes", 0, "name"], "null", SET))
          .add(
            new Transaction(["volumes", 0, "options"], { someValue: true }, SET)
          )
          .add(new Transaction(["volumes", 0, "provider"], "provider", SET))
          // Add the first local Volume
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 1, "type"], "PERSISTENT", SET))
          .add(
            new Transaction(["volumes", 1, "containerPath"], "/dev/null", SET)
          )
          .add(new Transaction(["volumes", 1, "size"], 1024, SET))
          .add(new Transaction(["volumes", 1, "mode"], "READ", SET))
          // Add the second external Volume
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 2, "type"], "EXTERNAL"))
          .add(
            new Transaction(["volumes", 2, "containerPath"], "/dev/one", SET)
          )
          .add(new Transaction(["volumes", 2, "name"], "one", SET))
          // Add the second local Volume
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 3, "type"], "PERSISTENT", SET))
          .add(
            new Transaction(["volumes", 3, "containerPath"], "/dev/one", SET)
          )
          .add(new Transaction(["volumes", 3, "size"], 512, SET))
          .reduce(Volumes.JSONReducer.bind({}), [])
      ).toEqual([
        {
          containerPath: "/dev/null",
          external: {
            name: "null",
            provider: "provider",
            options: {
              someValue: true,
            },
          },
          mode: "RW",
        },
        {
          containerPath: "/dev/null",
          persistent: {
            size: 1024,
          },
          mode: "READ",
        },
        {
          containerPath: "/dev/one",
          external: {
            name: "one",
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray",
            },
          },
          mode: "RW",
        },
        {
          containerPath: "/dev/one",
          persistent: {
            size: 512,
          },
          mode: "RW",
        },
      ]);
    });
  });
  describe("Volumes", () => {
    describe("#JSONParser", () => {
      it("returns an empty array", () => {
        expect(Volumes.JSONParser({})).toEqual([]);
      });

      it("returns an empty array for unknown values", () => {
        const state = { container: { volumes: [{ test: "RW" }] } };
        expect(Volumes.JSONParser(state)).toEqual([]);
      });

      it("returns an array consisting of one transaction", () => {
        const state = {
          container: {
            volumes: [
              {
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              mode: "RW",
            },
            path: ["volumes"],
          },
          {
            type: SET,
            value: "RW",
            path: ["volumes", 0, "mode"],
          },
        ]);
      });

      it("contains the transaction for one local volume", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                persistent: { size: 1024 },
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "RW",
            },
            path: ["volumes"],
          },
          { type: SET, value: "PERSISTENT", path: ["volumes", 0, "type"] },
          { type: SET, value: 1024, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] },
        ]);
      });

      it("includes a unknown value for modes", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                persistent: { size: 1024 },
                mode: "READ",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "READ",
            },
            path: ["volumes"],
          },
          { type: SET, value: "PERSISTENT", path: ["volumes", 0, "type"] },
          { type: SET, value: 1024, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "READ", path: ["volumes", 0, "mode"] },
        ]);
      });
    });
  });
  describe("External Volumes", () => {
    describe("#JSONParser", () => {
      it("contains the transaction for one external volume", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                external: {
                  name: "null",
                  provider: "dvdi",
                  options: {
                    "dvdi/driver": "rexray",
                  },
                },
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray",
                },
              },
              mode: "RW",
            },
            path: ["volumes"],
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          {
            type: SET,
            value: {
              "dvdi/driver": "rexray",
            },
            path: ["volumes", 0, "options"],
          },
          { type: SET, value: "dvdi", path: ["volumes", 0, "provider"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] },
        ]);
      });

      it("includes a unknown value for provider", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                external: {
                  name: "null",
                  provider: "provider",
                  options: {
                    "dvdi/driver": "rexray",
                  },
                },
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  "dvdi/driver": "rexray",
                },
              },
              mode: "RW",
            },
            path: ["volumes"],
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          {
            type: SET,
            value: {
              "dvdi/driver": "rexray",
            },
            path: ["volumes", 0, "options"],
          },
          {
            type: SET,
            value: "provider",
            path: ["volumes", 0, "provider"],
          },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] },
        ]);
      });

      it("includes a unknown value for options", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                external: {
                  name: "null",
                  provider: "provider",
                  options: {
                    someValue: true,
                  },
                },
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  someValue: true,
                },
              },
              mode: "RW",
            },
            path: ["volumes"],
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          {
            type: SET,
            value: {
              someValue: true,
            },
            path: ["volumes", 0, "options"],
          },
          {
            type: SET,
            value: "provider",
            path: ["volumes", 0, "provider"],
          },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] },
        ]);
      });

      it("includes a size value", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                external: {
                  size: 1024,
                  name: "null",
                  provider: "dvdi",
                  options: {
                    "dvdi/driver": "rexray",
                  },
                },
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              external: {
                size: 1024,
                name: "null",

                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray",
                },
              },
              mode: "RW",
            },
            path: ["volumes"],
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          { type: SET, value: 1024, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: {
              "dvdi/driver": "rexray",
            },
            path: ["volumes", 0, "options"],
          },
          { type: SET, value: "dvdi", path: ["volumes", 0, "provider"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] },
        ]);
      });
    });
  });
  describe("DSS Volumes", () => {
    describe("#JSONParser", () => {
      it("contains the transaction for one external volume", () => {
        const state = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                persistent: {
                  size: 1,
                  profileName: "devnull",
                  type: "mount",
                },
                mode: "RW",
              },
            ],
          },
        };
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              persistent: {
                size: 1,
                profileName: "devnull",
                type: "mount",
              },
              mode: "RW",
            },
            path: ["volumes"],
          },
          { type: SET, value: "DSS", path: ["volumes", 0, "type"] },
          { type: SET, value: "devnull", path: ["volumes", 0, "profileName"] },
          { type: SET, value: 1, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"],
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] },
        ]);
      });
    });
    describe("#JSONReducer", () => {
      it("returns a DSS volume", () => {
        expect(
          new Batch()
            .add(new Transaction(["volumes"], null, ADD_ITEM))
            .add(new Transaction(["volumes", 0, "type"], "DSS", SET))

            .reduce(Volumes.JSONReducer.bind({}), [])
        ).toEqual([
          {
            containerPath: null,
            persistent: {
              size: null,
              profileName: null,
              type: "mount",
            },
            mode: "RW",
          },
        ]);
      });

      it("returns DSS volume after changing the type", () => {
        expect(
          new Batch()
            .add(new Transaction(["volumes"], null, ADD_ITEM))
            .add(new Transaction(["volumes", 0, "type"], "PERSISTENT", SET))
            .add(
              new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
            )
            .add(new Transaction(["volumes", 0, "size"], 1024, SET))
            .add(new Transaction(["volumes", 0, "mode"], "RW", SET))
            .add(new Transaction(["volumes", 0, "type"], "DSS", SET))
            .add(new Transaction(["volumes", 0, "profileName"], "dev", SET))
            .reduce(Volumes.JSONReducer.bind({}), [])
        ).toEqual([
          {
            containerPath: "/dev/null",
            persistent: {
              size: 1024,
              profileName: "dev",
              type: "mount",
            },
            mode: "RW",
          },
        ]);
      });

      it("persists persists volume type", () => {
        expect(
          new Batch()
            .add(
              new Transaction(
                ["volumes"],
                {
                  containerPath: null,
                  persistent: {
                    size: 1024,
                    type: "test",
                  },
                  mode: "RW",
                },
                ADD_ITEM
              )
            )

            .add(
              new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
            )
            .add(new Transaction(["volumes", 0, "type"], "DSS", SET))
            .add(new Transaction(["volumes", 0, "profileName"], "dev", SET))

            .reduce(Volumes.JSONReducer.bind({}), [])
        ).toEqual([
          {
            containerPath: "/dev/null",
            persistent: {
              size: 1024,
              profileName: "dev",
              type: "test",
            },
            mode: "RW",
          },
        ]);
      });

      it("returns a DSS volume with profileName", () => {
        expect(
          new Batch()
            .add(new Transaction(["volumes"], null, ADD_ITEM))
            .add(new Transaction(["volumes", 0, "type"], "DSS", SET))
            .add(new Transaction(["volumes", 0, "profileName"], "dev", SET))
            .reduce(Volumes.JSONReducer.bind({}), [])
        ).toEqual([
          {
            containerPath: null,
            persistent: {
              size: null,
              profileName: "dev",
              type: "mount",
            },
            mode: "RW",
          },
        ]);
      });
    });
  });
});
