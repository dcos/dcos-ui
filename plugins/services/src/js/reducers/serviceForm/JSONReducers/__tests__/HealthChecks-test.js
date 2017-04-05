const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const HealthChecks = require("../HealthChecks");

describe("HealthChecks", function() {
  describe("#JSONReducer", function() {
    it("should return an Array", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([{}]);
    });

    it("should set the protocol", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
        batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
          value: {
            path: "/api/health",
            portIndex: 0,
            protocol: "MESOS_HTTP",
            gracePeriodSeconds: 300,
            intervalSeconds: 60,
            timeoutSeconds: 20,
            maxConsecutiveFailures: 3
          },
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
});
