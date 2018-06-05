// TODO: remove this disable with https://jira.mesosphere.com/browse/DCOS_OSS-3579
// tslint:disable-next-line:no-submodule-imports
import { marbles } from "rxjs-marbles/jest";

import { resolvers } from "../JobModel";
import { Observable } from "rxjs";

const defaultJob = {
  id: "foo.bar.Ponies",
  labels: {},
  run: {
    cpus: 0.01,
    mem: 128,
    disk: 0,
    cmd: "sleep 19999",
    env: {},
    placement: { constraints: [] },
    artifacts: [],
    maxLaunchDelay: 3600,
    volumes: [],
    restart: { policy: "NEVER" },
    secrets: {}
  },
  schedules: [
    {
      concurrencyPolicy: "ALLOW",
      cron: "12 * * * *",
      enabled: false,
      id: "default",
      nextRunAt: "2018-06-04T11:12:00.000+0000",
      startingDeadlineSeconds: 900,
      timezone: "UTC"
    }
  ],
  historySummary: {
    failureCount: 1,
    lastFailureAt: "2017-06-01T10:33:51.875+0000",
    lastSuccessAt: "2018-06-01T10:33:51.875+0000",
    successCount: 1
  }
};
const defaultJobData = [defaultJob];

describe("JobData", () => {
  it(
    "polls the MetronomeActions.fetchJobs endpoint",
    marbles(m => {
      m.bind();
      const fetchJobs = () => m.cold("--x|", { x: defaultJobData });
      const result$ = resolvers({
        fetchJobs,
        pollingInterval: m.time("--|")
      }).Query.metronomeItems({}, {});
      const expected$ = m.cold("----x-x-(x|)", {
        x: defaultJobData
      });

      m.expect(result$.take(3)).toBeObservable(expected$);
    })
  );

  it("does not have two requests open at the same time");

  describe.skip("types", () => {
    describe("Jobs", () => {
      it(
        "has job attributes",
        marbles(m => {
          m.bind();

          const fetchJobs = () => Observable.of(defaultJobData);

          const result$ = resolvers({
            fetchJobs,
            pollingInterval: m.time("--|")
          }).Query.metronomeItems({}, {});

          const expected$ = m.cold("--(x|)", {
            x: {
              id: "foo.bar.Ponies",
              name: "Ponies",
              schedules: [
                {
                  concurrencyPolicy: "ALLOW",
                  cron: "12 * * * *",
                  enabled: false,
                  id: "default",
                  nextRunAt: "2018-06-04T11:12:00.000+0000",
                  startingDeadlineSeconds: 900,
                  timezone: "UTC"
                }
              ],
              status: "COMPLETED",
              lastRun: {
                status: "Success",
                lastSuccessAt: "2018-06-01T10:33:51.875+0000",
                lastFailureAt: "2017-06-01T10:33:51.875+0000"
              },
              namespace: true // TODO: define namespace interface
            }
          });

          m.expect(result$.take(1)).toBeObservable(expected$);
        })
      );
    });
  });

  describe("order", () => {
    const cases = [
      {
        sortBy: "id",
        sortDirection: "ASC",
        input: [
          { ...defaultJob, id: "foo.bar.baz" },
          { ...defaultJob, id: "abc.de.f" },
          { ...defaultJob, id: "peter" },
          { ...defaultJob, id: "anna" },
          { ...defaultJob, id: "heidi" }
        ],
        output: ["abc.de.f", "foo.bar.baz", "anna", "heidi", "peter"]
      },
      {
        sortBy: "id",
        sortDirection: "DESC",
        input: [
          { ...defaultJob, id: "foo.bar.baz" },
          { ...defaultJob, id: "abc.de.f" },
          { ...defaultJob, id: "peter" },
          { ...defaultJob, id: "anna" },
          { ...defaultJob, id: "heidi" }
        ],
        output: ["foo.bar.baz", "abc.de.f", "peter", "heidi", "anna"]
      },
      {
        sortBy: "status",
        sortDirection: "ASC",
        input: [
          { ...defaultJob, status: "INITIAL" },
          { ...defaultJob, status: "ACTIVE" },
          { ...defaultJob, status: "FAILED" },
          { ...defaultJob, status: "SUCCESS" },
          { ...defaultJob, status: "COMPLETED" },
          { ...defaultJob, status: "SCHEDULED" },
          { ...defaultJob, status: "UNSCHEDULED" }
        ],
        output: [
          "FAILED",
          "UNSCHEDULED",
          "SCHEDULED",
          "INITIAL",
          "ACTIVE",
          "COMPLETED",
          "SUCCESS"
        ]
      },
      {
        sortBy: "status",
        sortDirection: "DESC",
        input: [
          { ...defaultJob, status: "INITIAL" },
          { ...defaultJob, status: "ACTIVE" },
          { ...defaultJob, status: "FAILED" },
          { ...defaultJob, status: "SUCCESS" },
          { ...defaultJob, status: "COMPLETED" },
          { ...defaultJob, status: "SCHEDULED" },
          { ...defaultJob, status: "UNSCHEDULED" }
        ],
        output: [
          "SUCCESS",
          "COMPLETED",
          "ACTIVE",
          "INITIAL",
          "SCHEDULED",
          "UNSCHEDULED",
          "FAILED"
        ]
      },
      {
        sortBy: "lastRun",
        sortDirection: "ASC",
        input: [
          { ...defaultJob, lastRun: { status: "N/A" } },
          { ...defaultJob, lastRun: { status: "Success" } },
          { ...defaultJob, lastRun: { status: "Failed" } }
        ],
        output: [{ status: "Failed" }, { status: "N/A" }, { status: "Success" }]
      },
      {
        sortBy: "lastRun",
        sortDirection: "DESC",
        input: [
          { ...defaultJob, lastRun: { status: "N/A" } },
          { ...defaultJob, lastRun: { status: "Success" } },
          { ...defaultJob, lastRun: { status: "Failed" } }
        ],
        output: [{ status: "Success" }, { status: "N/A" }, { status: "Failed" }]
      }
    ];

    for (const { sortBy, sortDirection, input, output } of cases) {
      it(
        `sorts by ${sortBy} ${sortDirection}`,
        marbles(m => {
          m.bind();

          const fetchJobs = () => Observable.of(input);

          const result$ = resolvers({
            fetchJobs,
            pollingInterval: m.time("--|")
          }).Query.metronomeItems({}, { sortBy, sortDirection });

          const expected$ = m.cold("--(x|)", {
            x: output
          });
          m.expect(
            result$.take(1).map(result => result.map(item => item[sortBy]))
          ).toBeObservable(expected$);
        })
      );
    }
  });

  describe("filter", () => {
    const cases = [
      {
        name: "jobs by substring",
        filter: "cola",
        input: ["fanta", "cola", "pepsi", "fritzcola"],
        output: ["cola", "fritzcola"]
      },
      {
        name: "namespaced jobs by substring",
        filter: "cake",
        input: [
          "cola",
          "cake.strawberry",
          "strawberry.cake",
          "strawberry",
          "cake",
          "soda"
        ],
        output: ["cake.strawberry", "strawberry.cake", "cake"]
      }
    ];
    for (const { name, filter, input, output } of cases) {
      it(
        name,
        marbles(m => {
          m.bind();

          const fetchJobs = () =>
            Observable.of(input.map(id => ({ ...defaultJob, id })));

          const result$ = resolvers({
            fetchJobs,
            pollingInterval: m.time("--|")
          }).Query.metronomeItems({}, { filter });

          const expected$ = m.cold("--(x|)", {
            x: output
          });

          m.expect(
            result$.take(1).map(result => result.map(item => item.id))
          ).toBeObservable(expected$);
        })
      );
    }
  });
});
