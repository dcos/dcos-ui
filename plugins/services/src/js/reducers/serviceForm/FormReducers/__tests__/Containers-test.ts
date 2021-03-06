import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import { ADD_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import * as Containers from "../Containers";

describe("Containers", () => {
  describe("#FormReducer", () => {
    describe("endpoints", () => {
      describe("Host Mode", () => {
        it("has one endpoint", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("has one endpoint with name", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints", 0, "name"], "foo")
          );

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: "foo",
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("has one endpoint with name and a hostport", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: false,
                  hostPort: 8080,
                  labels: null,
                  name: "foo",
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("sets the protocol right", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: true,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("sets protocol to unknown value", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                    foo: true,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });
      });

      describe("container Mode", () => {
        it("has one endpoint", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("has one endpoint with name", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints", 0, "name"], "foo")
          );

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: "foo",
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("has one endpoint with name and a hostport", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: false,
                  hostPort: 8080,
                  labels: null,
                  name: "foo",
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("sets the protocol right", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: true,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("sets protocol to unknown value", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    foo: true,
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: null,
                },
              ],
            },
          ]);
        });

        it("sets the right container Port", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: false,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: 8080,
                },
              ],
            },
          ]);
        });

        it("sets the right vip", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: true,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: 8080,
                },
              ],
            },
          ]);
        });

        it("sets the right custom vip", () => {
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
            new Transaction(
              ["containers", 0, "endpoints", 0, "vip"],
              "1.3.3.7:8080"
            )
          );

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: true,
                  vip: "1.3.3.7:8080",
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: 8080,
                },
              ],
            },
          ]);
        });

        it("sets the right vip after id change", () => {
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

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: true,
                  vip: null,
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                  containerPort: 8080,
                },
              ],
            },
          ]);
        });

        it("sets the right custom vip even after id change", () => {
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
            new Transaction(
              ["containers", 0, "endpoints", 0, "vip"],
              "1.3.3.7:8080"
            )
          );

          batch = batch.add(new Transaction(["id"], "/barfoo"));

          expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  automaticPort: true,
                  hostPort: null,
                  labels: null,
                  name: null,
                  loadBalanced: true,
                  containerPort: 8080,
                  vip: "1.3.3.7:8080",
                  vipPort: null,
                  protocol: {
                    tcp: true,
                    udp: false,
                  },
                  servicePort: null,
                },
              ],
            },
          ]);
        });
      });
    });

    describe("artifacts", () => {
      it("emits correct form data", () => {
        const batch = new Batch([
          new Transaction(["containers"], null, ADD_ITEM),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(
            ["containers", 0, "artifacts", 0, "uri"],
            "http://mesosphere.io",
            SET
          ),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(
            ["containers", 0, "artifacts", 1, "uri"],
            "http://mesosphere.com",
            SET
          ),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
        ]);

        expect(batch.reduce(Containers.FormReducer.bind({}))).toEqual([
          {
            artifacts: [
              { uri: "http://mesosphere.io" },
              { uri: "http://mesosphere.com" },
              { uri: null },
              { uri: null },
            ],
            name: "container-1",
            resources: {
              cpus: 0.1,
              mem: 128,
            },
          },
        ]);
      });
    });
  });
});
