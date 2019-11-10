import React from "react";
import { shallow } from "enzyme";

const FilterButtons = require("../FilterButtons");

let thisKey, thisFilters, thisItemList, thisInstance;

describe("FilterButtons", () => {
  beforeEach(() => {
    thisKey = "key";
    thisFilters = ["all", "f0", "f1"];
    thisItemList = [
      { name: "obj 0", key: "f0" },
      { name: "obj 1", key: "f0" },
      { name: "obj 2", key: "f1" }
    ];
    thisInstance = shallow(
      <FilterButtons
        filters={thisFilters}
        filterByKey={thisKey}
        getfilterChangeHandler={jest.genMockFunction()}
        itemList={thisItemList}
        selectedFilter="all"
      />
    );
  });

  describe("#getFilterButtons", () => {
    it("returns an array of buttons", () => {
      var buttons = thisInstance.instance().getFilterButtons();
      var areButtons = buttons.reduce((accumulated, element) => {
        return accumulated && element.type === "button";
      }, true);

      expect(Array.isArray(buttons)).toEqual(true);
      expect(areButtons).toEqual(true);
    });

    it('creates an "all" button when "all" is listed as filter', () => {
      var buttons = thisInstance.instance().getFilterButtons();
      var hasAll = buttons.reduce((accumulated, element) => {
        return accumulated || element.key === "all";
      }, false);

      expect(hasAll).toEqual(true);
    });
  });

  describe("#getCount", () => {
    beforeEach(() => {
      thisItemList = ["f0", "f0", "f1"];
    });

    it('adds an "all" key with total item count as value', () => {
      var counts = thisInstance.instance().getCount(thisItemList);
      expect(counts.all).toEqual(3);
    });

    it('returns a hash map with only key "all" if no items given', () => {
      var counts = thisInstance.instance().getCount([]);
      expect(counts).toEqual({ all: 0 });
    });

    it("creates a hash map of filter counts", () => {
      var counts = thisInstance.instance().getCount(thisItemList);
      var expectedCounts = {
        f0: 2,
        f1: 1,
        all: 3
      };

      expect(counts).toEqual(expectedCounts);
    });
  });
});
