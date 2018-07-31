import React from "react";
import renderer from "react-test-renderer";
import { IntlProvider } from "react-intl";
import enUS from "#SRC/js/translations/en-US.json";

import LeaderGrid from "../LeaderGrid";

const master = {
  hostPort: "127.1.2.3:8080",
  version: "2.9.1",
  electedTime: 1532340694.04573,
  startTime: 1232340694.04573,
  region: "us-east-1"
};

const TestableLeaderGrid = ({ master }) => {
  return (
    <IntlProvider locale="en" messages={enUS}>
      <LeaderGrid master={master} />
    </IntlProvider>
  );
};

describe("LeaderGrid", function() {
  beforeEach(function() {
    Date.now = jest.fn(() => 1542340694);
  });

  afterEach(function() {
    Date.now.mockRestore();
  });

  it("renders with running status", function() {
    expect(
      renderer.create(<TestableLeaderGrid master={master} />).toJSON()
    ).toMatchSnapshot();
  });
});
