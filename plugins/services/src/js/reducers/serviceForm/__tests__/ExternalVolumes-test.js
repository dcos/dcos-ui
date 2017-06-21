const ExternalVolumes = require("../ExternalVolumes");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Labels", function() {
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
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
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
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["externalVolumes"], 1, ADD_ITEM));
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
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["externalVolumes"], 1, ADD_ITEM));
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
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
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
      batch = batch.add(new Transaction(["externalVolumes"], 0, ADD_ITEM));
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

  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(ExternalVolumes.JSONParser({})).toEqual([]);
    });

    it("should return an empty array if only external volumes are present", function() {
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
      expect(ExternalVolumes.JSONParser(state)).toEqual([]);
    });

    it("should contain the transaction for one external volume", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
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
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["externalVolumes"] },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        { type: SET, value: "dvdi", path: ["externalVolumes", 0, "provider"] },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should exclude the external volume", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
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
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["externalVolumes"] },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        { type: SET, value: "dvdi", path: ["externalVolumes", 0, "provider"] },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should include a unknown value for provider", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["externalVolumes"] },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        {
          type: SET,
          value: "provider",
          path: ["externalVolumes", 0, "provider"]
        },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should include a unknown value for options", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  someValue: true
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["externalVolumes"] },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        {
          type: SET,
          value: "provider",
          path: ["externalVolumes", 0, "provider"]
        },
        {
          type: SET,
          value: {
            someValue: true
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should include a size value", function() {
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
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        { type: ADD_ITEM, value: 0, path: ["externalVolumes"] },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        { type: SET, value: 1024, path: ["externalVolumes", 0, "size"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        { type: SET, value: "dvdi", path: ["externalVolumes", 0, "provider"] },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });
  });
});
