import * as React from "react";
import { mount } from "enzyme";

import DialChart from "../DialChart";

const getInstanceWithProps = (props) => mount(<DialChart {...props} />);

let thisInstance;

describe("DialChart", () => {
  beforeEach(() => {
    thisInstance = getInstanceWithProps({
      data: [],
      label: "Items",
      unit: 100,
    });
  });

  describe("#getNormalizedData", () => {
    it("returns a single-member grey set when no data is present", () => {
      const normalizedData = thisInstance.instance().getNormalizedData(
        [
          { name: "TASK_1", value: 0 },
          { name: "TASK_2", value: 0 },
        ],
        []
      );

      expect(normalizedData).toEqual([{ colorIndex: 7, value: 1 }]);
    });

    it("returns the union of its slices and its data", () => {
      const normalizedData = thisInstance.instance().getNormalizedData(
        [
          { name: "TASK_1", value: 0 },
          { name: "TASK_2", value: 0 },
        ],
        [
          { name: "TASK_2", value: 10 },
          { name: "TASK_3", value: 20 },
        ]
      );
      expect(normalizedData).toEqual([
        { name: "TASK_1", value: 0 },
        { name: "TASK_2", value: 10 },
        { name: "TASK_3", value: 20 },
      ]);
    });
  });

  describe("#isEmpty", () => {
    it("returns true if there is no data", () => {
      const empty = thisInstance.instance().isEmpty([]);
      expect(empty).toBe(true);
    });

    it("returns true if the data sums to 0", () => {
      const empty = thisInstance
        .instance()
        .isEmpty([{ value: 0 }, { value: 0 }, { value: 0 }]);
      expect(empty).toBe(true);
    });

    it("returns false if the data sums to more than 0", () => {
      const empty = thisInstance
        .instance()
        .isEmpty([{ value: 0 }, { value: 1 }, { value: 0 }]);
      expect(empty).toBe(false);
    });
  });

  describe("#render", () => {
    beforeEach(() => {
      thisInstance = getInstanceWithProps({
        data: [
          { name: "TASK_1", value: 3 },
          { name: "TASK_2", value: 1 },
        ],
      });
    });

    it("when no data is present, it renders a single 'empty' slice to the DOM", () => {
      thisInstance = getInstanceWithProps({
        slices: [{ name: "TASK_1" }, { name: "TASK_2" }],
        data: [],
      });

      expect(thisInstance.find(".arc").length).toEqual(1);
    });

    it("renders a slice for each category of tasks", () => {
      expect(thisInstance.find(".arc").length).toEqual(2);
    });

    it("does not remove 0-length slices from the DOM", () => {
      thisInstance = getInstanceWithProps({
        slices: [{ name: "TASK_1" }, { name: "TASK_2" }],
        data: [{ name: "TASK_1", value: 4 }],
      });
      expect(thisInstance.find(".arc").length).toEqual(2);
    });
  });

  describe("#getRadius", () => {
    it("uses the width of its container when no height is set", () => {
      const r = thisInstance.instance().getRadius({ width: 100 });
      expect(r).toEqual(50);
    });

    it("uses the width of its container when both are available and w < h", () => {
      const r = thisInstance.instance().getRadius({ width: 100, height: 120 });
      expect(r).toEqual(50);
    });

    it("uses the height of its container when both are available and h < w", () => {
      const r = thisInstance.instance().getRadius({ width: 120, height: 100 });
      expect(r).toEqual(50);
    });
  });
});
