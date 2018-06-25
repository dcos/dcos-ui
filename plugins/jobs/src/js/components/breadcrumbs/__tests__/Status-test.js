import React from "react";
import renderer from "react-test-renderer";

import Status from "../Status";

describe("Status", () => {
  // a subset of states for testing
  const states = [
    "TASK_RUNNING",
    "TASK_STARTING",
    "TASK_STARTED",
    "TASK_FAILED"
  ];
  for (const state of states) {
    it(`renders ${state}`, () => {
      expect(
        renderer.create(<Status status={state} />).toJSON()
      ).toMatchSnapshot();
    });
  }
});
