const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const IpAddress = require("../IpAddress");

describe("IpAddress", function() {
  describe("#JSONReducer", function() {
    it("emits correct JSON", function() {
      const batch = new Batch([
        new Transaction(["networks", 0, "mode"], "USER.dcos")
      ]);

      expect(batch.reduce(IpAddress.JSONReducer.bind({}), {})).toEqual({
        discovery: {},
        groups: [],
        labels: {},
        networkName: "dcos"
      });
    });

    it("should have the right discovery value", function() {
      const batch = new Batch([
        new Transaction(["ipAddress", "discovery"], "STS-133"),
        new Transaction(["networks", 0, "mode"], "USER.dcos")
      ]);

      expect(batch.reduce(IpAddress.JSONReducer.bind({}), {})).toEqual({
        discovery: "STS-133",
        groups: [],
        labels: {},
        networkName: "dcos"
      });
    });

    it("should have the right groups value", function() {
      const batch = new Batch([
        new Transaction(["ipAddress", "groups"], "admins"),
        new Transaction(["networks", 0, "mode"], "USER.dcos")
      ]);

      expect(batch.reduce(IpAddress.JSONReducer.bind({}), {})).toEqual({
        discovery: {},
        groups: "admins",
        labels: {},
        networkName: "dcos"
      });
    });

    it("should have the right labels value", function() {
      const batch = new Batch([
        new Transaction(["ipAddress", "labels"], "no:labels"),
        new Transaction(["networks", 0, "mode"], "USER.dcos")
      ]);

      expect(batch.reduce(IpAddress.JSONReducer.bind({}), {})).toEqual({
        discovery: {},
        groups: [],
        labels: "no:labels",
        networkName: "dcos"
      });
    });
  });
});
