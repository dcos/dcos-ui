const { ADD_ITEM, REMOVE_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const ExternalVolumes = require("../ExternalVolumes");

describe("External Volumes", function() {
  describe("#FormReducer", function() {
    it("should return an Array with one item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: null,
          name: null,
          provider: "dvdi",
          options: {
            "dvdi/driver": "rexray"
          },
          mode: "RW"
        }
      ]);
    });

    it("should contain one full external Volumes item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "name"], "null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "containerPath"], "/dev/null")
      );
      batch = batch.add(new Transaction(["externalVolumes", 0, "size"], 1024));
      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: "/dev/null",
          name: "null",
          provider: "dvdi",
          size: 1024,
          options: {
            "dvdi/driver": "rexray"
          },
          mode: "RW"
        }
      ]);
    });

    it("should parse wrong typed values correctly", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["externalVolumes", 0, "name"], 123));
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "provider"], 123)
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "containerPath"], 123)
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "size"], "1024")
      );
      batch = batch.add(new Transaction(["externalVolumes", 0, "mode"], 123));
      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: "123",
          name: "123",
          provider: "123",
          size: 1024,
          options: {
            "dvdi/driver": "rexray"
          },
          mode: "123"
        }
      ]);
    });

    it("should contain two full external Volumes items", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "name"], "null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "containerPath"], "/dev/null")
      );
      batch = batch.add(new Transaction(["externalVolumes", 1, "name"], "one"));
      batch = batch.add(
        new Transaction(["externalVolumes", 1, "containerPath"], "/dev/one")
      );
      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: "/dev/null",
          name: "null",
          provider: "dvdi",
          options: {
            "dvdi/driver": "rexray"
          },
          mode: "RW"
        },
        {
          containerPath: "/dev/one",
          name: "one",
          provider: "dvdi",
          options: {
            "dvdi/driver": "rexray"
          },
          mode: "RW"
        }
      ]);
    });

    it("should remove the right row.", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "name"], "null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "containerPath"], "/dev/null")
      );
      batch = batch.add(new Transaction(["externalVolumes", 1, "name"], "one"));
      batch = batch.add(
        new Transaction(["externalVolumes", 1, "containerPath"], "/dev/one")
      );
      batch = batch.add(new Transaction(["externalVolumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: "/dev/one",
          name: "one",
          provider: "dvdi",
          options: {
            "dvdi/driver": "rexray"
          },
          mode: "RW"
        }
      ]);
    });

    it("should set the right options.", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "containerPath"], "/dev/null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "name"], "null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "options"], {
          somethingElse: true
        })
      );

      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: "/dev/null",
          name: "null",
          provider: "dvdi",
          options: {
            somethingElse: true
          },
          mode: "RW"
        }
      ]);
    });
    it("should set the right provider.", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["externalVolumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "containerPath"], "/dev/null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "name"], "null")
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "options"], {
          somethingElse: true
        })
      );
      batch = batch.add(
        new Transaction(["externalVolumes", 0, "provider"], "provider")
      );

      expect(batch.reduce(ExternalVolumes.FormReducer, [])).toEqual([
        {
          containerPath: "/dev/null",
          name: "null",
          provider: "provider",
          options: {
            somethingElse: true
          },
          mode: "RW"
        }
      ]);
    });
  });
});
