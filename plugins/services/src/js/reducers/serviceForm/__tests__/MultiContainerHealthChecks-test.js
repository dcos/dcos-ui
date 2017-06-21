const Batch = require("../../../../../../../src/js/structs/Batch");
const {
  COMMAND,
  HTTP,
  HTTPS,
  TCP
} = require("../../../constants/HealthCheckProtocols");
const MultiContainerHealthChecks = require("../MultiContainerHealthChecks");
const MesosCommandTypes = require("../../../constants/MesosCommandTypes");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("MultiContainerHealthChecks", function() {
  describe("#JSONSegmentReducer", function() {
    describe("Generic", function() {
      it("Should not alter state when batch is empty", function() {
        const batch = new Batch();

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({});
      });

      it("Should define health checks on ADD_ITEM", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null, ADD_ITEM));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({});
      });

      it("Should undefine health checks on REMOVE_ITEM", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null, REMOVE_ITEM));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual(null);
      });

      it("Should define `gracePeriodSeconds`", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(["gracePeriodSeconds"], 1));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          gracePeriodSeconds: 1
        });
      });

      it("Should define `intervalSeconds`", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(["intervalSeconds"], 1));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          intervalSeconds: 1
        });
      });

      it("Should define `maxConsecutiveFailures`", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(["maxConsecutiveFailures"], 1));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          maxConsecutiveFailures: 1
        });
      });

      it("Should define `timeoutSeconds`", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(["timeoutSeconds"], 1));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          timeoutSeconds: 1
        });
      });

      it("Should define `delaySeconds`", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], null));
        batch = batch.add(new Transaction(["delaySeconds"], 1));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          delaySeconds: 1
        });
      });
    });

    describe("COMMAND", function() {
      it("Should populate default string commands", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          exec: {
            command: {
              shell: "test"
            }
          }
        });
      });

      it("Should populate argv when type=ARGV on commands", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );
        batch = batch.add(
          new Transaction(["exec", "command", "type"], MesosCommandTypes.ARGV)
        );

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          exec: {
            command: {
              argv: ["test"]
            }
          }
        });
      });

      it("The order of type=ARGV should not matter on commands", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "type"], MesosCommandTypes.ARGV)
        );
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          exec: {
            command: {
              argv: ["test"]
            }
          }
        });
      });
    });

    describe("HTTP", function() {
      it("Should populate http endpoint", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], HTTP));
        batch = batch.add(new Transaction(["http", "endpoint"], "test"));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          http: {
            endpoint: "test",
            scheme: "HTTP"
          }
        });
      });

      it("Should populate http path", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], HTTP));
        batch = batch.add(new Transaction(["http", "path"], "test"));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          http: {
            path: "test",
            scheme: "HTTP"
          }
        });
      });

      it("Should populate http scheme on https", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], HTTP));
        batch = batch.add(new Transaction(["http", "https"], true));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          http: {
            scheme: HTTPS
          }
        });
      });

      it("Should populate http scheme on http", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], HTTP));
        batch = batch.add(new Transaction(["http", "https"], false));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          http: {
            scheme: HTTP
          }
        });
      });
    });

    describe("TCP", function() {
      it("Should populate tcp endpoint", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], TCP));
        batch = batch.add(new Transaction(["tcp", "endpoint"], "test"));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          tcp: {
            endpoint: "test"
          }
        });
      });
    });

    describe("Protocol Switching", function() {
      it("Should switch from TCP to COMMAND", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], TCP));
        batch = batch.add(new Transaction(["tcp", "endpoint"], "test"));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          exec: {
            command: {
              shell: "test"
            }
          }
        });
      });

      it("Should switch from HTTP to COMMAND", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], HTTP));
        batch = batch.add(new Transaction(["http", "endpoint"], "test"));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          exec: {
            command: {
              shell: "test"
            }
          }
        });
      });

      it("Should switch from COMMAND to HTTP", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );
        batch = batch.add(new Transaction(["protocol"], HTTP));
        batch = batch.add(new Transaction(["http", "endpoint"], "test"));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          http: {
            endpoint: "test",
            scheme: "HTTP"
          }
        });
      });

      it("Should switch from COMMAND to TCP", function() {
        let batch = new Batch();
        batch = batch.add(new Transaction([], {}));
        batch = batch.add(new Transaction(["protocol"], COMMAND));
        batch = batch.add(
          new Transaction(["exec", "command", "value"], "test")
        );
        batch = batch.add(new Transaction(["protocol"], TCP));
        batch = batch.add(new Transaction(["tcp", "endpoint"], "test"));

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({
          tcp: {
            endpoint: "test"
          }
        });
      });
    });
  });

  describe("#FormReducer", function() {
    it("Should include `protocol` field", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(["protocol"], COMMAND));

      const state = {};
      expect(
        batch.reduce(MultiContainerHealthChecks.FormReducer.bind({}), state)
      ).toEqual({
        protocol: COMMAND,
        exec: {
          command: {}
        }
      });
    });

    it("Should include `exec.command.type` field", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(["protocol"], COMMAND));
      batch = batch.add(
        new Transaction(["exec", "command", "type"], MesosCommandTypes.ARGV)
      );

      const state = {};
      expect(
        batch.reduce(MultiContainerHealthChecks.FormReducer.bind({}), state)
      ).toEqual({
        protocol: COMMAND,
        exec: {
          command: {
            argv: [],
            type: MesosCommandTypes.ARGV
          }
        }
      });
    });

    it("Should include `exec.command.string` field", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(["protocol"], COMMAND));
      batch = batch.add(new Transaction(["exec", "command", "value"], "test"));

      const state = {};
      expect(
        batch.reduce(MultiContainerHealthChecks.FormReducer.bind({}), state)
      ).toEqual({
        protocol: COMMAND,
        exec: {
          command: {
            shell: "test",
            value: "test"
          }
        }
      });
    });

    it("Should include `http.https` field", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction([], {}));
      batch = batch.add(new Transaction(["protocol"], HTTP));
      batch = batch.add(new Transaction(["http", "https"], true));

      const state = {};
      expect(
        batch.reduce(MultiContainerHealthChecks.FormReducer.bind({}), state)
      ).toEqual({
        protocol: HTTP,
        http: {
          scheme: HTTPS,
          https: true
        }
      });
    });
  });

  describe("#JSONSegmentParser", function() {
    it("Should correctly populate `http` transactions", function() {
      const healthCheck = {
        http: {
          endpoint: "foo",
          path: "/bar",
          scheme: "HTTPS"
        }
      };
      const transactions = [
        { type: ADD_ITEM, value: null, path: [] },
        { type: SET, value: HTTP, path: ["protocol"] },
        { type: SET, value: "foo", path: ["http", "endpoint"] },
        { type: SET, value: "/bar", path: ["http", "path"] },
        { type: SET, value: true, path: ["http", "https"] }
      ];

      expect(
        MultiContainerHealthChecks.JSONSegmentParser(healthCheck, [])
      ).toEqual(transactions);
    });

    it("Should correctly populate `tcp` transactions", function() {
      const healthCheck = {
        tcp: {
          endpoint: "foo"
        }
      };
      const transactions = [
        { type: ADD_ITEM, value: null, path: [] },
        { type: SET, value: TCP, path: ["protocol"] },
        { type: SET, value: "foo", path: ["tcp", "endpoint"] }
      ];

      expect(
        MultiContainerHealthChecks.JSONSegmentParser(healthCheck, [])
      ).toEqual(transactions);
    });

    it("Should correctly populate `exec` (shell) transactions", function() {
      const healthCheck = {
        exec: {
          command: {
            shell: "test"
          }
        }
      };
      const transactions = [
        { type: ADD_ITEM, value: null, path: [] },
        { type: SET, value: COMMAND, path: ["protocol"] },
        {
          type: SET,
          value: MesosCommandTypes.SHELL,
          path: ["exec", "command", "type"]
        },
        { type: SET, value: "test", path: ["exec", "command", "value"] }
      ];

      expect(
        MultiContainerHealthChecks.JSONSegmentParser(healthCheck, [])
      ).toEqual(transactions);
    });

    it("Should correctly populate `exec` (argv) transactions", function() {
      const healthCheck = {
        exec: {
          command: {
            argv: ["test"]
          }
        }
      };
      const transactions = [
        { type: ADD_ITEM, value: null, path: [] },
        { type: SET, value: COMMAND, path: ["protocol"] },
        {
          type: SET,
          value: MesosCommandTypes.ARGV,
          path: ["exec", "command", "type"]
        },
        { type: SET, value: "test", path: ["exec", "command", "value"] }
      ];

      expect(
        MultiContainerHealthChecks.JSONSegmentParser(healthCheck, [])
      ).toEqual(transactions);
    });
  });
});
