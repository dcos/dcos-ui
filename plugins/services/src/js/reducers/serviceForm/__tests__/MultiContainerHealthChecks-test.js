import Transaction from "#SRC/js/structs/Transaction";

import Batch from "#SRC/js/structs/Batch";
import MesosCommandTypes from "../../../constants/MesosCommandTypes";

const {
  COMMAND,
  HTTP,
  HTTPS,
  TCP
} = require("../../../constants/HealthCheckProtocols");
const MultiContainerHealthChecks = require("../MultiContainerHealthChecks");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");

describe("MultiContainerHealthChecks", () => {
  describe("#JSONSegmentReducer", () => {
    describe("Generic", () => {
      it("does not alter state when batch is empty", () => {
        const batch = new Batch();

        const state = {};
        expect(
          batch.reduce(
            MultiContainerHealthChecks.JSONSegmentReducer.bind({}),
            state
          )
        ).toEqual({});
      });

      it("defines health checks on ADD_ITEM", () => {
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

      it("undefines health checks on REMOVE_ITEM", () => {
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

      it("defines `gracePeriodSeconds`", () => {
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

      it("defines `intervalSeconds`", () => {
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

      it("defines `maxConsecutiveFailures`", () => {
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

      it("defines `timeoutSeconds`", () => {
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

      it("defines `delaySeconds`", () => {
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

    describe("COMMAND", () => {
      it("populates default string commands", () => {
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

      it("populates argv when the last command transaction sets type accordingly", () => {
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

      it("populates argv when first command transaction sets type accordingly", () => {
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

    describe("HTTP", () => {
      it("populates http endpoint", () => {
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

      it("populates http path", () => {
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

      it("populates http scheme on https", () => {
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

      it("populates http scheme on http", () => {
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

    describe("TCP", () => {
      it("populates tcp endpoint", () => {
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

    describe("Protocol Switching", () => {
      it("switches from TCP to COMMAND", () => {
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

      it("switches from HTTP to COMMAND", () => {
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

      it("switches from COMMAND to HTTP", () => {
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

      it("switches from COMMAND to TCP", () => {
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

  describe("#FormReducer", () => {
    it("includes `protocol` field", () => {
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

    it("includes `exec.command.type` field", () => {
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

    it("includes `exec.command.string` field", () => {
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

    it("includes `http.https` field", () => {
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

  describe("#JSONSegmentParser", () => {
    it("populates `http` transactions", () => {
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

    it("populates `tcp` transactions", () => {
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

    it("populates `exec` (shell) transactions", () => {
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

    it("populates `exec` (argv) transactions", () => {
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
