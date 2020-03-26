import Transaction from "#SRC/js/structs/Transaction";
import Batch from "#SRC/js/structs/Batch";

import * as Containers from "../Containers";
import { ADD_ITEM, SET, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import { DEFAULT_POD_CONTAINER } from "../../../../constants/DefaultPod";

describe("Containers", () => {
  describe("#JSONReducer", () => {
    it("passes through state as default", () => {
      const batch = new Batch();

      expect(batch.reduce(Containers.JSONReducer.bind({}), [])).toEqual([]);
    });

    it("returns an array as default with a container path Transaction", () => {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["containers"], DEFAULT_POD_CONTAINER, ADD_ITEM)
      );

      expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
        DEFAULT_POD_CONTAINER,
      ]);
    });

    describe("container with image", () => {
      it("contains a container with image", () => {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["containers", 0, "image", "id"], "alpine", SET)
        );

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            image: {
              kind: "DOCKER",
              id: "alpine",
            },
            resources: {
              cpus: 0.1,
              mem: 128,
            },
          },
        ]);
      });

      it("doesn't contain the image object", () => {
        let batch = new Batch();

        batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["containers", 0, "image", "id"], "alpine", SET)
        );

        // This is here to ensure that both image id changes are in the batch.
        batch = batch.add(
          new Transaction(["containers", 0, "resources", "cpus"], 0.2, SET)
        );

        batch = batch.add(
          new Transaction(["containers", 0, "image", "id"], "", SET)
        );

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: {
              cpus: 0.2,
              disk: "",
              mem: 128,
            },
          },
        ]);
      });

      it("creates a complete image object", () => {
        const batch = [
          new Transaction(
            ["containers"],
            {
              image: {
                id: "nginx",
                kind: "DOCKER",
                pullConfig: {
                  some: "value",
                },
              },
            },
            ADD_ITEM
          ),
          new Transaction(
            ["containers", 0, "image"],
            {
              id: "nginx",
              kind: "DOCKER",
              pullConfig: {
                some: "value",
              },
            },
            SET
          ),
          new Transaction(["containers", 0, "image", "id"], "nginx", SET),
        ].reduce((b, transaction) => b.add(transaction), new Batch());

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: { cpus: 0.1, mem: 128 },
            image: {
              id: "nginx",
              kind: "DOCKER",
              pullConfig: {
                some: "value",
              },
            },
          },
        ]);
      });

      it("creates a complete image object without loosing unknown", () => {
        const batch = [
          new Transaction(
            ["containers"],
            {
              image: {
                id: "nginx",
                kind: "DOCKER",
                pullConfig: {
                  some: "value",
                },
              },
            },
            ADD_ITEM
          ),
          new Transaction(
            ["containers", 0, "image"],
            {
              id: "nginx",
              kind: "DOCKER",
              pullConfig: {
                some: "value",
              },
            },
            SET
          ),
          new Transaction(["containers", 0, "image", "id"], "", SET),
          new Transaction(
            ["containers", 0, "artifacts"],
            { uri: "http://mesosphere.io" },
            ADD_ITEM
          ),
          new Transaction(["containers", 0, "image", "id"], "nginx", SET),
        ].reduce((b, transaction) => b.add(transaction), new Batch());

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: { cpus: 0.1, mem: 128 },
            artifacts: [],
            image: {
              id: "nginx",
              kind: "DOCKER",
              pullConfig: {
                some: "value",
              },
            },
          },
        ]);
      });

      it("sets forcePull correctly for multiple containers", () => {
        const batch = [
          new Transaction(["containers"], {}, ADD_ITEM),
          new Transaction(["containers", 0, "image", "id"], "nginx", SET),
          new Transaction(["containers", 0, "image", "forcePull"], true, SET),
        ].reduce((b, transaction) => b.add(transaction), new Batch());

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: { cpus: 0.1, mem: 128 },
            image: {
              id: "nginx",
              kind: "DOCKER",
              forcePull: true,
            },
          },
        ]);
      });

      it("deletes the image object once id is set to empty and the forcePull to false", () => {
        const batch = [
          new Transaction(["containers"], {}, ADD_ITEM),
          new Transaction(["containers", 0, "image", "id"], "nginx", SET),
          new Transaction(["containers", 0, "image", "forcePull"], true, SET),
          new Transaction(["containers", 0, "image", "id"], "", SET),
          new Transaction(["containers", 0, "image", "forcePull"], false, SET),
        ].reduce((b, transaction) => b.add(transaction), new Batch());

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: { cpus: 0.1, mem: 128 },
          },
        ]);
      });

      it("removes image object if forcePull is set to true and id is set to empty", () => {
        const batch = [
          new Transaction(["containers"], {}, ADD_ITEM),
          new Transaction(["containers", 0, "image", "id"], "nginx", SET),
          new Transaction(["containers", 0, "image", "forcePull"], true, SET),
          new Transaction(["containers", 0, "image", "id"], "", SET),
        ].reduce((b, transaction) => b.add(transaction), new Batch());

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: { cpus: 0.1, mem: 128 },
          },
        ]);
      });
    });

    describe("container with arbitrary value", () => {
      it("contains a container with arbitrary field", () => {
        let batch = new Batch();

        batch = batch.add(
          new Transaction(["containers"], { someKey: "value" }, ADD_ITEM)
        );

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: { cpus: 0.1, mem: 128 },
            someKey: "value",
          },
        ]);
      });
    });

    describe("endpoints", () => {
      describe("Host Mode", () => {
        it("has one endpoint", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  hostPort: 0,
                  labels: null,
                  protocol: ["tcp"],
                },
              ],
            },
          ]);
        });

        it("removes the last endpoint", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], 0, REMOVE_ITEM)
          );

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: "foo",
                  networkNames: null,
                  hostPort: 0,
                  labels: null,
                  protocol: ["tcp"],
                },
              ],
            },
          ]);
        });

        it("keeps custom labels", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));
          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(["containers", 0, "endpoints", 0, "labels"], {
              custom: "label",
            })
          );

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  hostPort: 0,
                  labels: { custom: "label" },
                  protocol: ["tcp"],
                },
              ],
            },
          ]);
        });

        it("has one endpoint with name and a hostport", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));

          batch = batch.add(new Transaction(["networks", 0], "HOST"));

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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: "foo",
                  networkNames: null,
                  hostPort: 8080,
                  labels: null,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  hostPort: 0,
                  labels: null,
                  protocol: ["tcp", "udp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  hostPort: 0,
                  labels: null,
                  protocol: ["tcp", "foo"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  hostPort: 0,
                  containerPort: null,
                  labels: null,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: "foo",
                  networkNames: null,
                  containerPort: null,
                  labels: null,
                  hostPort: 0,
                  protocol: ["tcp"],
                },
              ],
            },
          ]);
        });

        it("keeps custom labels", () => {
          let batch = new Batch();

          batch = batch.add(new Transaction(["containers"], null, ADD_ITEM));
          batch = batch.add(new Transaction(["networks", 0], "CONTAINER.foo"));
          batch = batch.add(
            new Transaction(["containers", 0, "endpoints"], null, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(["containers", 0, "endpoints", 0, "labels"], {
              custom: "label",
            })
          );

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  hostPort: 0,
                  containerPort: null,
                  labels: { custom: "label" },
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: "foo",
                  networkNames: null,
                  containerPort: null,
                  labels: null,
                  hostPort: 8080,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: null,
                  labels: null,
                  hostPort: 0,
                  protocol: ["tcp", "udp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: null,
                  labels: null,
                  hostPort: 0,
                  protocol: ["tcp", "foo"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: 8080,
                  labels: null,
                  hostPort: 0,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: 8080,
                  labels: {
                    VIP_0: "/foobar:8080",
                  },
                  hostPort: 0,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: 8080,
                  labels: {
                    VIP_0: "1.3.3.7:8080",
                  },
                  hostPort: 0,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: 8080,
                  labels: {
                    VIP_0: "/barfoo:8080",
                  },
                  hostPort: 0,
                  protocol: ["tcp"],
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

          expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
              },
              endpoints: [
                {
                  name: null,
                  networkNames: null,
                  containerPort: 8080,
                  labels: {
                    VIP_0: "1.3.3.7:8080",
                  },
                  hostPort: 0,
                  protocol: ["tcp"],
                },
              ],
            },
          ]);
        });
      });
    });

    describe("artifacts", () => {
      it("omits artifacts with empty uris", () => {
        const batch = new Batch([
          new Transaction(["containers"], null, ADD_ITEM),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(
            ["containers", 0, "artifacts", 0, "uri"],
            "http://mesosphere.io",
            SET
          ),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(
            ["containers", 0, "artifacts", 2, "uri"],
            "http://mesosphere.com",
            SET
          ),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
        ]);

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            artifacts: [
              { uri: "http://mesosphere.io" },
              { uri: "http://mesosphere.com" },
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

    describe("volumes", () => {
      it("removes volumeMounts when there's no volumes left", () => {
        const batch = new Batch([
          new Transaction(["containers"], null, ADD_ITEM),
          new Transaction(["volumeMounts"], null, ADD_ITEM),
          new Transaction(["volumeMounts", 0, "name"], "extvol", SET),
          new Transaction(["volumeMounts", 0, "mountPath", 0], "mount", SET),
          new Transaction(["volumeMounts"], 0, REMOVE_ITEM),
        ]);

        expect(batch.reduce(Containers.JSONReducer.bind({}))).toEqual([
          {
            name: "container-1",
            resources: {
              cpus: 0.1,
              mem: 128,
            },
            volumeMounts: [],
          },
        ]);
      });
    });
  });

  describe("#JSONParser", () => {
    it("keeps random value", () => {
      expect(
        Containers.JSONParser({
          containers: [
            {
              Random: "value",
            },
          ],
        })
      ).toEqual([
        new Transaction(
          ["containers"],
          {
            Random: "value",
          },
          ADD_ITEM
        ),
      ]);
    });

    describe("endpoints", () => {
      describe("Container Mode", () => {
        it("parses VIP ports", () => {
          expect(
            Containers.JSONParser({
              networks: [
                {
                  mode: "container",
                },
              ],
              containers: [
                {
                  endpoints: [
                    {
                      labels: {
                        VIP_0: "/:900",
                      },
                    },
                  ],
                },
              ],
            })
          ).toEqual([
            new Transaction(
              ["containers"],
              {
                endpoints: [
                  {
                    labels: {
                      VIP_0: "/:900",
                    },
                  },
                ],
              },
              ADD_ITEM
            ),
            new Transaction(
              ["containers", 0, "endpoints"],
              {
                labels: { VIP_0: "/:900" },
              },
              ADD_ITEM
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "hostPort"],
              undefined,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "automaticPort"],
              false,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "servicePort"],
              false,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "name"],
              undefined,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "labels"],
              { VIP_0: "/:900" },
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "containerPort"],
              undefined,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "loadBalanced"],
              true,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "vipLabel"],
              "VIP_0",
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "vip"],
              "/:900",
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "vipPort"],
              "900",
              SET
            ),

            new Transaction(
              ["containers", 0, "endpoints", 0, "protocol", "udp"],
              false,
              SET
            ),
            new Transaction(
              ["containers", 0, "endpoints", 0, "protocol", "tcp"],
              false,
              SET
            ),
          ]);
        });

        describe("Host Mode", () => {
          it("parses VIP ports", () => {
            expect(
              Containers.JSONParser({
                networks: [
                  {
                    mode: "host",
                  },
                ],
                containers: [
                  {
                    endpoints: [
                      {
                        labels: {
                          VIP_0: "/:900",
                        },
                      },
                    ],
                  },
                ],
              })
            ).toEqual([
              new Transaction(
                ["containers"],
                {
                  endpoints: [
                    {
                      labels: {
                        VIP_0: "/:900",
                      },
                    },
                  ],
                },
                ADD_ITEM
              ),
              new Transaction(
                ["containers", 0, "endpoints"],
                {
                  labels: { VIP_0: "/:900" },
                },
                ADD_ITEM
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "hostPort"],
                undefined,
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "automaticPort"],
                false,
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "servicePort"],
                false,
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "name"],
                undefined,
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "labels"],
                { VIP_0: "/:900" },
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "loadBalanced"],
                true,
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "vipLabel"],
                "VIP_0",
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "vip"],
                "/:900",
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "vipPort"],
                "900",
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "protocol", "udp"],
                false,
                SET
              ),
              new Transaction(
                ["containers", 0, "endpoints", 0, "protocol", "tcp"],
                false,
                SET
              ),
            ]);
          });
        });
      });
    });

    describe("artifacts", () => {
      it("parses JSON correctly", () => {
        expect(
          Containers.JSONParser({
            containers: [
              {
                artifacts: [
                  { uri: "http://mesosphere.io" },
                  null,
                  { uri: "http://mesosphere.com" },
                ],
              },
            ],
          })
        ).toEqual([
          new Transaction(
            ["containers"],
            {
              artifacts: [
                { uri: "http://mesosphere.io" },
                null,
                { uri: "http://mesosphere.com" },
              ],
            },
            ADD_ITEM
          ),
          new Transaction(
            ["containers", 0, "artifacts"],
            { uri: "http://mesosphere.io" },
            ADD_ITEM
          ),
          new Transaction(
            ["containers", 0, "artifacts", 0, "uri"],
            "http://mesosphere.io",
            SET
          ),
          new Transaction(["containers", 0, "artifacts"], null, ADD_ITEM),
          new Transaction(
            ["containers", 0, "artifacts"],
            { uri: "http://mesosphere.com" },
            ADD_ITEM
          ),
          new Transaction(
            ["containers", 0, "artifacts", 2, "uri"],
            "http://mesosphere.com",
            SET
          ),
        ]);
      });
    });

    it("stores complete image object", () => {
      expect(
        Containers.JSONParser({
          containers: [
            {
              image: {
                id: "nginx",
                kind: "DOCKER",
                pullConfig: {
                  some: "value",
                },
              },
            },
          ],
        })
      ).toEqual([
        new Transaction(
          ["containers"],
          {
            image: {
              id: "nginx",
              kind: "DOCKER",
              pullConfig: {
                some: "value",
              },
            },
          },
          ADD_ITEM
        ),
        new Transaction(
          ["containers", 0, "image"],
          {
            id: "nginx",
            kind: "DOCKER",
            pullConfig: {
              some: "value",
            },
          },
          SET
        ),
        new Transaction(["containers", 0, "image", "id"], "nginx", SET),
      ]);
    });
  });
});
