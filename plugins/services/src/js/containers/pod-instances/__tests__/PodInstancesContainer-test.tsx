import * as React from "react";
import { mount } from "enzyme";

import JestUtil from "#SRC/js/utils/JestUtil";

import PodInstancesContainer from "../PodInstancesContainer";
import Pod from "../../../structs/Pod";

import PodFixture from "../../../../../../../tests/_fixtures/pods/PodFixture";

const Util = require("#SRC/js/utils/Util").default;
const MesosStateStore = require("#SRC/js/stores/MesosStateStore").default;

let thisStoreChangeListener, thisInstance;

describe("PodInstancesContainer", () => {
  // Fix the dates in order to test the relative date field
  const fixture = Util.deepCopy(PodFixture);
  fixture.instances[0].lastUpdated = new Date(
    Date.now() - 86400000 * 1
  ).toString();
  fixture.instances[0].lastChanged = new Date(
    Date.now() - 86400000 * 2
  ).toString();
  fixture.instances[0].containers[0].lastUpdated = new Date(
    Date.now() - 86400000 * 3
  ).toString();
  fixture.instances[0].containers[0].lastChanged = new Date(
    Date.now() - 86400000 * 4
  ).toString();
  fixture.instances[0].containers[1].lastUpdated = new Date(
    Date.now() - 86400000 * 5
  ).toString();
  fixture.instances[0].containers[1].lastChanged = new Date(
    Date.now() - 86400000 * 6
  ).toString();
  fixture.instances[1].lastUpdated = new Date(
    Date.now() - 86400000 * 7
  ).toString();
  fixture.instances[1].lastChanged = new Date(
    Date.now() - 86400000 * 8
  ).toString();
  fixture.instances[1].containers[0].lastUpdated = new Date(
    Date.now() - 86400000 * 9
  ).toString();
  fixture.instances[1].containers[0].lastChanged = new Date(
    Date.now() - 86400000 * 10
  ).toString();
  fixture.instances[1].containers[1].lastUpdated = new Date(
    Date.now() - 86400000 * 11
  ).toString();
  fixture.instances[1].containers[1].lastChanged = new Date(
    Date.now() - 86400000 * 12
  ).toString();

  const pod = new Pod(fixture);

  beforeEach(() => {
    thisStoreChangeListener = MesosStateStore.addChangeListener;
    MesosStateStore.addChangeListener = () => {};
  });

  afterEach(() => {
    MesosStateStore.addChangeListener = thisStoreChangeListener;
  });

  describe("#render", () => {
    describe("search with instance name", () => {
      beforeEach(() => {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const WrappedComponent = JestUtil.withI18nProvider(
          JestUtil.stubRouterContext(PodInstancesContainer)
        );
        thisInstance = mount(
          <WrappedComponent
            pod={pod}
            location={{ pathname: "", query: { q: "instance-1" } }}
          />
        );
      });

      it("returns matching instances", () => {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(el => el.text());

        expect(names).toEqual(["instance-1"]);
      });
    });

    describe("search with container name", () => {
      beforeEach(() => {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const WrappedComponent = JestUtil.withI18nProvider(
          JestUtil.stubRouterContext(PodInstancesContainer)
        );
        thisInstance = mount(
          <WrappedComponent
            pod={pod}
            location={{ pathname: "", query: { q: "container-1 is:active" } }}
            service={pod}
          />
        );
      });

      it("returns matching instances and containers", () => {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(el => el.text());

        // The table is expanded and the containers are filtered, therefore
        // we should see 1 Header + 1 Child for every instance.
        //
        // (Note that the default filter is to show only `Active`, so the
        //  staged instance should not be shown on the search results)
        //
        expect(names).toEqual([
          "instance-1",
          "container-1",
          "instance-2",
          "container-1"
        ]);
      });

      it("always shows instance total resources", () => {
        const mem = thisInstance
          .find("td.task-table-column-mem span")
          .map(el => el.text());

        expect(mem).toEqual(["128 MiB", "64 MiB", "128 MiB", "64 MiB"]);
      });
    });

    describe("show all", () => {
      beforeEach(() => {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const WrappedComponent = JestUtil.withI18nProvider(
          JestUtil.stubRouterContext(PodInstancesContainer)
        );
        thisInstance = mount(
          <WrappedComponent
            pod={pod}
            location={{ pathname: "", query: { q: "is%3Aactive%2Ccompleted" } }}
            service={pod}
          />
        );
      });

      it("shows all instances", () => {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(el => el.text());

        expect(names).toEqual(["instance-1", "instance-2", "instance-3"]);
      });
    });

    describe("show completed", () => {
      beforeEach(() => {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const WrappedComponent = JestUtil.withI18nProvider(
          JestUtil.stubRouterContext(PodInstancesContainer)
        );
        thisInstance = mount(
          <WrappedComponent
            pod={pod}
            location={{ pathname: "", query: { q: "is:completed" } }}
            service={pod}
          />
        );
      });

      it("shows no instances", () => {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(el => el.text());

        expect(names).toEqual([]);
      });
    });
  });
});
