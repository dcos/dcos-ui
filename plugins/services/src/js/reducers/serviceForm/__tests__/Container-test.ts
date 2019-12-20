import Transaction from "#SRC/js/structs/Transaction";

import Networking from "#SRC/js/constants/Networking";
import Batch from "#SRC/js/structs/Batch";

const {
  ADD_ITEM,
  SET,
  REMOVE_ITEM
} = require("#SRC/js/constants/TransactionTypes");

const { BRIDGE, HOST, CONTAINER } = Networking.type;

const Container = require("../Container");

describe("Container", () => {
  describe("#JSONReducer", () => {
    it("returns a null container as default object without docker object", () => {
      const batch = new Batch();

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: null,
        volumes: []
      });
    });

    it("switches container name along with type", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: null,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("creates new container info when there is nothing", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: null,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("keeps top-level container info with type switch", () => {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );
      batch = batch.add(new Transaction(["container", "type"], "MESOS", SET));

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: null,
          privileged: null
        },
        portMappings: null,
        type: "MESOS",
        volumes: []
      });
    });

    it("sets privileged correctly", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "privileged"], true, SET)
      );
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          privileged: true,
          forcePullImage: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("sets privileged correctly to false", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );
      batch = batch.add(
        new Transaction(["container", "docker", "privileged"], false, SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          privileged: false,
          forcePullImage: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("doesn't set privileged if path doesn't match type", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );
      batch = batch.add(
        new Transaction(["container", "foo", "privileged"], true, SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: null,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("sets forcePullImage correctly", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );
      batch = batch.add(
        new Transaction(["container", "docker", "forcePullImage"], true, SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: true,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("sets forcePullImage correctly to false", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "forcePullImage"], false, SET)
      );
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: false,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("doesn't set forcePullImage if path doesn't match type", () => {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["container", "foo", "forcePullImage"], true, SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: null,
        volumes: []
      });
    });

    it("does not remove forcePullImage when runtime is changed", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "forcePullImage"], true, SET)
      );
      batch = batch.add(new Transaction(["container", "type"], "MESOS", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          forcePullImage: true,
          image: "foo",
          privileged: null
        },
        portMappings: null,
        type: "MESOS",
        volumes: []
      });
    });

    it("remembers forcePullImage from earlier setting", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "forcePullImage"], true, SET)
      );
      batch = batch.add(new Transaction(["container", "type"], "MESOS", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          forcePullImage: true,
          image: "foo",
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("sets image correctly", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "foo", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "foo",
          forcePullImage: null,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("changes image value correctly", () => {
      let batch = new Batch();
      batch = batch.add(new Transaction(["container", "type"], "DOCKER", SET));
      batch = batch.add(
        new Transaction(["container", "docker", "image"], "bar", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        docker: {
          image: "bar",
          forcePullImage: null,
          privileged: null
        },
        portMappings: null,
        type: "DOCKER",
        volumes: []
      });
    });

    it("doesn't set image if path doesn't match type", () => {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(["container", "foo", "image"], "foo", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: null,
        volumes: []
      });
    });

    describe("PortMappings", () => {
      it("creates default portDefinition configurations", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("doesn't include hostPort or protocol when not enabled", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        // This is default
        // batch = batch.add(
        //   new Transaction(['portDefinitions', 0, 'portMapping'], false)
        // );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "protocol", "udp"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "hostPort"], 100)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: null,
              labels: null,
              name: null,
              protocol: null,
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("includes hostPort or protocol when not enabled for BRIDGE", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], BRIDGE, SET)
        );
        // This is default
        // batch = batch.add(
        //   new Transaction(['portDefinitions',0,'portMapping'], false)
        // );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "protocol", "tcp"], false)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "protocol", "udp"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "automaticPort"], false)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "hostPort"], 100)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 100,
              labels: null,
              name: null,
              protocol: "udp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("creates default portDefinition configurations", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], BRIDGE, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("doesn't create portMappings by default", () => {
        let batch = new Batch();
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          portMappings: null,
          type: null,
          volumes: []
        });
      });

      it("doesn't create portMappings for HOST", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(new Transaction(["networks", 0, "mode"], HOST, SET));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: null,
          type: "DOCKER",
          volumes: []
        });
      });

      it("creates two default portDefinition configurations", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "portMapping"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            },
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("sets the name value", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "name"], "foo")
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: "foo",
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("sets the port value", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "automaticPort"], false)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "hostPort"], 100)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 100,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("defaults port value to 0 if automaticPort", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        // This is default behavior
        // batch = batch.add(
        //  new Transaction(['portDefinitions', 0, 'automaticPort'], true)
        // );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "hostPort"], 100)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("sets the protocol value", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "protocol", "tcp"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "protocol", "udp"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "udp,tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("adds the labels key if the portDefinition is load balanced", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "loadBalanced"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            },
            {
              containerPort: 0,
              hostPort: 0,
              labels: { VIP_1: ":0" },
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("adds the index of the portDefinition to the VIP keys", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "loadBalanced"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "loadBalanced"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              name: null,
              protocol: "tcp",
              labels: { VIP_0: ":0" },
              servicePort: null
            },
            {
              containerPort: 0,
              hostPort: 0,
              name: null,
              protocol: "tcp",
              labels: { VIP_1: ":0" },
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("adds the port to the VIP string", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "automaticPort"], false)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "hostPort"], 300)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "containerPort"], 8080)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "loadBalanced"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 8080,
              hostPort: 300,
              name: null,
              protocol: "tcp",
              labels: { VIP_0: ":8080" },
              servicePort: null
            },
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("adds the app ID to the VIP string when it is defined", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "automaticPort"], false)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "loadBalanced"], true)
        );
        batch = batch.add(new Transaction(["id"], "foo"));

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            },
            {
              containerPort: 0,
              hostPort: 0,
              name: null,
              protocol: "tcp",
              labels: { VIP_1: "foo:0" },
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("stores portDefinitions even if network is HOST when recorded", () => {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(["container", "type"], "DOCKER", SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "portMapping"], true)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "automaticPort"], false)
        );
        batch = batch.add(
          new Transaction(["portDefinitions", 1, "loadBalanced"], true)
        );
        batch = batch.add(new Transaction(["id"], "foo"));
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          docker: {
            forcePullImage: null,
            image: "",
            privileged: null
          },
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            },
            {
              containerPort: 0,
              hostPort: 0,
              name: null,
              protocol: "tcp",
              labels: { VIP_1: "foo:0" },
              servicePort: null
            }
          ],
          type: "DOCKER",
          volumes: []
        });
      });

      it("creates portMappings when container.type is MESOS", () => {
        let batch = new Batch();
        batch = batch.add(new Transaction(["container", "type"], "MESOS", SET));
        batch = batch.add(
          new Transaction(["networks", 0, "mode"], CONTAINER, SET)
        );
        batch = batch.add(new Transaction(["portDefinitions"], null, ADD_ITEM));
        batch = batch.add(
          new Transaction(["portDefinitions", 0, "portMapping"], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              labels: null,
              name: null,
              protocol: "tcp",
              servicePort: null
            }
          ],
          type: "MESOS",
          volumes: []
        });
      });

      describe("UCR - BRDIGE", () => {
        it("creates portMappings when container.type is MESOS", () => {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(["container", "type"], "MESOS", SET)
          );
          batch = batch.add(
            new Transaction(["networks", 0, "mode"], BRIDGE, SET)
          );
          batch = batch.add(
            new Transaction(["portDefinitions"], null, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(["portDefinitions", 0, "portMapping"], true)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
            portMappings: [
              {
                containerPort: 0,
                hostPort: 0,
                labels: null,
                name: null,
                protocol: "tcp",
                servicePort: null
              }
            ],
            type: "MESOS",
            volumes: []
          });
        });

        it("includes hostPort or protocol when not enabled for BRIDGE", () => {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(["container", "type"], "MESOS", SET)
          );
          batch = batch.add(
            new Transaction(["networks", 0, "mode"], BRIDGE, SET)
          );
          // This is default
          // batch = batch.add(
          //   new Transaction(['portDefinitions',0,'portMapping'], false)
          // );
          batch = batch.add(
            new Transaction(["portDefinitions"], null, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(["portDefinitions", 0, "protocol", "tcp"], false)
          );
          batch = batch.add(
            new Transaction(["portDefinitions", 0, "protocol", "udp"], true)
          );
          batch = batch.add(
            new Transaction(["portDefinitions", 0, "automaticPort"], false)
          );
          batch = batch.add(
            new Transaction(["portDefinitions", 0, "hostPort"], 100)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
            portMappings: [
              {
                containerPort: 0,
                hostPort: 100,
                labels: null,
                name: null,
                protocol: "udp",
                servicePort: null
              }
            ],
            type: "MESOS",
            volumes: []
          });
        });

        it("creates default portDefinition configurations", () => {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(["container", "type"], "MESOS", SET)
          );
          batch = batch.add(
            new Transaction(["networks", 0, "mode"], BRIDGE, SET)
          );
          batch = batch.add(
            new Transaction(["portDefinitions"], null, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(["portDefinitions", 0, "portMapping"], true)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
            portMappings: [
              {
                containerPort: 0,
                hostPort: 0,
                labels: null,
                name: null,
                protocol: "tcp",
                servicePort: null
              }
            ],
            type: "MESOS",
            volumes: []
          });
        });
      });
    });

    it("removes docker if no image is present", () => {
      let batch = Container.JSONParser({
        container: {
          docker: {
            image: "nginx",
            pullConfig: {
              some: "value"
            }
          }
        }
      }).reduce((batch, transaction) => batch.add(transaction), new Batch());

      batch = batch.add(
        new Transaction(["container", "docker", "image"], "", SET)
      );

      expect(
        batch.reduce(Container.JSONReducer.bind({}), {
          docker: {
            image: "alpine",
            forcePull: true
          },
          type: "DOCKER"
        })
      ).toEqual({
        type: "MESOS",
        portMappings: null,
        volumes: []
      });
    });
  });

  describe("#Unknown Values", () => {
    it("keep docker unknown values", () => {
      expect(
        Container.JSONParser({
          container: {
            docker: {
              image: "nginx",
              pullConfig: {
                some: "value"
              }
            }
          }
        })
          .reduce((batch, transaction) => batch.add(transaction), new Batch())
          .reduce(Container.JSONReducer.bind({}), {})
      ).toEqual({
        portMappings: null,
        docker: {
          image: "nginx",
          forcePullImage: null,
          privileged: null,
          pullConfig: {
            some: "value"
          }
        },
        type: "MESOS",
        volumes: []
      });
    });

    it("keeps unknown container values", () => {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(
          ["container"],
          {
            type: "MESOS",
            linuxInfo: { ipcInfo: { mode: "PRIVATE", shmSize: 128 } }
          },
          SET
        )
      );
      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        type: "MESOS",
        linuxInfo: { ipcInfo: { mode: "PRIVATE", shmSize: 128 } }
      });
    });
  });

  describe("Volumes", () => {
    it("returns an empty array if no volumes are set", () => {
      const batch = new Batch();

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: null,
        volumes: []
      });
    });

    it("returns a local volume", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: "MESOS",
        volumes: [
          {
            containerPath: null,
            persistent: {
              size: null
            },
            mode: "RW"
          }
        ]
      });
    });

    it("returns an external volume", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(new Transaction(["volumes", 0, "type"], "EXTERNAL"));

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: "MESOS",
        volumes: [
          {
            containerPath: null,
            external: {
              name: null,
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              }
            },
            mode: "RW"
          }
        ]
      });
    });

    it("returns a local and an external volume", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 1, "type"], "EXTERNAL", SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: "MESOS",
        volumes: [
          {
            containerPath: null,
            persistent: {
              size: null
            },
            mode: "RW"
          },
          {
            containerPath: null,
            external: {
              name: null,
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              }
            },
            mode: "RW"
          }
        ]
      });
    });

    it("returns an empty array if all volumes have been removed", () => {
      let batch = new Batch();

      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 0, "type"], "PERSISTENT", SET)
      );
      batch = batch.add(new Transaction(["volumes"], null, ADD_ITEM));
      batch = batch.add(
        new Transaction(["volumes", 1, "type"], "EXTERNAL", SET)
      );
      batch = batch.add(new Transaction(["volumes"], 0, REMOVE_ITEM));
      batch = batch.add(new Transaction(["volumes"], 0, REMOVE_ITEM));

      expect(batch.reduce(Container.JSONReducer.bind({}), {})).toEqual({
        portMappings: null,
        type: null,
        volumes: []
      });
    });
  });
});
