import * as React from "react";
import renderer from "react-test-renderer";

import NonLeadersGrid from "../NonLeadersGrid";

const masters = [
  {
    health: 0,
    healthDescription: {
      classNames: "text-success",
      key: "HEALTHY",
      sortingValue: 3,
      title: "Healthy",
      value: 0
    },
    host_ip: "172.31.10.48",
    role: "master"
  },
  {
    health: 0,
    healthDescription: {
      classNames: "text-success",
      key: "HEALTHY",
      sortingValue: 3,
      title: "Healthy",
      value: 0
    },
    host_ip: "172.31.10.49",
    role: "master"
  }
];

describe("LeaderGrid", () => {
  it("renders loading", () => {
    expect(
      renderer.create(<NonLeadersGrid masters={undefined} />).toJSON()
    ).toMatchSnapshot();
  });

  it("renders empty", () => {
    expect(
      renderer.create(<NonLeadersGrid masters={[]} />).toJSON()
    ).toMatchSnapshot();
  });

  it("renders masters", () => {
    expect(
      renderer.create(<NonLeadersGrid masters={masters} />).toJSON()
    ).toMatchSnapshot();
  });
});
