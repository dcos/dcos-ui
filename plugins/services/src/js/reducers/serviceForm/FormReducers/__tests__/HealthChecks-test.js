const { ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const HealthChecks = require("../HealthChecks");

describe("HealthChecks", function() {
  describe("#FormReducer", function() {
    it("should return an Array", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));

      expect(batch.reduce(HealthChecks.FormReducer.bind({}), [])).toEqual([{}]);
    });

    it("should set the protocol", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
        batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
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
