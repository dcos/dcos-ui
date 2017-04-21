jest.dontMock("../FilterButtons");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");

const FilterButtons = require("../FilterButtons");

describe("FilterButtons", function() {
  beforeEach(function() {
    this.key = "key";
    this.filters = ["all", "f0", "f1"];
    this.itemList = [
      { name: "obj 0", key: "f0" },
      { name: "obj 1", key: "f0" },
      { name: "obj 2", key: "f1" }
    ];
    this.instance = TestUtils.renderIntoDocument(
      <FilterButtons
        filters={this.filters}
        filterByKey={this.key}
        getfilterChangeHandler={jest.genMockFunction()}
        itemList={this.itemList}
        selectedFilter="all"
      />
    );
  });

  describe("#getFilterButtons", function() {
    it("returns an array of buttons", function() {
      var buttons = this.instance.getFilterButtons();
      var areButtons = buttons.reduce(function(accumulated, element) {
        return accumulated && element.type === "button";
      }, true);

      expect(Array.isArray(buttons)).toEqual(true);
      expect(areButtons).toEqual(true);
    });

    it('creates an "all" button when "all" is listed as filter', function() {
      var buttons = this.instance.getFilterButtons();
      var hasAll = buttons.reduce(function(accumulated, element) {
        return accumulated || element.key === "all";
      }, false);

      expect(hasAll).toEqual(true);
    });
  });

  describe("#getCount", function() {
    beforeEach(function() {
      this.itemList = ["f0", "f0", "f1"];
    });

    it('adds an "all" key with total item count as value', function() {
      var counts = this.instance.getCount(this.itemList);
      expect(counts.all).toEqual(3);
    });

    it('returns a hash map with only key "all" if no items given', function() {
      var counts = this.instance.getCount([]);
      expect(counts).toEqual({ all: 0 });
    });

    it("creates a hash map of filter counts", function() {
      var counts = this.instance.getCount(this.itemList);
      var expectedCounts = {
        f0: 2,
        f1: 1,
        all: 3
      };

      expect(counts).toEqual(expectedCounts);
    });
  });
});
