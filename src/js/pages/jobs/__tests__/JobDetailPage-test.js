import React from "react";
import renderer from "react-test-renderer";

import JobDetailPage from "../JobDetailPage";

describe("JobDetailPage", () => {
  describe("#renderBreadcrumbStates", () => {
    const testCases = [
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

    for (const testCase of testCases) {
      it(`renders ${testCase.name}`, () => {
        const item = {
          schedules: {
            nodes: testCase.schedules
          },
          jobRuns: {
            longestRunningActiveRun: {
              tasks: {
                longestRunningTask: testCase.jobTask
              }
            }
          }
        };
        expect(
          renderer
            .create(
              <div>{JobDetailPage.prototype.renderBreadcrumbStates(item)}</div>
            )
            .toJSON()
        ).toMatchSnapshot();
      });
    }
  });
});
