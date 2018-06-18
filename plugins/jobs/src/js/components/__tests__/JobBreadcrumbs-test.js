import React from "react";
import renderer from "react-test-renderer";

import JobBreadcrumbs from "../JobsBreadcrumbs";

describe("JobBreadcrumbs", () => {
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

  const annotationCases = [
    {
      name: "with no schedule",
      schedules: [],
      jobTask: null
    },
    {
      name: "with enabled schedules",
      schedules: [
        {
          enabled: true,
          cron: "0 0 20 * *"
        }
      ],
      jobTask: null
    },
    {
      name: "with job runs",
      schedules: [],
      jobTask: { status: "TASK_RUNNING" }
    },
    {
      name: "with job task and schedule",
      schedules: [
        {
          enabled: true,
          cron: "0 0 20 * *"
        }
      ],
      jobTask: { status: "TASK_RUNNING" }
    }
  ];

  for (const pathCase of pathCases) {
    for (const annotationCase of annotationCases) {
      it(`has ${pathCase.name} ${annotationCase.name}`, () => {
        const item = {
          path: pathCase.path,
          name: "MyJob",
          schedules: {
            nodes: annotationCase.schedules
          },
          jobRuns: {
            longestRunningActiveRun: {
              tasks: {
                longestRunningTask: {
                  status: annotationCase.jobTask
                }
              }
            }
          }
        };
        expect(
          renderer.create(<JobBreadcrumbs item={item} />).toJSON()
        ).toMatchSnapshot();
      });
    }
  }
});
