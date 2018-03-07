import React from "react";
import { shallow } from "enzyme";

const FilterBar = require("../FilterBar");

let thisInstance;

describe("FilterBar", function() {
  describe("FilterBar with left-align items", function() {
    beforeEach(function() {
      thisInstance = shallow(
        <FilterBar>
          <div>0</div>
          <div>1</div>
          <div>2</div>
        </FilterBar>
      );
    });

    it('wraps items in array with "filter-bar-item"', function() {
      const filterItems = thisInstance.find(".filter-bar-item");
      expect(filterItems.length).toEqual(3);
      [0, 1, 2].forEach(function(i) {
        expect(parseInt(filterItems.at(i).text(), 10)).toBe(i);
      });
    });

    it("renders all items left-aligned", function() {
      const filterBarLeft = thisInstance.find(".filter-bar-left");

      expect(filterBarLeft.prop("children").length).toEqual(3);
    });

    it("renders no items right-aligned", function() {
      const filterBarRight = thisInstance.find(".filter-bar-right");

      expect(filterBarRight.length).toEqual(0);
    });
  });

  describe("FilterBar with left- and right-align items", function() {
    beforeEach(function() {
      thisInstance = shallow(
        <FilterBar rightAlignLastNChildren={2}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </FilterBar>
      );
    });

    it("renders some items left-aligned", function() {
      const filterBarLeft = thisInstance.find(".filter-bar-left");

      expect(filterBarLeft.prop("children").length).toEqual(2);
    });

    it("renders some items right-aligned", function() {
      const filterBarRight = thisInstance.find(".filter-bar-right");

      expect(filterBarRight.prop("children").length).toEqual(2);
    });
  });

  describe("FilterBar with right-align items", function() {
    beforeEach(function() {
      thisInstance = shallow(
        <FilterBar rightAlignLastNChildren={3}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
        </FilterBar>
      );
    });

    it("renders no items left-aligned", function() {
      const filterBarLeft = thisInstance.find(".filter-bar-left");

      expect(filterBarLeft.length).toEqual(0);
    });

    it("renders all items right-aligned", function() {
      const filterBarRight = thisInstance.find(".filter-bar-right");

      expect(filterBarRight.prop("children").length).toEqual(3);
    });
  });
});
