const { ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const Endpoints = require("../Endpoints");

describe("Endpoints", function() {
  describe("#JSONReducer", function() {
    describe("Host Mode", function() {
      it("has one endpoint", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("has one endpoint with name", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "name"], "foo")
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: "foo",
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("has one endpoint with name and a hostport", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "name"], "foo")
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "automaticPort"],
            false
          )
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "hostPort"], 8080)
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: false,
              hostPort: 8080,
              labels: null,
              name: "foo",
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("sets the protocol right", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "HOST"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "protocol", "udp"],
            true
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: true
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("sets protocol to unknown value", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "HOST"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "protocol", "foo"],
            true
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false,
                foo: true
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });
    });

    describe("container Mode", function() {
      it("has one endpoint", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("has one endpoint with name", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "name"], "foo")
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: "foo",
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("has one endpoint with name and a hostport", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "name"], "foo")
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "automaticPort"],
            false
          )
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "hostPort"], 8080)
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: false,
              hostPort: 8080,
              labels: null,
              name: "foo",
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("sets the protocol right", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "protocol", "udp"],
            true
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: true
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("sets protocol to unknown value", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "protocol", "foo"],
            true
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                foo: true,
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: null
            }
          ]
        ]);
      });

      it("sets the right container Port", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "containerPort"],
            "8080"
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: false,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: 8080
            }
          ]
        ]);
      });

      it("sets the right vip", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));
        batch = batch.add(new Transaction(["id"], "/foobar"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "containerPort"],
            "8080"
          )
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "loadBalanced"],
            true
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: true,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: 8080
            }
          ]
        ]);
      });

      it("sets the right custom vip", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));
        batch = batch.add(new Transaction(["id"], "/foobar"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "containerPort"],
            "8080"
          )
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "loadBalanced"],
            true
          )
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "vipLabel"], "vip0")
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "vip"],
            "1.3.3.7:8080"
          )
        );

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: true,
              vip: "1.3.3.7:8080",
              vipLabel: "vip0",
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: 8080
            }
          ]
        ]);
      });

      it("sets the right vip after id change", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));
        batch = batch.add(new Transaction(["id"], "/foobar"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "containerPort"],
            "8080"
          )
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "loadBalanced"],
            true
          )
        );

        batch = batch.add(new Transaction(["id"], "/barfoo"));

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: true,
              vip: null,
              vipLabel: null,
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null,
              containerPort: 8080
            }
          ]
        ]);
      });

      it("sets the right custom vip even after id change", function() {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

        batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));
        batch = batch.add(new Transaction(["id"], "/foobar"));

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "containerPort"],
            "8080"
          )
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "loadBalanced"],
            true
          )
        );

        batch = batch.add(
          new Transaction(["containers", 0, "endpoints", 0, "vipLabel"], "vip1")
        );

        batch = batch.add(
          new Transaction(
            ["containers", 0, "endpoints", 0, "vip"],
            "1.3.3.7:8080"
          )
        );

        batch = batch.add(new Transaction(["id"], "/barfoo"));

        expect(batch.reduce(Endpoints.JSONReducer.bind({}))).toEqual([
          [
            {
              automaticPort: true,
              hostPort: null,
              labels: null,
              name: null,
              networkNames: null,
              loadBalanced: true,
              containerPort: 8080,
              vip: "1.3.3.7:8080",
              vipLabel: "vip1",
              vipPort: null,
              protocol: {
                tcp: true,
                udp: false
              },
              servicePort: null
            }
          ]
        ]);
      });
    });
  });
});
