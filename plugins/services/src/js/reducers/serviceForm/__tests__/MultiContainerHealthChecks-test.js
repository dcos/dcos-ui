import Transaction from "#SRC/js/structs/Transaction";

const Batch = require("#SRC/js/structs/Batch");
const {
  COMMAND,
  HTTP,
  HTTPS,
  TCP
} = require("../../../constants/HealthCheckProtocols");
const MultiContainerHealthChecks = require("../MultiContainerHealthChecks");
const MesosCommandTypes = require("../../../constants/MesosCommandTypes");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");

describe("MultiContainerHealthChecks", function() {
  describe("#JSONSegmentReducer", function() {
    describe("Generic", function() {
      it("does not alter state when batch is empty", function() {
        const batch = new Batch();

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({});
      });

      it("defines health checks on ADD_ITEM", function() {
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

      it("undefines health checks on REMOVE_ITEM", function() {
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

      it("defines `gracePeriodSeconds`", function() {
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

      it("defines `intervalSeconds`", function() {
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

      it("defines `maxConsecutiveFailures`", function() {
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

      it("defines `timeoutSeconds`", function() {
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

      it("defines `delaySeconds`", function() {
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
      it("populates default string commands", function() {
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

      it("populates argv when the last command transaction sets type accordingly", function() {
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

      it("populates argv when first command transaction sets type accordingly", function() {
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
      it("populates http endpoint", function() {
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

      it("populates http path", function() {
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

      it("populates http scheme on https", function() {
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

      it("populates http scheme on http", function() {
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
      it("populates tcp endpoint", function() {
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
      it("switches from TCP to COMMAND", function() {
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

      it("switches from HTTP to COMMAND", function() {
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

      it("switches from COMMAND to HTTP", function() {
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

      it("switches from COMMAND to TCP", function() {
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
    it("includes `protocol` field", function() {
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

    it("includes `exec.command.type` field", function() {
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

    it("includes `exec.command.string` field", function() {
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

    it("includes `http.https` field", function() {
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
    it("populates `http` transactions", function() {
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

    it("populates `tcp` transactions", function() {
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

    it("populates `exec` (shell) transactions", function() {
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

    it("populates `exec` (argv) transactions", function() {
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
