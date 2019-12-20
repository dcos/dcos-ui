import * as React from "react";
import { mount } from "enzyme";

import JestUtil from "#SRC/js/utils/JestUtil";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import Service from "#PLUGINS/services/src/js/structs/Service";

import ServicesContainer from "../ServicesContainer";

jest.mock("#SRC/js/stores/DCOSStore");
jest.mock("#SRC/js/stores/MesosStateStore");

const MesosStateStore = require("#SRC/js/stores/MesosStateStore").default;

let thisStoreChangeListener, thisRouterStubs, thisWrapper, thisInstance;

describe("ServicesContainer", () => {
  beforeEach(() => {
    thisStoreChangeListener = MesosStateStore.addChangeListener;
    MesosStateStore.addChangeListener = () => {};

    thisRouterStubs = { push: jasmine.createSpy() };
    const WrappedComponent = JestUtil.stubRouterContext(
      ServicesContainer,
      thisRouterStubs
    );

    thisWrapper = mount(
      <WrappedComponent
        location={{ query: {}, pathname: "/test" }}
        params={{}}
      />
    );
    thisInstance = thisWrapper.find(ServicesContainer);
  });

  afterEach(() => {
    MesosStateStore.addChangeListener = thisStoreChangeListener;
  });

  describe("#getCorrectedModalProps", () => {
    const storeService = new Service({ id: "/test" });
    beforeEach(() => {
      DCOSStore.serviceTree = {
        findItemById() {
          return storeService;
        }
      };
    });

    it("returns modalProps from state with updated service information for given existing service (state)", () => {
      const modalProps = thisInstance
        .instance()
        .getCorrectedModalProps({ service: storeService }, undefined);
      expect(modalProps).toEqual({ service: storeService });
    });

    it("returns modalProps from argument with updated service information for given existing service (argument)", () => {
      const modalProps = thisInstance
        .instance()
        .getCorrectedModalProps({ service: undefined }, storeService);
      expect(modalProps).toEqual({ service: storeService });
    });

    it("returns modalProps from state with updated service information for given existing service (both)", () => {
      const modalProps = thisInstance
        .instance()
        .getCorrectedModalProps(
          { service: storeService },
          new Service({ id: "/test2" })
        );
      expect(modalProps).toEqual({ service: storeService });
    });

    // the following two tests are the ones which broke the modals before.
    // the important part is, that `service` is never undefined
    // (because DCOSStore returns nothing) while a modal is (still)
    // open.
    // if service is "unknown", we have to fill in "something" in `service`
    // and delete the `id` node. this will close the modal.

    it("returns empty modalProps if no service is given but id is set", () => {
      DCOSStore.serviceTree = {
        findItemById() {
          return undefined;
        }
      };
      const modalProps = thisInstance
        .instance()
        .getCorrectedModalProps(
          { id: "delete", service: undefined },
          undefined
        );
      expect(modalProps).toEqual({});
    });

    it("returns modalProps without id for already deleted service", () => {
      DCOSStore.serviceTree = {
        findItemById() {
          return undefined;
        }
      };
      const modalProps = thisInstance
        .instance()
        .getCorrectedModalProps(
          { id: "delete", service: new Service({ id: "/deleted" }) },
          undefined
        );
      expect(modalProps).toEqual({ service: new Service({ id: "/deleted" }) });
    });
  });
});
