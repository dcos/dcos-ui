import React from "react";
import renderer from "react-test-renderer";

import Breadcrumbs from "../JobsBreadcrumbs";

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

  // const annotationCases = [
  //   {
  //     name: "with no schedule",
  //     schedules: [],
  //     jobTask: null
  //   },
  //   {
  //     name: "with enabled schedules",
  //     schedules: [
  //       {
  //         enabled: true,
  //         cron: "0 0 20 * *"
  //       }
  //     ],
  //     jobTask: null
  //   },
  //   {
  //     name: "with job runs",
  //     schedules: [],
  //     jobTask: { status: "TASK_RUNNING" }
  //   },
  //   {
  //     name: "with job task and schedule",
  //     schedules: [
  //       {
  //         enabled: true,
  //         cron: "0 0 20 * *"
  //       }
  //     ],
  //     jobTask: { status: "TASK_RUNNING" }
  //   }
  // ];

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
