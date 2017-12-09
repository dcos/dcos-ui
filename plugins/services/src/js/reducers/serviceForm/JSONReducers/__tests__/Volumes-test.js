const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const Volumes = require("../Volumes");

describe("Volumes", function() {
  describe("#JSONReducer", function() {
    it("should return an empty array if no volumes are set", function() {
      const batch = new Batch();

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([]);
    });

    it("should return a local volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: null,
          persistent: {
            size: null
          },
          mode: "RW"
        }
      ]);
    });

    it("should parse wrong values in local volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "size"], "123", SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "mode"], 123, SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], 123, SET)
      );

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: "123",
          persistent: {
            size: 123
          },
          mode: "123"
        }
      ]);
    });

    it("should parse wrong values in local volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      // Ignores wrong type
      batch = batch.add(new Transaction(["volumes", 0, "type"], 123, SET));
      batch = batch.add(new Transaction(["volumes", 0, "mode"], 123, SET));
      batch = batch.add(new Transaction(["volumes", 0, "hostPath"], 123, SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], 123, SET)
      );

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          hostPath: "123",
          containerPath: "123",
          mode: "123"
        }
      ]);
    });

    it("should return an external volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "EXTERNAL"));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: null,
          external: {
            name: null,
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray"
            }
          },
          mode: "RW"
        }
      ]);
    });

    it("should parse wrong values in external volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "EXTERNAL", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "provider"], 123, SET));
      batch = batch.add(new Transaction(["volumes", 0, "name"], 123, SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], 123, SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "size"], "123", SET));
      batch = batch.add(new Transaction(["volumes", 0, "mode"], 123, SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: "123",
          external: {
            name: "123",
            provider: "123",
            size: 123,
            options: {
              "dvdi/driver": "rexray"
            }
          },
          mode: "123"
        }
      ]);
    });

    it("should return a local and an external volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 1, "type"], "EXTERNAL", SET)
      );

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: null,
          persistent: {
            size: null
          },
          mode: "RW"
        },
        {
          containerPath: null,
          external: {
            name: null,
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray"
            }
          },
          mode: "RW"
        }
      ]);
    });

    it("should return a fully filled local volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "size"], 1024, SET));
      batch = batch.add(new Transaction(["volumes", 0, "mode"], "READ", SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: "/dev/null",
          persistent: {
            size: 1024
          },
          mode: "READ"
        }
      ]);
    });

    it("should return a fully filled external volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "EXTERNAL", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "name"], "null", SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "options"], { someValue: true }, SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "provider"], "provider", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "size"], 1024, SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: "/dev/null",
          external: {
            size: 1024,
            name: "null",
            provider: "provider",
            options: {
              someValue: true
            }
          },
          mode: "RW"
        }
      ]);
    });

    it("should remove the right local volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 1, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "size"], 1024, SET));
      batch = batch.add(new Transaction(["volumes", 0, "mode"], "READ", SET));
      batch = batch.add(
        new Transaction(["volumes", 1, "containerPath"], "/dev/one", SET)
      );
      batch = batch.add(new Transaction(["volumes", 1, "size"], 512, SET));
      batch = batch.add(new Transaction(["volumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: "/dev/one",
          persistent: {
            size: 512
          },
          mode: "RW"
        }
      ]);
    });

    it("should remove the right external volume", function() {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "EXTERNAL", SET)
      );
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 1, "type"], "EXTERNAL", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "name"], "null", SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "options"], { someValue: true }, SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "provider"], "provider", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 1, "containerPath"], "/dev/one", SET)
      );
      batch = batch.add(new Transaction(["volumes", 1, "name"], "one", SET));
      batch = batch.add(new Transaction(["volumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
        {
          containerPath: "/dev/one",
          external: {
            name: "one",
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray"
            }
          },
          mode: "RW"
        }
      ]);
    });

    it("should contain a mixed combination of volumes", function() {
      let batch = new Batch();

      // Add the first external Volume
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "EXTERNAL"));
      batch = batch.add(
        new Transaction(["volumes", 0, "containerPath"], "/dev/null", SET)
      );
      batch = batch.add(new Transaction(["volumes", 0, "name"], "null", SET));
      batch = batch.add(
        new Transaction(["volumes", 0, "options"], { someValue: true }, SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 0, "provider"], "provider", SET)
      );
      // Add the first local Volume
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 1, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 1, "containerPath"], "/dev/null", SET)
      );
      batch = batch.add(new Transaction(["volumes", 1, "size"], 1024, SET));
      batch = batch.add(new Transaction(["volumes", 1, "mode"], "READ", SET));
      // Add the second external Volume
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 2, "type"], "EXTERNAL"));
      batch = batch.add(
        new Transaction(["volumes", 2, "containerPath"], "/dev/one", SET)
      );
      batch = batch.add(new Transaction(["volumes", 2, "name"], "one", SET));
      // Add the second local Volume
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 3, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(
        new Transaction(["volumes", 3, "containerPath"], "/dev/one", SET)
      );
      batch = batch.add(new Transaction(["volumes", 3, "size"], 512, SET));

      expect(batch.reduce(Volumes.JSONReducer.bind({}), [])).toEqual([
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
        },
        {
          containerPath: "/dev/null",
          persistent: {
            size: 1024
          },
          mode: "READ"
        },
        {
          containerPath: "/dev/one",
          external: {
            name: "one",
            provider: "dvdi",
            options: {
              "dvdi/driver": "rexray"
            }
          },
          mode: "RW"
        },
        {
          containerPath: "/dev/one",
          persistent: {
            size: 512
          },
          mode: "RW"
        }
      ]);
    });
  });
  describe("Volumes", function() {
    describe("#JSONParser", function() {
      it("should return an empty array", function() {
        expect(Volumes.JSONParser({})).toEqual([]);
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
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "RW"
            },
            path: ["volumes"]
          },
          { type: SET, value: "PERSISTENT", path: ["volumes", 0, "type"] },
          { type: SET, value: 1024, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"]
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] }
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
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "READ"
            },
            path: ["volumes"]
          },
          { type: SET, value: "PERSISTENT", path: ["volumes", 0, "type"] },
          { type: SET, value: 1024, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"]
          },
          { type: SET, value: "READ", path: ["volumes", 0, "mode"] }
        ]);
      });
    });
  });
  describe("External Volumes", function() {
    describe("#JSONParser", function() {
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
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
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
            path: ["volumes"]
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          {
            type: SET,
            value: {
              "dvdi/driver": "rexray"
            },
            path: ["volumes", 0, "options"]
          },
          { type: SET, value: "dvdi", path: ["volumes", 0, "provider"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"]
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] }
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
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            },
            path: ["volumes"]
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          {
            type: SET,
            value: {
              "dvdi/driver": "rexray"
            },
            path: ["volumes", 0, "options"]
          },
          {
            type: SET,
            value: "provider",
            path: ["volumes", 0, "provider"]
          },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"]
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] }
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
        expect(Volumes.JSONParser(state)).toEqual([
          {
            type: ADD_ITEM,
            value: {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  someValue: true
                }
              },
              mode: "RW"
            },
            path: ["volumes"]
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          {
            type: SET,
            value: {
              someValue: true
            },
            path: ["volumes", 0, "options"]
          },
          {
            type: SET,
            value: "provider",
            path: ["volumes", 0, "provider"]
          },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"]
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] }
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
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            },
            path: ["volumes"]
          },
          { type: SET, value: "EXTERNAL", path: ["volumes", 0, "type"] },
          { type: SET, value: "null", path: ["volumes", 0, "name"] },
          { type: SET, value: 1024, path: ["volumes", 0, "size"] },
          {
            type: SET,
            value: {
              "dvdi/driver": "rexray"
            },
            path: ["volumes", 0, "options"]
          },
          { type: SET, value: "dvdi", path: ["volumes", 0, "provider"] },
          {
            type: SET,
            value: "/dev/null",
            path: ["volumes", 0, "containerPath"]
          },
          { type: SET, value: "RW", path: ["volumes", 0, "mode"] }
        ]);
      });
    });
  });
});
