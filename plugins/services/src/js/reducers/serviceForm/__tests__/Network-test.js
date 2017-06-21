const Network = require("../Network");
const {
  SET
} = require("../../../../../../../src/js/constants/TransactionTypes");

describe("Network", function() {
  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(Network.JSONParser({})).toEqual([]);
    });

    it("defaults networkType to USER when only networkName is defined", function() {
      const state = {
        ipAddress: {
          networkName: "dcos"
        }
      };
      expect(Network.JSONParser(state)).toEqual([
        {
          type: SET,
          value: "USER.dcos",
          path: ["container", "docker", "network"]
        }
      ]);
    });

    it("sets BRIDGE networkType", function() {
      const state = {
        container: {
          docker: {
            network: "BRIDGE"
          }
        }
      };
      expect(Network.JSONParser(state)).toEqual([
        { type: SET, value: "BRIDGE", path: ["container", "docker", "network"] }
      ]);
    });

    it("sets HOST networkType", function() {
      const state = {
        container: {
          docker: {
            network: "HOST"
          }
        }
      };
      expect(Network.JSONParser(state)).toEqual([
        { type: SET, value: "HOST", path: ["container", "docker", "network"] }
      ]);
    });

    it("sets USER networkType with optional fields", function() {
      const state = {
        container: {
          docker: {
            network: "USER"
          }
        },
        ipAddress: {
          networkName: "dcos",
          groups: ["group1"],
          labels: {
            label1: "label1 value"
          },
          discovery: {
            ports: [{ number: 80, name: "http", protocol: "tcp" }]
          }
        }
      };
      expect(Network.JSONParser(state)).toEqual([
        {
          type: SET,
          value: "USER.dcos",
          path: ["container", "docker", "network"]
        },
        { type: SET, value: ["group1"], path: ["ipAddress", "groups"] },
        {
          type: SET,
          value: { label1: "label1 value" },
          path: ["ipAddress", "labels"]
        },
        {
          type: SET,
          value: {
            ports: [{ number: 80, name: "http", protocol: "tcp" }]
          },
          path: ["ipAddress", "discovery"]
        }
      ]);
    });
  });
});
