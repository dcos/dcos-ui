import Application from "#PLUGINS/services/src/js/structs/Application";
import Pod from "#PLUGINS/services/src/js/structs/Pod";
import renderer from "react-test-renderer";
import * as React from "react";

jest.mock("#SRC/js/stores/DCOSStore");
const DCOSStore = require("#SRC/js/stores/DCOSStore").default;
const TaskIpAddressesRow = require("../TaskIpAddressesRow").default;

describe("TaskIpAddressesRow", () => {
  describe("with an Application", () => {
    const serviceMock = new Application({
      tasks: [{ id: "foo", ipAddresses: [{ ipAddress: "127.0.0.1" }] }]
    });

    beforeEach(() => {
      DCOSStore.serviceTree = {
        getServiceFromTaskID() {
          return serviceMock;
        }
      };
    });

    it("renders IP Addresses", () => {
      const taskId = "foo";

      const thisInstance = renderer.create(
        <TaskIpAddressesRow taskId={taskId} />
      );

      const tree = thisInstance.toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe("with a Pod", () => {
    const serviceMock = new Pod({
      instances: [{ id: "foo.bar", networks: [{ addresses: ["0.0.0.0"] }] }]
    });

    beforeEach(() => {
      DCOSStore.serviceTree = {
        getServiceFromTaskID() {
          return serviceMock;
        }
      };
    });

    it("renders IP Addresses", () => {
      const taskId = "foo.bar.container-1";

      const thisInstance = renderer.create(
        <TaskIpAddressesRow taskId={taskId} />
      );

      const tree = thisInstance.toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
