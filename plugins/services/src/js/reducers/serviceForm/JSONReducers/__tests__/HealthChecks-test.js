import Transaction from "#SRC/js/structs/Transaction";

const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const HealthChecks = require("../HealthChecks");

describe("HealthChecks", function() {
  describe("#JSONReducer", function() {
    it("returns an Array", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), {})).toEqual([{}]);
    });

    it("sets the protocol", function() {
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

    it("sets the right Command", function() {
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

    it("sets the right path", function() {
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

    it("has a fully fledged health check object", function() {
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

    it("removes the right item", function() {
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

    it("has a fully fledged health check object with unknown protocol", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTPS")
      );
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
    it("sets ipProtocol to IPv6 if set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER"));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "alpine")
      );
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], true));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTP",
          ipProtocol: "IPv6",
          path: "/test"
        }
      ]);
    });

    it("sets https ipProtocol to IPv6 if set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER"));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "alpine")
      );
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], true));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTPS",
          ipProtocol: "IPv6",
          path: "/test"
        }
      ]);
    });

    it("sets http ipProtocol to IPv6 if docker set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER"));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "alpine")
      );
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], true));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTP",
          ipProtocol: "IPv6",
          path: "/test"
        }
      ]);
    });

    it("sets IPv4", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER"));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "alpine")
      );
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], true));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], false));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTP",
          path: "/test",
          ipProtocol: "IPv4"
        }
      ]);
    });

    it("sets https ipProtocol to IPv6 if docker set", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER"));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "alpine")
      );
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], true));
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTPS",
          ipProtocol: "IPv6",
          path: "/test"
        }
      ]);
    });

    it("does not set ipProtocol to IPv6 if mesos is set (UCR)", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER"));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "alpine")
      );
      batch = batch.add(new Transaction(["healthChecks"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["healthChecks", 0, "protocol"], "MESOS_HTTP")
      );
      batch = batch.add(new Transaction(["healthChecks", 0, "path"], "/test"));
      batch = batch.add(new Transaction(["healthChecks", 0, "isIPv6"], true));
      batch = batch.add(new Transaction(["healthChecks", 0, "https"], true));
      batch = batch.add(new Transaction(["container", "type"], "MESOS"));

      expect(batch.reduce(HealthChecks.JSONReducer.bind({}), [])).toEqual([
        {
          protocol: "MESOS_HTTPS",
          path: "/test"
        }
      ]);
    });
  });

  describe("#JSONParser", function() {
    it("passes unknown protocol", function() {
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
