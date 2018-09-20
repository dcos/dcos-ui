import React from "react";
import { mount } from "enzyme";

const JestUtil = require("#SRC/js/utils/JestUtil");

const PodInstancesTable = require("../PodInstancesTable");
const Pod = require("../../../structs/Pod");
const Util = require("#SRC/js/utils/Util");

const PodFixture = require("../../../../../../../tests/_fixtures/pods/PodFixture");

let thisInstance;

describe("PodInstancesTable", function() {
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
  fixture.instances[2].lastUpdated = new Date(
    Date.now() - 86400000 * 13
  ).toString();
  fixture.instances[2].lastChanged = new Date(
    Date.now() - 86400000 * 14
  ).toString();
  fixture.instances[2].containers[0].lastUpdated = new Date(
    Date.now() - 86400000 * 15
  ).toString();
  fixture.instances[2].containers[0].lastChanged = new Date(
    Date.now() - 86400000 * 16
  ).toString();
  fixture.instances[2].containers[1].lastUpdated = new Date(
    Date.now() - 86400000 * 17
  ).toString();
  fixture.instances[2].containers[1].lastChanged = new Date(
    Date.now() - 86400000 * 18
  ).toString();

  const pod = new Pod(fixture);

  describe("#render", function() {
    beforeEach(function() {
      JestUtil.mockTimezone("Europe/Berlin");
    });

    afterEach(function() {
      JestUtil.unmockTimezone();
    });

    describe("collapsed table", function() {
      beforeEach(function() {
        thisInstance = mount(
          <PodInstancesTable
            pod={pod}
            instances={pod.getInstanceList().getItems()}
          />
        );
      });

      it("renders the name column", function() {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["instance-1", "instance-2", "instance-3"]);
      });

      it("renders the address column", function() {
        const names = thisInstance
          .find(
            ".task-table-column-host-address .collapsing-string-full-string"
          )
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["agent-1", "agent-2", "agent-3"]);
      });

      it("renders the region column", function() {
        const regions = thisInstance
          .find("td.task-table-column-region")
          .map(function(el) {
            return el.text();
          });

        expect(regions).toEqual(["N/A", "N/A", "N/A"]);
      });

      it("renders the zone column", function() {
        const zones = thisInstance
          .find("td.task-table-column-zone")
          .map(function(el) {
            return el.text();
          });

        expect(zones).toEqual(["N/A", "N/A", "N/A"]);
      });

      it("renders the status column", function() {
        const names = thisInstance
          .find(".task-table-column-status .status-text")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["Running", "Running", "Staging"]);
      });

      it("renders the cpu column", function() {
        const names = thisInstance
          .find("td.task-table-column-cpus")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["1", "1", "1"]);
      });

      it("renders the mem column", function() {
        const names = thisInstance
          .find("td.task-table-column-mem")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["128 MiB", "128 MiB", "128 MiB"]);
      });

      it("renders the updated column", function() {
        const names = thisInstance
          .find("td.task-table-column-updated")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["a day ago", "7 days ago", "13 days ago"]);
      });

      it("renders the version column", function() {
        const names = thisInstance
          .find("td.task-table-column-version")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual([
          new Date(PodFixture.spec.version).toLocaleString(),
          new Date(PodFixture.spec.version).toLocaleString(),
          new Date(PodFixture.spec.version).toLocaleString()
        ]);
      });
    });

    describe("collapsed table, sorted ascending by name", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesTable,
          { pod },
          { instances: pod.getInstanceList().getItems() },
          { service: pod }
        );
        thisInstance = mount(component);

        // 1 click on the header (ascending)
        thisInstance
          .find(".task-table-column-primary")
          .at(0)
          .simulate("click");
      });

      it("sorts the name column", function() {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["instance-1", "instance-2", "instance-3"]);
      });
    });

    describe("collapsed table, sorted descending by name", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesTable,
          { pod },
          { instances: pod.getInstanceList().getItems() },
          { service: pod }
        );
        thisInstance = mount(component);

        // 2 clicks on the header (descending)
        const columnHeader = thisInstance
          .find(".task-table-column-primary")
          .at(0);
        columnHeader.simulate("click").simulate("click");
      });

      it("sorts the name column", function() {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual(["instance-3", "instance-2", "instance-1"]);
      });
    });

    describe("expanded table", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesTable,
          { pod },
          { instances: pod.getInstanceList().getItems() },
          { service: pod }
        );
        thisInstance = mount(component);

        // Expand all table rows by clicking on each one of them
        thisInstance
          .find(".task-table-column-primary .is-expandable")
          .forEach(function(el) {
            el.simulate("click");
          });
      });

      it("renders the name column", function() {
        const names = thisInstance
          .find(".task-table-column-primary .collapsing-string-full-string")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual([
          "instance-1",
          "container-1",
          "container-2",
          "instance-2",
          "container-1",
          "container-2",
          "instance-3",
          "container-1",
          "container-2"
        ]);
      });

      it("renders the address column", function() {
        const columns = thisInstance.find(".task-table-column-host-address");
        const agents = columns
          .find(".collapsing-string-full-string")
          .map(function(el) {
            return el.text();
          });
        const ports = columns
          .find("a")
          .filterWhere(function(el) {
            return !el.hasClass("table-cell-link-secondary");
          })
          .map(function(el) {
            return el.text();
          });

        expect(agents).toEqual(["agent-1", "agent-2", "agent-3"]);
        expect(ports).toEqual([
          "31001",
          "31002",
          "31011",
          "31012",
          "31021",
          "31022"
        ]);
      });

      it("renders the status column", function() {
        const names = thisInstance
          .find(".task-table-column-status .status-text")
          .map(function(el) {
            return el.text();
          });
        expect(names).toEqual([
          "Running",
          "Running",
          "Running",
          "Running",
          "Running",
          "Running",
          "Staging",
          "Staging",
          "Staging"
        ]);
      });

      it("renders the cpu column", function() {
        const names = thisInstance
          .find("td.task-table-column-cpus div.tooltip-wrapper > span")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual([
          "1",
          "0.5",
          "0.5",
          "1",
          "0.5",
          "0.5",
          "1",
          "0.5",
          "0.5"
        ]);
      });

      it("renders the mem column", function() {
        const names = thisInstance
          .find("td.task-table-column-mem div.tooltip-wrapper > span")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual([
          "128 MiB",
          "64 MiB",
          "64 MiB",
          "128 MiB",
          "64 MiB",
          "64 MiB",
          "128 MiB",
          "64 MiB",
          "64 MiB"
        ]);
      });

      it("renders the updated column", function() {
        const names = thisInstance
          .find("td.task-table-column-updated time")
          .map(function(el) {
            return el.text();
          });

        expect(names).toEqual([
          "a day ago",
          "3 days ago",
          "5 days ago",
          "7 days ago",
          "9 days ago",
          "11 days ago",
          "13 days ago",
          "15 days ago",
          "17 days ago"
        ]);
      });

      it("renders the version column", function() {
        const names = thisInstance
          .find("td.task-table-column-version")
          .map(function(el) {
            return el.text().trim();
          });

        expect(names).toEqual([
          new Date(PodFixture.spec.version).toLocaleString(),
          new Date(PodFixture.spec.version).toLocaleString(),
          new Date(PodFixture.spec.version).toLocaleString()
        ]);
      });
    });
  });
});
