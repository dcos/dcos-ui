jest.dontMock("../../../structs/Pod");
jest.dontMock("../../../structs/PodInstanceList");
jest.dontMock("../../../structs/PodInstance");
jest.dontMock("../../../structs/PodContainer");
jest.dontMock("../../../../../../../tests/_fixtures/pods/PodFixture");
jest.dontMock("../../../../../../../src/js/components/CheckboxTable");
jest.dontMock("../../../../../../../src/js/components/CollapsingString");
jest.dontMock("../../../../../../../src/js/components/ExpandingTable");
jest.dontMock("../../../../../../../src/js/components/FilterBar");
jest.dontMock("../../../../../../../src/js/components/FilterInputText");
jest.dontMock("../../../../../../../src/js/components/FilterButtons");
jest.dontMock("../../../../../../../src/js/components/TimeAgo");
jest.dontMock("../PodViewFilter");
jest.dontMock("../PodInstancesContainer");
jest.dontMock("../PodInstancesTable");

const JestUtil = require("../../../../../../../src/js/utils/JestUtil");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");

const PodInstancesContainer = require("../PodInstancesContainer");
const Pod = require("../../../structs/Pod");
const Util = require("../../../../../../../src/js/utils/Util");

const PodFixture = require("../../../../../../../tests/_fixtures/pods/PodFixture");

describe("PodInstancesContainer", function() {
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

  describe("#render", function() {
    describe("search with instance name", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesContainer,
          { pod },
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        const searchInput = TestUtils.findRenderedDOMComponentWithClass(
          this.instance,
          "filter-input-text"
        );

        searchInput.value = "instance-1";
        TestUtils.Simulate.change(searchInput);
      });

      it("should properly return matching instances", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

        expect(names).toEqual(["instance-1"]);
      });
    });

    describe("search with container name", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesContainer,
          { pod },
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        const searchInput = TestUtils.findRenderedDOMComponentWithClass(
          this.instance,
          "filter-input-text"
        );

        searchInput.value = "container-1";
        TestUtils.Simulate.change(searchInput);
      });

      it("should properly return matching instances and containers", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

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

      it("should always show instance total resources", function() {
        var mem = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-mem"
        )
          .filter(JestUtil.filterByTagName("TD"))
          .reduce(JestUtil.reduceTextContentOfSelector("span"), []);

        expect(mem).toEqual(["128 MiB", "64 MiB", "128 MiB", "64 MiB"]);
      });
    });

    describe("show all", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesContainer,
          { pod },
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        const buttons = TestUtils.findRenderedDOMComponentWithClass(
          this.instance,
          "button-group"
        ).querySelectorAll("button");

        // First button is 'All'
        TestUtils.Simulate.click(buttons[0]);
      });

      it("should properly show all instances", function() {
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

    describe("show completed", function() {
      beforeEach(function() {
        // Create a stub router context because when the items are expanded
        // the are creating <Link /> instances.
        const component = JestUtil.stubRouterContext(
          PodInstancesContainer,
          { pod },
          { service: pod }
        );
        this.instance = TestUtils.renderIntoDocument(component);

        const buttons = TestUtils.findRenderedDOMComponentWithClass(
          this.instance,
          "button-group"
        ).querySelectorAll("button");

        // Third button is 'Completed'
        // (We have no such instances in our mock data)
        TestUtils.Simulate.click(buttons[2]);
      });

      it("should properly show no instances", function() {
        var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance,
          "task-table-column-primary"
        ).reduce(
          JestUtil.reduceTextContentOfSelector(
            ".collapsing-string-full-string"
          ),
          []
        );

        expect(names).toEqual([]);
      });
    });
  });
});
