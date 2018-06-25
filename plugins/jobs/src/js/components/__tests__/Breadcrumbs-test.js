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
      const item = {
        path: pathCase.path,
        name: "MyJob"
      };
      expect(
        renderer
          .create(
            <Breadcrumbs renderStates={() => <span>States</span>} item={item} />
          )
          .toJSON()
      ).toMatchSnapshot();
    });
  }
});
