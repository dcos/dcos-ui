const PortDefinitions = require("../PortDefinitions");
const Batch = require("../../../../../../../src/js/structs/Batch");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  ADD_ITEM,
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");
const {
  type: { BRIDGE, HOST, USER }
} = require("../../../../../../../src/js/constants/Networking");

describe("PortDefinitions", function() {
  describe("#JSONReducer", function() {
    it("should return normal config if networkType is  HOST", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null }
      ]);
    });

    it("Should return null if networkType is not HOST", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container.docker.network"], BRIDGE));
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual(
        null
      );
    });

    it("Should return null if networkType is not USER", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container.docker.network"], USER));
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual(
        null
      );
    });

    it("should create default portDefinition configurations", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null }
      ]);
    });

    it("should create default portDefinition configurations for BRIDGE network", function() {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["container", "docker", "network"], BRIDGE, SET)
      );
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual(
        null
      );
    });

    it("shouldn't create portDefinitions for USER", function() {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["container", "docker", "network"], USER, SET)
      );
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual(
        null
      );
    });

    it("should create two default portDefinition configurations", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null },
        { name: null, port: 0, protocol: "tcp", labels: null }
      ]);
    });

    it("should set the name value", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions", 0, "name"], "foo"));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: "foo", port: 0, protocol: "tcp", labels: null }
      ]);
    });

    it("should set the port value", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portsAutoAssign"], false));
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "hostPort"], 100)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 100, protocol: "tcp", labels: null }
      ]);
    });

    it("should default port value to 0 if portsAutoAssign", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portsAutoAssign"], true));
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "hostPort"], 100)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null }
      ]);
    });

    it("should set the protocol value", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], false)
      );
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "protocol", "udp"], true)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "udp", labels: null }
      ]);
    });

    it("should set the complex protocol value", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "protocol", "udp"], true)
      );
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], true)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "udp,tcp", labels: null }
      ]);
    });

    it("should add the labels key if the portDefinition is load balanced", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions"], 1, ADD_ITEM));
      batch = batch.add(
        new Transaction(["portDefinitions", 1, "loadBalanced"], true)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null },
        { name: null, port: 0, protocol: "tcp", labels: { VIP_1: ":null" } }
      ]);
    });

    it("should add the index of the portDefinition to the VIP keys", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions"], 1, ADD_ITEM));
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "loadBalanced"], true)
      );
      batch = batch.add(
        new Transaction(["portDefinitions", 1, "loadBalanced"], true)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: { VIP_0: ":null" } },
        { name: null, port: 0, protocol: "tcp", labels: { VIP_1: ":null" } }
      ]);
    });

    it("should add the port to the VIP string", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["portsAutoAssign"], false));
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "hostPort"], 300)
      );
      batch = batch.add(
        new Transaction(["portDefinitions", 0, "loadBalanced"], true)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 300, protocol: "tcp", labels: { VIP_0: ":300" } },
        { name: null, port: 0, protocol: "tcp", labels: null }
      ]);
    });

    it("should add the app ID to the VIP string when it is defined", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["portsAutoAssign"], false));
      batch = batch.add(
        new Transaction(["portDefinitions", 1, "loadBalanced"], true)
      );
      batch = batch.add(new Transaction(["id"], "foo"));

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null },
        { name: null, port: 0, protocol: "tcp", labels: { VIP_1: "foo:null" } }
      ]);
    });

    it("should store portDefinitions even if network is USER when recorded", function() {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["container", "docker", "network"], USER, SET)
      );
      batch = batch.add(new Transaction(["portDefinitions"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["portDefinitions"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["portsAutoAssign"], false));
      batch = batch.add(
        new Transaction(["portDefinitions", 1, "loadBalanced"], true)
      );
      batch = batch.add(new Transaction(["id"], "foo"));
      batch = batch.add(
        new Transaction(["container", "docker", "network"], HOST, SET)
      );

      expect(batch.reduce(PortDefinitions.JSONReducer.bind({}), {})).toEqual([
        { name: null, port: 0, protocol: "tcp", labels: null },
        { name: null, port: 0, protocol: "tcp", labels: { VIP_1: "foo:null" } }
      ]);
    });
  });

  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(PortDefinitions.JSONParser({})).toEqual([]);
    });
  });
});
