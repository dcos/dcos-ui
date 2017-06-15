jest.dontMock("../../../structs/Pod");
jest.dontMock("../../../structs/PodInstanceList");
jest.dontMock("../../../structs/PodInstance");
jest.dontMock("../../../structs/PodContainer");
jest.dontMock("../../../../../../../src/js/components/CheckboxTable");
jest.dontMock("../../../../../../../src/js/components/CollapsingString");
jest.dontMock("../../../../../../../src/js/components/ExpandingTable");
jest.dontMock("../../../../../../../src/js/components/TimeAgo");
jest.dontMock("../PodInstancesTable");
jest.dontMock("../../../../../../../tests/_fixtures/pods/PodFixture");

const JestUtil = require("../../../../../../../src/js/utils/JestUtil");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");

const PodInstancesTable = require("../PodInstancesTable");
const Pod = require("../../../structs/Pod");
const Util = require("../../../../../../../src/js/utils/Util");

const PodFixture = require("../../../../../../../tests/_fixtures/pods/PodFixture");

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
        this.instance = TestUtils.renderIntoDocument(
          <PodInstancesTable pod={pod} />
        );
      });

      it("should properly render the name column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

        expect(names).toEqual(["instance-1", "instance-2", "instance-3"]);
      });

      it("should properly render the address column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-host-address"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

        expect(names).toEqual(["agent-1", "agent-2", "agent-3"]);
      });

      it("should properly render the status column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-status"
        ).reduce(JestUtil.reduceTextContentOfSelector(".status-text"), []);

        expect(names).toEqual(["Running", "Running", "Staging"]);
      });

      it("should properly render the cpu column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-cpus"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .map(JestUtil.mapTextContent);

        expect(names).toEqual(["1", "1", "1"]);
      });

      it("should properly render the mem column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-mem"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .map(JestUtil.mapTextContent);

        expect(names).toEqual(["128 MiB", "128 MiB", "128 MiB"]);
      });

      it("should properly render the updated column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-updated"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .map(JestUtil.mapTextContent);

        expect(names).toEqual(["a day ago", "7 days ago", "13 days ago"]);
      });

      it("should properly render the version column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-version"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .map(JestUtil.mapTextContent);

        expect(names).toEqual([
          "8/29/2016, 3:01:01 AM",
          "8/29/2016, 3:01:01 AM",
          "8/29/2016, 3:01:01 AM"
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
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        // 1 click on the header (ascending)
        const columnHeader = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        )[0];
        TestUtils.Simulate.click(columnHeader);
      });

      it("should properly sort the name column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

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
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        // 2 clicks on the header (descending)
        const columnHeader = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        )[0];
        TestUtils.Simulate.click(columnHeader);
        TestUtils.Simulate.click(columnHeader);
      });

      it("should properly sort the name column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

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
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        // Expand all table rows by clicking on each one of them
        TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).forEach(function(element) {
          const target = element.querySelector(".is-expandable");
          if (target) {
            TestUtils.Simulate.click(target);
          }
        });
      });

      it("should properly render the name column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

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

      it("should properly render the address column", function() {
        var columns = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-host-address"
        );
        const agents = columns.reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );
        const ports = columns.reduce(
          JestUtil.reduceTextContentOfSelector("a"),
          []
        );

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

      it("should properly render the status column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-status"
        ).reduce(JestUtil.reduceTextContentOfSelector(".status-text"), []);

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

      it("should properly render the cpu column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-cpus"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .reduce(JestUtil.reduceTextContentOfSelector("div > div > span"), []);

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

      it("should properly render the mem column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-mem"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .reduce(JestUtil.reduceTextContentOfSelector("div > div > span"), []);

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

      it("should properly render the updated column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-updated"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .reduce(JestUtil.reduceTextContentOfSelector("time"), []);

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

      it("should properly render the version column", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-version"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .map(JestUtil.mapTextContent);

        expect(names).toEqual([
          "8/29/2016, 3:01:01 AM",
          "8/29/2016, 3:01:01 AM",
          "8/29/2016, 3:01:01 AM"
        ]);
      });
    });
  });
});
