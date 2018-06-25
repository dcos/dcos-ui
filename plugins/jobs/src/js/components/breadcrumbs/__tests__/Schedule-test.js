import React from "react";
import renderer from "react-test-renderer";

import Schedule from "../Schedule";

describe("Schedule", () => {
  it("renders the schedule", () => {
    expect(
      renderer
        .create(<Schedule schedule={{ cron: "0 0 20 * *", enabled: true }} />)
        .toJSON()
    ).toMatchSnapshot();
  });
});
