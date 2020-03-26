import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import * as Volumes from "../Volumes";

describe("Volumes", () => {
  describe("#FormReducer", () => {
    it("returns an Array with one item", () => {
      const batch = new Batch()
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"));
      expect(batch.reduce(Volumes.FormReducer, [])).toEqual([
        {
          size: null,
          containerPath: null,
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });

    it("contains one full local Volumes item", () => {
      const batch = new Batch()
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["volumes", 0, "size"], 1024))
        .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"));
      expect(batch.reduce(Volumes.FormReducer, [])).toEqual([
        {
          size: 1024,
          containerPath: "/dev/null",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });

    it("parses wrong typed values correctly", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], 123));
      batch = batch.add(new Transaction(["volumes", 0, "hostPath"], 123));
      batch = batch.add(new Transaction(["volumes", 0, "containerPath"], 123));
      batch = batch.add(new Transaction(["volumes", 0, "size"], "1024"));
      batch = batch.add(new Transaction(["volumes", 0, "mode"], 123));
      expect(batch.reduce(Volumes.FormReducer, [])).toEqual([
        {
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
      const batch = new Batch()
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["volumes", 1, "type"], "PERSISTENT"))
        .add(new Transaction(["volumes", 0, "size"], 1024))
        .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
        .add(new Transaction(["volumes", 1, "size"], 512))
        .add(new Transaction(["volumes", 1, "containerPath"], "/dev/dev2"));
      expect(batch.reduce(Volumes.FormReducer, [])).toEqual([
        {
          size: 1024,
          containerPath: "/dev/null",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
        {
          size: 512,
          containerPath: "/dev/dev2",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });

    it("removes the right row.", () => {
      const batch = new Batch()
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["volumes", 1, "type"], "PERSISTENT"))
        .add(new Transaction(["volumes", 0, "size"], 1024))
        .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
        .add(new Transaction(["volumes", 1, "size"], 512))
        .add(new Transaction(["volumes", 1, "containerPath"], "/dev/dev2"))
        .add(new Transaction(["volumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Volumes.FormReducer, [])).toEqual([
        {
          size: 512,
          containerPath: "/dev/dev2",
          mode: "RW",
          profileName: null,
          type: "PERSISTENT",
        },
      ]);
    });

    it("sets the right mode.", () => {
      const batch = new Batch()
        .add(new Transaction(["volumes"], null, ADD_ITEM))
        .add(new Transaction(["volumes", 0, "type"], "PERSISTENT"))
        .add(new Transaction(["volumes", 0, "size"], 1024))
        .add(new Transaction(["volumes", 0, "containerPath"], "/dev/null"))
        .add(new Transaction(["volumes", 0, "mode"], "READ"));

      expect(batch.reduce(Volumes.FormReducer, [])).toEqual([
        {
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
