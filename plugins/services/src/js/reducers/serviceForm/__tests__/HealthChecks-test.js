const HealthChecks = require("../HealthChecks");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Labels", function() {
  describe("#JSONReducer", function() {
    it("should return an Array", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([{}]);
    });

    it("should set the protocol", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([
        {
          protocol: "COMMAND"
        }
      ]);
    });

    it("should set the right Command", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "command"], "sleep 1000;")
      );

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([
        {
          protocol: "COMMAND",
          command: {
            value: "sleep 1000;"
          }
        }
      ]);
    });

    it("should set the right path", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([
        {
          protocol: "MESOS_HTTP",
          path: "/test"
        }
      ]);
    });

    it("should have a fully fledged health check object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "gracePeriodSeconds"], 1)
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "intervalSeconds"], 2)
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "timeoutSeconds"], 3)
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "maxConsecutiveFailures"], 4)
      );

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([
        {
          protocol: "MESOS_HTTPS",
          path: "/test",
          gracePeriodSeconds: 1,
          intervalSeconds: 2,
          timeoutSeconds: 3,
          maxConsecutiveFailures: 4
        }
      ]);
    });

    it("should remove the right item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "path"], "sleep 1000;")
      );
      batch = batch.add(
        new Transaction(["healthChecks", 1, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 1, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks"], 0, REMOVE_ITEM));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([
        {
          protocol: "MESOS_HTTP",
          path: "/test"
        }
      ]);
    });

    it(
      "should have a fully fledged health check object with unknown" +
        " protocol",
      function() {
        let batch = new Batch();
        batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
        batch = batch.add(
          new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTPS")
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "path"], "/test")
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "gracePeriodSeconds"], 1)
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "intervalSeconds"], 2)
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "timeoutSeconds"], 3)
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "maxConsecutiveFailures"], 4)
        );

        expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([
          {
            protocol: "MESOS_HTTPS",
            path: "/test",
            gracePeriodSeconds: 1,
            intervalSeconds: 2,
            timeoutSeconds: 3,
            maxConsecutiveFailures: 4
          }
        ]);
      }
    );
  });

  describe("#JSONParser", function() {
    it("should pass unknown protocol", function() {
      expect(
        HealthChecks.JSONParser({
          healthChecks: [
            {
              path: "/api/health",
              portIndex: 0,
              protocol: "MESOS_HTTP",
              gracePeriodSeconds: 300,
              intervalSeconds: 60,
              timeoutSeconds: 20,
              maxConsecutiveFailures: 3
            }
          ]
        })
      ).toEqual([
        {
          type: ADD_ITEM,
          value: 0,
          path: ["healthChecks"]
        },
        {
          type: SET,
          value: "MESOS_HTTP",
          path: ["healthChecks", 0, "protocol"]
        },
        {
          type: SET,
          value: "/api/health",
          path: ["healthChecks", 0, "path"]
        },
        {
          type: SET,
          value: 0,
          path: ["healthChecks", 0, "portIndex"]
        },
        {
          type: SET,
          value: 300,
          path: ["healthChecks", 0, "gracePeriodSeconds"]
        },
        {
          type: SET,
          value: 60,
          path: ["healthChecks", 0, "intervalSeconds"]
        },
        {
          type: SET,
          value: 20,
          path: ["healthChecks", 0, "timeoutSeconds"]
        },
        {
          type: SET,
          value: 3,
          path: ["healthChecks", 0, "maxConsecutiveFailures"]
        }
      ]);
    });
  });

  describe("#FormReducer", function() {
    it("should return an Array", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([{}]);
    });

    it("should set the protocol", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
        {
          protocol: "COMMAND"
        }
      ]);
    });

    it("should set the right Command", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "command"], "sleep 1000;")
      );

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
        {
          protocol: "COMMAND",
          command: "sleep 1000;"
        }
      ]);
    });

    it("should set the right path", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTP",
          path: "/test"
        }
      ]);
    });

    it("should have a fully fledged health check object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "gracePeriodSeconds"], 1)
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "intervalSeconds"], 2)
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "timeoutSeconds"], 3)
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "maxConsecutiveFailures"], 4)
      );

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTPS",
          path: "/test",
          gracePeriodSeconds: 1,
          intervalSeconds: 2,
          timeoutSeconds: 3,
          maxConsecutiveFailures: 4
        }
      ]);
    });

    it(
      "should have a fully fledged health check object with unknown" +
        " protocol",
      function() {
        let batch = new Batch();
        batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
        batch = batch.add(
          new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "path"], "/api/health")
        );
        batch = batch.add(new Transaction(["healthChecks", 0, "portIndex"], 0));
        batch = batch.add(
          new Transaction(["healthChecks", 0, "gracePeriodSeconds"], 300)
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "intervalSeconds"], 60)
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "timeoutSeconds"], 20)
        );
        batch = batch.add(
          new Transaction(["healthChecks", 0, "maxConsecutiveFailures"], 3)
        );

        expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
          {
            path: "/api/health",
            portIndex: 0,
            protocol: "MESOS_HTTP",
            gracePeriodSeconds: 300,
            intervalSeconds: 60,
            timeoutSeconds: 20,
            maxConsecutiveFailures: 3
          }
        ]);
      }
    );

    it("should keep https after switching protocol back to HTTP", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTPS"
        }
      ]);
    });

    it("should set protocol to http if https was set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "COMMAND")
      );
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], false));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTP"
        }
      ]);
    });
  });
});
