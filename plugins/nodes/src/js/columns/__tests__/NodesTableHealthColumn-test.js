import TestRenderer from "react-test-renderer";
import Node from "#SRC/js/structs/Node";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";

import NA from "./fixtures/node-without-health.json";
import Healthy from "./fixtures/node-healthy.json";
import Unhealthy from "./fixtures/node-unhealthy.json";
import Warn from "./fixtures/node-warn.json";

import { healthRenderer, healthSorter } from "../NodesTableHealthColumn";

describe("NodesTableHealthColumn", () => {
  describe("renderer", () => {
    const testCases = { NA, Healthy, Unhealthy, Warn };
    for (const [statusName, data] of Object.entries(testCases)) {
      it(`renders with health status '${statusName}'`, () => {
        expect(
          TestRenderer.create(healthRenderer(new Node(data))).toJSON()
        ).toMatchSnapshot();
      });
    }
  });

  describe("sorter", () => {
    it("calls the unit health sorter", () => {
      const mockSort = jest.fn(() => ({
        reverse: jest.fn()
      }));
      const arrayMock = {
        sort: mockSort
      };
      healthSorter(arrayMock);
      expect(mockSort).toHaveBeenCalledWith(
        UnitHealthUtil.getHealthSortFunction
      );
    });
  });
});
