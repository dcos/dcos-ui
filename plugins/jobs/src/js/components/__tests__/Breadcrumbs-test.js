import React from "react";
import renderer from "react-test-renderer";

import Breadcrumbs from "../Breadcrumbs";

describe("Breadcrumbs", () => {
  const pathCases = [
    {
      name: "no path",
      path: []
    },
    {
      name: "a long path",
      path: ["foo", "bar"]
    }
  ];

  for (const pathCase of pathCases) {
    it(`has ${pathCase.name}`, () => {
      expect(
        renderer
          .create(
            <Breadcrumbs
              jobPath={pathCase.path}
              jobName="MyJob"
              jobInfo={<span>States</span>}
            />
          )
          .toJSON()
      ).toMatchSnapshot();
    });
  }

  it(`has path but no name`, () => {
    expect(
      renderer.create(<Breadcrumbs jobPath={["foo", "bar"]} />).toJSON()
    ).toMatchSnapshot();
  });

  it(`has no props at all`, () => {
    expect(renderer.create(<Breadcrumbs />).toJSON()).toMatchSnapshot();
  });
});
