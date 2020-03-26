import * as React from "react";
import renderer from "react-test-renderer";

import { ServiceProgressBar } from "../ServiceStatusProgressBar";

describe("ServiceProgressBar", () => {
  for (const [runningInstances, instancesCount] of [
    [0, 1],
    [0, 10],
    [3, 4],
    [10, 10],
  ]) {
    it(`displays a (${runningInstances} / ${instancesCount}) ProgressBar`, () => {
      expect(
        renderer
          .create(
            <ServiceProgressBar
              instancesCount={instancesCount}
              runningInstances={runningInstances}
            />
          )
          .toJSON()
      ).toMatchSnapshot();
    });
  }
});
