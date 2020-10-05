import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import * as Volumes from "../Volumes";

const defaultVolume = {
  containerPath: null,
  size: null,
  profileName: null,
  mode: "RW",
  externalCSI: {
    name: "",
    provider: "csi",
    options: {
      pluginName: "",
      capability: {
        accessMode: "SINGLE_NODE_WRITER",
        accessType: "mount",
        fsType: "",
        mountFlags: [],
      },
      nodeStageSecret: {},
      nodePublishSecret: {},
      volumeContext: {},
    },
  },
};

describe("Volumes", () => {
  describe("#FormReducer", () => {
    it("returns an Array with one item", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
          .reduce(Volumes.FormReducer, [])
      ).toEqual([{ ...defaultVolume, type: "PERSISTENT" }]);
    });

    it("contains one full local Volumes item", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
          .add(new Transaction(["volumes", 0, "size"], 1024))
          .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
          .reduce(Volumes.FormReducer, [])
      ).toEqual([
        {
          ...defaultVolume,
          type: "PERSISTENT",
          size: 1024,
          containerPath: "/dev/null",
        },
      ]);
    });

    it("parses wrong typed values correctly", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], 123))
          .add(new Transaction(["volumes", 0, "hostPath"], 123))
          .add(new Transaction(["volumes", 0, "containerPath"], 123))
          .add(new Transaction(["volumes", 0, "size"], "1024"))
          .add(new Transaction(["volumes", 0, "mode"], 123))
          .reduce(Volumes.FormReducer, [])
      ).toEqual([
        {
          ...defaultVolume,
          size: 1024,
          hostPath: "123",
          containerPath: "123",
          mode: "123",
          profileName: null,
          type: "123",
        },
      ]);
    });

    it("contains two full local Volumes items", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
          .add(new Transaction(["volumes", 1, "type"], "PERSISTENT"))
          .add(new Transaction(["volumes", 0, "size"], 1024))
          .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
          .add(new Transaction(["volumes", 1, "size"], 512))
          .add(new Transaction(["volumes", 1, "containerPath"], "/dev/dev2"))
          .reduce(Volumes.FormReducer, [])
      ).toEqual([
        {
          ...defaultVolume,
          size: 1024,
          containerPath: "/dev/null",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
        {
          ...defaultVolume,
          size: 512,
          containerPath: "/dev/dev2",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });

    it("removes the right row.", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
          .add(new Transaction(["volumes", 1, "type"], "PERSISTENT"))
          .add(new Transaction(["volumes", 0, "size"], 1024))
          .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
          .add(new Transaction(["volumes", 1, "size"], 512))
          .add(new Transaction(["volumes", 1, "containerPath"], "/dev/dev2"))
          .add(new Transaction(["volumes"], 0, REMOVE_ITEM))
          .reduce(Volumes.FormReducer, [])
      ).toEqual([
        {
          ...defaultVolume,
          size: 512,
          containerPath: "/dev/dev2",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });

    it("sets the right mode.", () => {
      expect(
        new Batch()
          .add(new Transaction(["volumes"], null, ADD_ITEM))
          .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
          .add(new Transaction(["volumes", 0, "size"], 1024))
          .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
          .add(new Transaction(["volumes", 0, "mode"], "READ"))
          .reduce(Volumes.FormReducer, [])
      ).toEqual([
        {
          ...defaultVolume,
          size: 1024,
          containerPath: "/dev/null",
          mode: "READ",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });
  });
});
