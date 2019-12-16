import React from "react";
import { shallow } from "enzyme";

import FilterBar from "../FilterBar";

let thisInstance;

describe("FilterBar", () => {
  describe("FilterBar with left-align items", () => {
    beforeEach(() => {
      thisInstance = shallow(
        <FilterBar>
          <div>0</div>
          <div>1</div>
          <div>2</div>
        </FilterBar>
      );
    });

    it('wraps items in array with "filter-bar-item"', () => {
      const filterItems = thisInstance.find(".filter-bar-item");
      expect(filterItems.length).toEqual(3);
      [0, 1, 2].forEach(i => {
        expect(parseInt(filterItems.at(i).text(), 10)).toBe(i);
      });
    });

    it("renders all items left-aligned", () => {
      const filterBarLeft = thisInstance.find(".filter-bar-left");

      expect(filterBarLeft.prop("children").length).toEqual(3);
    });

    it("renders no items right-aligned", () => {
      const filterBarRight = thisInstance.find(".filter-bar-right");

      expect(filterBarRight.length).toEqual(0);
    });
  });

  describe("FilterBar with left- and right-align items", () => {
    beforeEach(() => {
      thisInstance = shallow(
        <FilterBar rightAlignLastNChildren={2}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </FilterBar>
      );
    });

    it("renders some items left-aligned", () => {
      const filterBarLeft = thisInstance.find(".filter-bar-left");

      expect(filterBarLeft.prop("children").length).toEqual(2);
    });

    it("renders some items right-aligned", () => {
      const filterBarRight = thisInstance.find(".filter-bar-right");

      expect(filterBarRight.prop("children").length).toEqual(2);
    });
  });

  describe("FilterBar with right-align items", () => {
    beforeEach(() => {
      thisInstance = shallow(
        <FilterBar rightAlignLastNChildren={3}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
        </FilterBar>
      );
    });

    it("renders no items left-aligned", () => {
      const filterBarLeft = thisInstance.find(".filter-bar-left");

      expect(filterBarLeft.length).toEqual(0);
    });

    it("renders all items right-aligned", () => {
      const filterBarRight = thisInstance.find(".filter-bar-right");

      expect(filterBarRight.prop("children").length).toEqual(3);
    });
  });
});
