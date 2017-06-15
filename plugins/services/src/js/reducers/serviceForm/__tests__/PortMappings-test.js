const PortMappings = require("../PortMappings");
const {
  ADD_ITEM
} = require("../../../../../../../src/js/constants/TransactionTypes");
const Transaction = require("../../../../../../../src/js/structs/Transaction");
const {
  type: { BRIDGE }
} = require("../../../../../../../src/js/constants/Networking");
const { type: { DOCKER } } = require("../../../constants/ContainerConstants");

describe("#JSONParser", function() {
  describe("PortMappings", function() {
    it("should add portDefinition with details", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  name: "foo",
                  hostPort: 0,
                  containerPort: 80,
                  protocol: "tcp"
                }
              ]
            }
          }
        })
      ).toEqual([
        new Transaction(["portDefinitions"], 0, ADD_ITEM),
        new Transaction(["portDefinitions", 0, "name"], "foo"),
        new Transaction(["portDefinitions", 0, "automaticPort"], true),
        new Transaction(["portDefinitions", 0, "portMapping"], true),
        new Transaction(["portDefinitions", 0, "containerPort"], 80),
        new Transaction(["portDefinitions", 0, "protocol", "udp"], false),
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], true)
      ]);
    });

    it("shouldn't add existing, but update details", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  name: "foo",
                  hostPort: 0,
                  containerPort: 80,
                  protocol: "tcp"
                }
              ]
            }
          },
          portDefinitions: [
            {
              name: "foo",
              port: 0,
              protocol: "tcp"
            }
          ]
        })
      ).toEqual([
        new Transaction(["portDefinitions", 0, "name"], "foo"),
        new Transaction(["portDefinitions", 0, "automaticPort"], true),
        new Transaction(["portDefinitions", 0, "portMapping"], true),
        new Transaction(["portDefinitions", 0, "containerPort"], 80),
        new Transaction(["portDefinitions", 0, "protocol", "udp"], false),
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], true)
      ]);
    });

    it("should add Transaction for automaticPort and hostPort", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  hostPort: 10
                }
              ]
            }
          }
        })
      ).toEqual([
        new Transaction(["portDefinitions"], 0, ADD_ITEM),
        new Transaction(["portDefinitions", 0, "automaticPort"], false),
        new Transaction(["portDefinitions", 0, "portMapping"], true),
        new Transaction(["portDefinitions", 0, "hostPort"], 10)
      ]);
    });

    it("should add Transaction for loadBalanced ports", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  labels: {
                    VIP_0: "/:0"
                  }
                }
              ]
            }
          }
        })
      ).toEqual([
        new Transaction(["portDefinitions"], 0, ADD_ITEM),
        new Transaction(["portDefinitions", 0, "portMapping"], false),
        new Transaction(["portDefinitions", 0, "loadBalanced"], true),
        new Transaction(["portDefinitions", 0, "vip"], "/:0"),
        new Transaction(["portDefinitions", 0, "vipPort"], "0"),
        new Transaction(["portDefinitions", 0, "labels"], { VIP_0: "/:0" })
      ]);
    });

    it("shouldn't add loadBalanced for wrong label", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  labels: {
                    VIP_1: "/:0"
                  }
                }
              ]
            }
          }
        })
      ).toEqual([
        new Transaction(["portDefinitions"], 0, ADD_ITEM),
        new Transaction(["portDefinitions", 0, "portMapping"], false),
        new Transaction(["portDefinitions", 0, "labels"], { VIP_1: "/:0" })
      ]);
    });

    it("should add Transaction for protocol", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  protocol: "udp"
                }
              ]
            }
          }
        })
      ).toEqual([
        new Transaction(["portDefinitions"], 0, ADD_ITEM),
        new Transaction(["portDefinitions", 0, "portMapping"], false),
        new Transaction(["portDefinitions", 0, "protocol", "udp"], true),
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], false)
      ]);
    });

    it("should merge info from portMappings and portDefinitions", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  name: "foo",
                  hostPort: 0,
                  containerPort: 80,
                  protocol: "tcp"
                },
                {
                  name: "bar",
                  hostPort: 10,
                  containerPort: 81,
                  protocol: "tcp",
                  labels: {
                    VIP_1: "/:0"
                  }
                }
              ]
            }
          },
          portDefinitions: [
            {
              name: "foo",
              port: 0,
              protocol: "tcp"
            }
          ]
        })
      ).toEqual([
        new Transaction(["portDefinitions"], 1, ADD_ITEM),
        new Transaction(["portDefinitions", 0, "name"], "foo"),
        new Transaction(["portDefinitions", 0, "automaticPort"], true),
        new Transaction(["portDefinitions", 0, "portMapping"], true),
        new Transaction(["portDefinitions", 0, "containerPort"], 80),
        new Transaction(["portDefinitions", 0, "protocol", "udp"], false),
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], true),
        new Transaction(["portDefinitions", 1, "name"], "bar"),
        new Transaction(["portDefinitions", 1, "automaticPort"], false),
        new Transaction(["portDefinitions", 1, "portMapping"], true),
        new Transaction(["portDefinitions", 1, "hostPort"], 10),
        new Transaction(["portDefinitions", 1, "containerPort"], 81),
        new Transaction(["portDefinitions", 1, "protocol", "udp"], false),
        new Transaction(["portDefinitions", 1, "protocol", "tcp"], true),
        new Transaction(["portDefinitions", 1, "loadBalanced"], true),
        new Transaction(["portDefinitions", 1, "vip"], "/:0"),
        new Transaction(["portDefinitions", 1, "vipPort"], "0"),
        new Transaction(["portDefinitions", 1, "labels"], { VIP_1: "/:0" })
      ]);
    });

    it("should not add more from portMappings when less than portDefinitions", function() {
      expect(
        PortMappings.JSONParser({
          type: DOCKER,
          container: {
            docker: {
              network: BRIDGE,
              portMappings: [
                {
                  name: "foo",
                  hostPort: 0,
                  containerPort: 80,
                  protocol: "tcp"
                }
              ]
            }
          },
          portDefinitions: [
            {
              name: "foo",
              port: 0,
              protocol: "tcp"
            },
            {
              name: "bar",
              port: 10,
              protocol: "tcp",
              labels: {
                VIP_1: "/:0"
              }
            }
          ]
        })
      ).toEqual([
        new Transaction(["portDefinitions", 0, "name"], "foo"),
        new Transaction(["portDefinitions", 0, "automaticPort"], true),
        new Transaction(["portDefinitions", 0, "portMapping"], true),
        new Transaction(["portDefinitions", 0, "containerPort"], 80),
        new Transaction(["portDefinitions", 0, "protocol", "udp"], false),
        new Transaction(["portDefinitions", 0, "protocol", "tcp"], true)
      ]);
    });
  });
});
