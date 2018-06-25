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
              extra={<span>States</span>}
              path={pathCase.path}
              name="MyJob"
            />
          )
          .toJSON()
      ).toMatchSnapshot();
    });
  }

  it(`has path but no name`, () => {
    expect(
      renderer.create(<Breadcrumbs path={["foo", "bar"]} />).toJSON()
    ).toMatchSnapshot();
  });

  it(`has no props at all`, () => {
    expect(renderer.create(<Breadcrumbs />).toJSON()).toMatchSnapshot();
  });
});
