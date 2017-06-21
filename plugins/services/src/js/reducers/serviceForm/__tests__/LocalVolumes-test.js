const LocalVolumes = require("../LocalVolumes");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("LocalVolumes", function() {
  describe("#FormReducer", function() {
    it("should return an Array with one item", function() {
      const batch = new Batch()
        .add(new Transaction(["localVolumes"], 0, ADD_ITEM))
        .add(new Transaction(["localVolumes", 0, "type"], "PERSISTENT"));
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        { size: null, containerPath: null, mode: "RW", type: "PERSISTENT" }
      ]);
    });

    it("should contain one full local Volumes item", function() {
      const batch = new Batch()
        .add(new Transaction(["localVolumes"], 0, ADD_ITEM))
        .add(new Transaction(["localVolumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["localVolumes", 0, "size"], 1024))
        .add(
          new Transaction(["localVolumes", 0, "containerPath"], "/dev/null")
        );
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {
          size: 1024,
          containerPath: "/dev/null",
          mode: "RW",
          type: "PERSISTENT"
        }
      ]);
    });

    it("should parse wrong typed values correctly", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["localVolumes"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["localVolumes", 0, "type"], 123));
      batch = batch.add(new Transaction(["localVolumes", 0, "hostPath"], 123));
      batch = batch.add(
        new Transaction(["localVolumes", 0, "containerPath"], 123)
      );
      batch = batch.add(new Transaction(["localVolumes", 0, "size"], "1024"));
      batch = batch.add(new Transaction(["localVolumes", 0, "mode"], 123));
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {
          size: 1024,
          hostPath: "123",
          containerPath: "123",
          mode: "123",
          type: "123"
        }
      ]);
    });

    it("should contain two full local Volumes items", function() {
      const batch = new Batch()
        .add(new Transaction(["localVolumes"], 0, ADD_ITEM))
        .add(new Transaction(["localVolumes"], 1, ADD_ITEM))
        .add(new Transaction(["localVolumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["localVolumes", 1, "type"], "PERSISTENT"))
        .add(new Transaction(["localVolumes", 0, "size"], 1024))
        .add(new Transaction(["localVolumes", 0, "containerPath"], "/dev/null"))
        .add(new Transaction(["localVolumes", 1, "size"], 512))
        .add(
          new Transaction(["localVolumes", 1, "containerPath"], "/dev/dev2")
        );
      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {
          size: 1024,
          containerPath: "/dev/null",
          mode: "RW",
          type: "PERSISTENT"
        },
        {
          size: 512,
          containerPath: "/dev/dev2",
          mode: "RW",
          type: "PERSISTENT"
        }
      ]);
    });

    it("should remove the right row.", function() {
      const batch = new Batch()
        .add(new Transaction(["localVolumes"], 0, ADD_ITEM))
        .add(new Transaction(["localVolumes"], 1, ADD_ITEM))
        .add(new Transaction(["localVolumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["localVolumes", 1, "type"], "PERSISTENT"))
        .add(new Transaction(["localVolumes", 0, "size"], 1024))
        .add(new Transaction(["localVolumes", 0, "containerPath"], "/dev/null"))
        .add(new Transaction(["localVolumes", 1, "size"], 512))
        .add(new Transaction(["localVolumes", 1, "containerPath"], "/dev/dev2"))
        .add(new Transaction(["localVolumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {
          size: 512,
          containerPath: "/dev/dev2",
          mode: "RW",
          type: "PERSISTENT"
        }
      ]);
    });

    it("should set the right mode.", function() {
      const batch = new Batch()
        .add(new Transaction(["localVolumes"], 0, ADD_ITEM))
        .add(new Transaction(["localVolumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["localVolumes", 0, "size"], 1024))
        .add(new Transaction(["localVolumes", 0, "containerPath"], "/dev/null"))
        .add(new Transaction(["localVolumes", 0, "mode"], "READ"));

      expect(batch.reduce(LocalVolumes.FormReducer, [])).toEqual([
        {
          size: 1024,
          containerPath: "/dev/null",
          mode: "READ",
          type: "PERSISTENT"
        }
      ]);
    });
  });

  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(LocalVolumes.JSONParser({})).toEqual([]);
    });

    it("should return an empty array if only external volumes are present", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/mnt/volume",
              external: {
                name: "someVolume",
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([]);
    });

    it("should contain the transaction for one local volume", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "RW"
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["localVolumes"] },
        { type: SET, value: "PERSISTENT", path: ["localVolumes", 0, "type"] },
        { type: SET, value: 1024, path: ["localVolumes", 0, "size"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["localVolumes", 0, "containerPath"]
        },
        { type: SET, value: "RW", path: ["localVolumes", 0, "mode"] }
      ]);
    });

    it("should exclude the external volumes", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/mnt/volume",
              external: {
                name: "someVolume",
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            },
            {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "RW"
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["localVolumes"] },
        { type: SET, value: "PERSISTENT", path: ["localVolumes", 0, "type"] },
        { type: SET, value: 1024, path: ["localVolumes", 0, "size"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["localVolumes", 0, "containerPath"]
        },
        { type: SET, value: "RW", path: ["localVolumes", 0, "mode"] }
      ]);
    });

    it("should include a unknown value for modes", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "READ"
            }
          ]
        }
      };
      expect(LocalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["localVolumes"] },
        { type: SET, value: "PERSISTENT", path: ["localVolumes", 0, "type"] },
        { type: SET, value: 1024, path: ["localVolumes", 0, "size"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["localVolumes", 0, "containerPath"]
        },
        { type: SET, value: "READ", path: ["localVolumes", 0, "mode"] }
      ]);
    });
  });
});
