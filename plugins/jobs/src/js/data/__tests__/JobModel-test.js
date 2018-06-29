import { Observable } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { resolvers } from "../JobModel";

const defaultJobDetailData = {
  id: "testid",
  description: "test description",
  labels: {},
  run: {
    cpus: 0.01,
    mem: 128,
    disk: 0,
    cmd: "sleep 10",
    env: {},
    placement: {
      constraints: []
    },
    artifacts: [],
    maxLaunchDelay: 3600,
    volumes: [],
    restart: {
      policy: "NEVER"
    },
    secrets: {}
  },
  schedules: [],
  activeRuns: [],
  history: {
    successCount: 3,
    failureCount: 1,
    lastSuccessAt: "2018-06-06T10:49:44.471+0000",
    lastFailureAt: "2018-06-06T09:31:47.760+0000",
    successfulFinishedRuns: [
      {
        id: "20180606104932xsDzH",
        createdAt: "2018-06-06T10:49:32.336+0000",
        finishedAt: "2018-06-06T10:49:44.471+0000"
      },
      {
        id: "20180606104545rjSRE",
        createdAt: "2018-06-06T10:45:45.890+0000",
        finishedAt: "2018-06-06T10:45:57.236+0000"
      },
      {
        id: "20180606100732E88WQ",
        createdAt: "2018-06-06T10:07:32.972+0000",
        finishedAt: "2018-06-06T10:07:44.265+0000"
      }
    ],
    failedFinishedRuns: [
      {
        createdAt: "2018-06-06T09:31:46.254+0000",
        finishedAt: "2018-06-06T09:31:47.760+0000",
        id: "20180606093146gr5Pi"
      }
    ]
  }
};

describe("JobModel Resolver", () => {
  let jobsData, jobsList;
  beforeEach(() => {
    jobsData = {
      a: {
        ...defaultJobDetailData,
        id: "a",
        activeRuns: [
          {
            jobId: "1",
            createdAt: "2018-06-12T16:25:35.593+0000",
            completedAt: "2018-06-12T17:25:35.593+0000",
            status: "FAILED",
            tasks: []
          }
        ],
        schedules: [
          {
            concurrencyPolicy: "ALLOW",
            cron: "* * * * *",
            enabled: true,
            id: "default",
            nextRunAt: "2018-06-13T08:39:00.000+0000",
            startingDeadlineSeconds: 900,
            timezone: "UTC"
          }
        ],
        history: {
          lastFailureAt: "2018-06-12T16:25:35.593+0000",
          lastSuccessAt: null,
          successCount: 0,
          failureCount: 0,
          successfulFinishedRuns: [],
          failedFinishedRuns: []
        }
      },
      b: {
        ...defaultJobDetailData,
        id: "b",
        activeRuns: [
          {
            jobId: "1",
            createdAt: "2018-06-12T16:25:35.593+0000",
            completedAt: "2018-06-12T17:25:35.593+0000",
            status: "COMPLETED",
            tasks: []
          }
        ],
        schedules: [
          {
            concurrencyPolicy: "ALLOW",
            cron: "* * * * *",
            enabled: false,
            id: "default",
            nextRunAt: "2018-06-13T08:39:00.000+0000",
            startingDeadlineSeconds: 900,
            timezone: "UTC"
          }
        ],
        history: {
          lastFailureAt: null,
          lastSuccessAt: null,
          successCount: 0,
          failureCount: 0,
          successfulFinishedRuns: [],
          failedFinishedRuns: []
        }
      },
      c: {
        ...defaultJobDetailData,
        id: "c",
        activeRuns: [],
        schedules: []
      }
    };

    jobsList = Object.values(jobsData);
  });

  describe("jobs", () => {
    const oneJobsResponse = (
      m,
      filter,
      sortBy = "ID",
      sortDirection = "ASC"
    ) => {
      const fetchJobs = () => m.cold("(j|)", { j: jobsList });
      const fetchJobDetail = id => m.cold("(j|)", { j: jobsData[id] });
      const resolverResult$ = resolvers({
        fetchJobs,
        fetchJobDetail,
        pollingInterval: m.time("--|")
      }).Query.jobs({}, { sortBy, sortDirection, filter, path: [] });

      return resolverResult$.take(1);
    };

    describe("nodes", () => {
      it(
        "returns a list of jobs",
        marbles(m => {
          m.bind();

          const fetchJobs = () => m.cold("(j|)", { j: [defaultJobDetailData] });
          const fetchJobDetail = _id =>
            m.cold("(j|)", { j: defaultJobDetailData });
          const resolverResult$ = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: m.time("--|")
          }).Query.jobs({}, { path: [] });

          const expected$ = m.cold("(j|)", {
            j: true
          });

          const result$ = resolverResult$
            .take(1)
            .map(jobsConnection => Array.isArray(jobsConnection.nodes));

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "polls the endpoint",
        marbles(m => {
          m.bind();
          const fetchJobs = () => m.cold("(j|)", { j: [defaultJobDetailData] });
          const fetchJobDetail = _id =>
            m.cold("(j|)", { j: defaultJobDetailData });
          const resolverResult$ = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: m.time("--|")
          }).Query.jobs({}, { path: [] });

          const expected$ = m.cold("(j|)", {
            j: ["testid"]
          });

          const result$ = resolverResult$
            .take(1)
            .map(({ nodes }) => nodes.map(job => job.id));
          m.expect(result$).toBeObservable(expected$);
        })
      );

      describe("ordering", () => {
        it(
          "orders by ID",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(m, undefined, "ID", "ASC")
              .map(({ nodes }) => nodes.map(job => job.id))

              .map(jobs => jobs);

            const expected$ = m.cold("(j|)", {
              j: ["a", "b", "c"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "orders by ID DESC",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(m, undefined, "ID", "DESC").map(
              ({ nodes }) => nodes.map(job => job.id)
            );

            const expected$ = m.cold("(j|)", {
              j: ["c", "b", "a"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "orders by STATUS",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(m, undefined, "STATUS", "ASC").map(
              ({ nodes }) => nodes.map(job => job.scheduleStatus)
            );

            const expected$ = m.cold("(j|)", {
              j: ["FAILED", "UNSCHEDULED", "COMPLETED"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "orders by LAST_RUN",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(
              m,
              undefined,
              "LAST_RUN",
              "ASC"
            ).map(({ nodes }) => nodes.map(job => job.lastRunStatus.status));

            const expected$ = m.cold("(j|)", {
              j: ["Failed", "N/A", "Success"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );
      });

      describe("filter", () => {
        it(
          "filters by ID",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(m, "b").map(({ nodes }) =>
              nodes.map(job => job.id)
            );

            const expected$ = m.cold("(j|)", {
              j: ["b"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );
        it(
          "filters by empty string",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(m, "").map(({ nodes }) =>
              nodes.map(job => job.id)
            );

            const expected$ = m.cold("(j|)", {
              j: ["a", "b", "c"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );
        it(
          "filters by undefined",
          marbles(m => {
            m.bind();

            const result$ = oneJobsResponse(m).map(({ nodes }) =>
              nodes.map(job => job.id)
            );

            const expected$ = m.cold("(j|)", {
              j: ["a", "b", "c"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );
      });

      describe("path", () => {
        const jobsResponseWithIds = (m, ids, path, filter) => {
          const fetchJobs = () =>
            m.cold("(j|)", {
              j: ids.map(id => ({ ...defaultJobDetailData, id }))
            });
          const fetchJobDetail = id =>
            m.cold("(j|)", { j: { ...defaultJobDetailData, id } });
          const resolverResult$ = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: m.time("--|")
          }).Query.jobs({}, { path, filter });

          return resolverResult$.take(1);
        };

        it(
          "only shows jobs within the path",
          marbles(m => {
            m.bind();

            const result$ = jobsResponseWithIds(
              m,
              [
                "foo.bar.baz",
                "bat.bar",
                "foo.bar.other",
                "foo.bar.clock",
                "bar.cocktails"
              ],
              ["foo"]
            ).map(({ nodes }) => nodes.map(job => job.id));

            const expected$ = m.cold("(j|)", {
              j: ["foo.bar.baz", "foo.bar.clock", "foo.bar.other"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "handles nested path",
          marbles(m => {
            m.bind();

            const result$ = jobsResponseWithIds(
              m,
              [
                "foo.bar.baz",
                "bat.bar",
                "foo.big.other",
                "foo.baz.clock",
                "bar.cocktails"
              ],
              ["foo", "bar"]
            ).map(({ nodes }) => nodes.map(job => job.id));

            const expected$ = m.cold("(j|)", {
              j: ["foo.bar.baz"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "filters by ID within the path",
          marbles(m => {
            m.bind();

            const result$ = jobsResponseWithIds(
              m,
              [
                "foo.bar.baz",
                "bat.bar",
                "foo.big.other",
                "foo.baz.clock",
                "bar.cocktails"
              ],
              ["foo"],
              "ba"
            ).map(({ nodes }) => nodes.map(job => job.id));

            const expected$ = m.cold("(j|)", {
              j: ["foo.bar.baz", "foo.baz.clock"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "calculates the filteredCount from pathd jobs",
          marbles(m => {
            m.bind();

            const result$ = jobsResponseWithIds(
              m,
              [
                "foo.bar.baz",
                "bat.bar",
                "foo.big.other",
                "foo.baz.clock",
                "bar.cocktails"
              ],
              ["foo"],
              "ba"
            ).map(({ filteredCount }) => filteredCount);

            const expected$ = m.cold("(j|)", {
              j: 2
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "calculates the totalCount from pathd jobs",
          marbles(m => {
            m.bind();

            const result$ = jobsResponseWithIds(
              m,
              [
                "foo.bar.baz",
                "bat.bar",
                "foo.big.other",
                "foo.baz.clock",
                "bar.cocktails"
              ],
              ["foo"],
              "ba"
            ).map(({ totalCount }) => totalCount);

            const expected$ = m.cold("(j|)", {
              j: 3
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );
      });
    });

    describe("filteredCount", () => {
      it(
        "returns number of jobs after filtering",
        marbles(m => {
          m.bind();

          const result$ = oneJobsResponse(m, "b").map(
            jobsConnection => jobsConnection.filteredCount
          );

          const expected$ = m.cold("(j|)", {
            j: 1
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );
    });

    describe("totalCount", () => {
      it(
        "returns number of jobs after filtering",
        marbles(m => {
          m.bind();

          const result$ = oneJobsResponse(m, "b").map(
            jobsConnection => jobsConnection.totalCount
          );

          const expected$ = m.cold("(j|)", {
            j: 3
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );
    });
  });

  describe("job", () => {
    it(
      "polls the endpoint",
      marbles(m => {
        m.bind();
        const fetchJobDetail = id =>
          m.cold("--x|", { x: { ...defaultJobDetailData, id } });
        const result$ = resolvers({
          fetchJobDetail,
          pollingInterval: m.time("--|")
        }).Query.job({}, { id: "foo" });

        const expected$ = m.cold("--x-x-(x|)", {
          x: "foo"
        });

        m.expect(result$.take(3).map(x => x.id)).toBeObservable(expected$);
      })
    );

    it(
      "returns plain job data (id, disk, description, cpus, command, mem)",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          fetchJobDetail: () => Observable.of(defaultJobDetailData),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(
          result$
            .take(1)
            .map(({ id, disk, description, cpus, command, mem }) => ({
              id,
              disk,
              description,
              cpus,
              command,
              mem
            }))
        ).toBeObservable(
          m.cold("(x|)", {
            x: {
              id: "testid",
              disk: 0,
              description: "test description",
              cpus: 0.01,
              mem: 128,
              command: "sleep 10"
            }
          })
        );
      })
    );

    it(
      "returns the name",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          fetchJobDetail: () =>
            Observable.of({ ...defaultJobDetailData, id: "foo.bar.baz" }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(result$.take(1).map(({ name }) => name)).toBeObservable(
          m.cold("(x|)", {
            x: "baz"
          })
        );
      })
    );

    it(
      "returns path when job has one",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          fetchJobDetail: () =>
            Observable.of({ ...defaultJobDetailData, id: "foo.bar.baz" }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(result$.take(1).map(({ path }) => path)).toBeObservable(
          m.cold("(x|)", {
            x: ["foo", "bar"]
          })
        );
      })
    );

    it(
      "returns empty array when job has no path",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          fetchJobDetail: () =>
            Observable.of({ ...defaultJobDetailData, id: "foo" }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(result$.take(1).map(({ path }) => path)).toBeObservable(
          m.cold("(x|)", {
            x: []
          })
        );
      })
    );

    describe("scheduleStatus", () => {
      it(
        "returns the longest running job's status",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                activeRuns: [
                  {
                    jobId: 1,
                    status: "foo",
                    createdAt: "1985-01-03t00:00:00z-1",
                    tasks: []
                  },
                  {
                    jobId: 2,
                    status: "bar",
                    createdAt: "1990-01-03t00:00:00z-1",
                    tasks: []
                  }
                ]
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ scheduleStatus }) => scheduleStatus)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "foo"
            })
          );
        })
      );

      it(
        "returns scheduled if there are no active runs and the schedule is enabled",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                id: "/foo",
                activeRuns: [],
                schedules: [
                  {
                    enabled: true
                  }
                ]
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ scheduleStatus }) => scheduleStatus)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "SCHEDULED"
            })
          );
        })
      );

      it(
        "returns unscheduled if there are no active runs and the schedule is enabled",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                id: "/foo",
                activeRuns: [],
                scheduled: [
                  {
                    enabled: false
                  }
                ]
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ scheduleStatus }) => scheduleStatus)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "UNSCHEDULED"
            })
          );
        })
      );

      it(
        "returns unscheduled if there are no active runs and no schedule",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                id: "/foo",
                activeRuns: []
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ scheduleStatus }) => scheduleStatus)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "UNSCHEDULED"
            })
          );
        })
      );
    });

    describe("activeRuns", () => {
      describe("longestRunningActiveRun", () => {
        it(
          "returns null if no runs are there",
          marbles(m => {
            m.bind();
            const result$ = resolvers({
              fetchJobDetail: () =>
                Observable.of({
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: []
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$
                .take(1)
                .map(
                  ({ activeRuns: { longestRunningActiveRun } }) =>
                    longestRunningActiveRun
                )
            ).toBeObservable(
              m.cold("(x|)", {
                x: null
              })
            );
          })
        );

        it(
          "returns the longest running active run",
          marbles(m => {
            m.bind();
            const result$ = resolvers({
              fetchJobDetail: () =>
                Observable.of({
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [
                    {
                      jobId: "1",
                      createdAt: "1990-01-03T00:00:00Z-1",
                      tasks: []
                    },
                    {
                      jobId: "2",
                      createdAt: "1985-01-03T00:00:00Z-1",
                      tasks: []
                    },
                    {
                      jobId: "3",
                      createdAt: "1995-01-03T00:00:00Z-1",
                      tasks: []
                    }
                  ]
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$
                .take(1)
                .map(
                  ({ activeRuns: { longestRunningActiveRun } }) =>
                    longestRunningActiveRun.jobID
                )
            ).toBeObservable(
              m.cold("(x|)", {
                x: "2"
              })
            );
          })
        );

        it(
          "ignores runs without a createdAt field",
          marbles(m => {
            m.bind();
            const result$ = resolvers({
              fetchJobDetail: () =>
                Observable.of({
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [
                    {
                      jobId: "1",
                      createdAt: "1990-01-03T00:00:00Z-1",
                      tasks: []
                    },
                    { jobId: "2", createdAt: null, tasks: [] },
                    {
                      jobId: "3",
                      createdAt: "1995-01-03T00:00:00Z-1",
                      tasks: []
                    }
                  ]
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$
                .take(1)
                .map(
                  ({ activeRuns: { longestRunningActiveRun } }) =>
                    longestRunningActiveRun.jobID
                )
            ).toBeObservable(
              m.cold("(x|)", {
                x: "1"
              })
            );
          })
        );
      });

      describe("nodes", () => {
        it(
          "returns all active runs",
          marbles(m => {
            m.bind();
            const result$ = resolvers({
              fetchJobDetail: () =>
                Observable.of({
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [
                    {
                      jobId: "1",
                      createdAt: "1990-01-03T00:00:00Z-1",
                      tasks: []
                    },
                    { jobId: "2", createdAt: null, tasks: [] },
                    {
                      jobId: "3",
                      createdAt: "1995-01-03T00:00:00Z-1",
                      tasks: []
                    }
                  ]
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$.take(1).map(({ activeRuns: { nodes } }) => nodes.length)
            ).toBeObservable(
              m.cold("(x|)", {
                x: 3
              })
            );
          })
        );

        describe("JobRun", () => {
          it(
            "contains dates as integers",
            marbles(m => {
              m.bind();
              const result$ = resolvers({
                fetchJobDetail: () =>
                  Observable.of({
                    ...defaultJobDetailData,
                    id: "/foo",
                    activeRuns: [
                      {
                        jobId: "1",
                        createdAt: "2018-06-12T16:25:35.593+0000",
                        completedAt: "2018-06-12T17:25:35.593+0000",
                        status: "ACTIVE",
                        id: "20180612162535qXvcx",
                        tasks: []
                      }
                    ]
                  }),
                pollingInterval: m.time("-|")
              }).Query.job({}, { id: "xyz" });

              m.expect(
                result$.take(1).map(({ activeRuns: { nodes } }) => ({
                  dateCreated: nodes[0].dateCreated,
                  dateFinished: nodes[0].dateFinished
                }))
              ).toBeObservable(
                m.cold("(x|)", {
                  x: {
                    dateCreated: 1528820735593,
                    dateFinished: 1528824335593
                  }
                })
              );
            })
          );

          it(
            "contains a status",
            marbles(m => {
              m.bind();
              const result$ = resolvers({
                fetchJobDetail: () =>
                  Observable.of({
                    ...defaultJobDetailData,
                    id: "/foo",
                    activeRuns: [
                      {
                        jobId: "1",
                        createdAt: "2018-06-12T16:25:35.593+0000",
                        completedAt: "2018-06-12T17:25:35.593+0000",
                        status: "ACTIVE",
                        id: "20180612162535qXvcx",
                        tasks: []
                      }
                    ]
                  }),
                pollingInterval: m.time("-|")
              }).Query.job({}, { id: "xyz" });

              m.expect(
                result$
                  .take(1)
                  .map(({ activeRuns: { nodes } }) => nodes[0].status)
              ).toBeObservable(
                m.cold("(x|)", {
                  x: "ACTIVE"
                })
              );
            })
          );

          describe("tasks", () => {
            it(
              "nodes contains all tasks",
              marbles(m => {
                m.bind();
                const result$ = resolvers({
                  fetchJobDetail: () =>
                    Observable.of({
                      ...defaultJobDetailData,
                      id: "/foo",
                      activeRuns: [
                        {
                          jobId: "1",
                          createdAt: "2018-06-12T16:25:35.593+0000",
                          completedAt: "2018-06-12T17:25:35.593+0000",
                          status: "ACTIVE",
                          id: "20180612162535qXvcx",
                          tasks: [
                            {
                              id:
                                "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471282",
                              startedAt: "2018-06-13T08:08:34.773+0000",
                              status: "TASK_RUNNING"
                            },
                            {
                              id:
                                "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                              startedAt: "2018-06-13T08:09:34.773+0000",
                              status: "TASK_STARTING"
                            },
                            {
                              id:
                                "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                              startedAt: "2018-06-12T08:09:34.773+0000",
                              status: "TASK_RUNNING"
                            },
                            {
                              id:
                                "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                              startedAt: "2018-06-12T08:09:34.773+0000",
                              status: "TASK_FINISHED"
                            }
                          ]
                        }
                      ]
                    }),
                  pollingInterval: m.time("-|")
                }).Query.job({}, { id: "xyz" });

                m.expect(
                  result$
                    .take(1)
                    .map(
                      ({ activeRuns: { nodes } }) => nodes[0].tasks.nodes.length
                    )
                ).toBeObservable(
                  m.cold("(x|)", {
                    x: 4
                  })
                );
              })
            );

            describe("JobTask", () => {
              it(
                "contains the dates as numbers",
                marbles(m => {
                  m.bind();
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      Observable.of({
                        ...defaultJobDetailData,
                        id: "/foo",
                        activeRuns: [
                          {
                            jobId: "1",
                            createdAt: "2018-06-12T16:25:35.593+0000",
                            completedAt: "2018-06-12T17:25:35.593+0000",
                            status: "ACTIVE",
                            id: "20180612162535qXvcx",
                            tasks: [
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471282",
                                createdAt: "2018-06-13T08:08:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-13T08:09:34.773+0000",
                                status: "TASK_STARTING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_FINISHED",
                                finishedAt: "2018-06-13T08:10:15.367+0000"
                              }
                            ]
                          }
                        ]
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.take(1).map(({ activeRuns: { nodes } }) => ({
                      dateCompleted: nodes[0].tasks.nodes[3].dateCompleted,
                      dateStarted: nodes[0].tasks.nodes[3].dateStarted
                    }))
                  ).toBeObservable(
                    m.cold("(x|)", {
                      x: {
                        dateCompleted: 1528877415367,
                        dateStarted: 1528790974773
                      }
                    })
                  );
                })
              );

              it(
                "contains the taskId",
                marbles(m => {
                  m.bind();
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      Observable.of({
                        ...defaultJobDetailData,
                        id: "/foo",
                        activeRuns: [
                          {
                            jobId: "1",
                            createdAt: "2018-06-12T16:25:35.593+0000",
                            completedAt: "2018-06-12T17:25:35.593+0000",
                            status: "ACTIVE",
                            id: "20180612162535qXvcx",
                            tasks: [
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471282",
                                createdAt: "2018-06-13T08:08:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-13T08:09:34.773+0000",
                                status: "TASK_STARTING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_FINISHED",
                                finishedAt: "2018-06-13T08:10:15.367+0000"
                              }
                            ]
                          }
                        ]
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$
                      .take(1)
                      .map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.nodes[0].taskId
                      )
                  ).toBeObservable(
                    m.cold("(x|)", {
                      x:
                        "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471282"
                    })
                  );
                })
              );

              it(
                "contains the status",
                marbles(m => {
                  m.bind();
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      Observable.of({
                        ...defaultJobDetailData,
                        id: "/foo",
                        activeRuns: [
                          {
                            jobId: "1",
                            createdAt: "2018-06-12T16:25:35.593+0000",
                            completedAt: "2018-06-12T17:25:35.593+0000",
                            status: "ACTIVE",
                            id: "20180612162535qXvcx",
                            tasks: [
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471282",
                                createdAt: "2018-06-13T08:08:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-13T08:09:34.773+0000",
                                status: "TASK_STARTING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id:
                                  "foo_20180613080833uHuVo.f76c008f-6ee0-11e8-90f4-a20d8c471283",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_FINISHED",
                                finishedAt: "2018-06-13T08:10:15.367+0000"
                              }
                            ]
                          }
                        ]
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$
                      .take(1)
                      .map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.nodes[0].status
                      )
                  ).toBeObservable(
                    m.cold("(x|)", {
                      x: "TASK_RUNNING"
                    })
                  );
                })
              );
            });

            describe("longestRunningTask", () => {
              it(
                "returns longest running",
                marbles(m => {
                  m.bind();
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      Observable.of({
                        ...defaultJobDetailData,
                        id: "/foo",
                        activeRuns: [
                          {
                            jobId: "1",
                            createdAt: "2018-06-12T16:25:35.593+0000",
                            completedAt: "2018-06-12T17:25:35.593+0000",
                            status: "ACTIVE",
                            id: "20180612162535qXvcx",
                            tasks: [
                              {
                                id: "shortest-running",
                                createdAt: "2018-06-13T08:08:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id: "middle-running",
                                createdAt: "2018-06-13T08:09:34.773+0000",
                                status: "TASK_STARTING"
                              },
                              {
                                id: "longest-running",
                                createdAt: "2018-06-12T08:09:34.773+0000",
                                status: "TASK_RUNNING"
                              }
                            ]
                          }
                        ]
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$
                      .take(1)
                      .map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.longestRunningTask.taskId
                      )
                  ).toBeObservable(
                    m.cold("(x|)", {
                      x: "longest-running"
                    })
                  );
                })
              );

              it(
                "ignores createdAt",
                marbles(m => {
                  m.bind();
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      Observable.of({
                        ...defaultJobDetailData,
                        id: "/foo",
                        activeRuns: [
                          {
                            jobId: "1",
                            createdAt: "2018-06-12T16:25:35.593+0000",
                            completedAt: "2018-06-12T17:25:35.593+0000",
                            status: "ACTIVE",
                            id: "20180612162535qXvcx",
                            tasks: [
                              {
                                id: "shortest-running",
                                createdAt: "2018-06-13T08:08:34.773+0000",
                                status: "TASK_RUNNING"
                              },
                              {
                                id: "longest-running",
                                createdAt: "2017-06-13T08:09:34.773+0000",
                                status: "TASK_STARTING"
                              },
                              {
                                id: "without-created-at",
                                status: "TASK_RUNNING"
                              }
                            ]
                          }
                        ]
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$
                      .take(1)
                      .map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.longestRunningTask.taskId
                      )
                  ).toBeObservable(
                    m.cold("(x|)", {
                      x: "longest-running"
                    })
                  );
                })
              );

              it(
                "returns null if there are no tasks",
                marbles(m => {
                  m.bind();
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      Observable.of({
                        ...defaultJobDetailData,
                        id: "/foo",
                        activeRuns: [
                          {
                            jobId: "1",
                            createdAt: "2018-06-12T16:25:35.593+0000",
                            completedAt: "2018-06-12T17:25:35.593+0000",
                            status: "ACTIVE",
                            id: "20180612162535qXvcx",
                            tasks: []
                          }
                        ]
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$
                      .take(1)
                      .map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.longestRunningTask
                      )
                  ).toBeObservable(
                    m.cold("(x|)", {
                      x: null
                    })
                  );
                })
              );
            });
          });
        });
      });
    });

    describe("jobRuns", () => {
      it(
        "contains all types of job runs",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                id: "/foo",
                activeRuns: [
                  {
                    jobId: "1",
                    createdAt: "2018-06-12T16:25:35.593+0000",
                    completedAt: "2018-06-12T17:25:35.593+0000",
                    status: "ACTIVE",
                    id: "20180612162535qXvcx",
                    tasks: []
                  }
                ],
                history: {
                  successfulFinishedRuns: [
                    {
                      id: "2",
                      createdAt: "2018-06-12T16:25:35.593+0000",
                      finishedAt: "2018-06-12T17:25:35.593+0000"
                    }
                  ],
                  failedFinishedRuns: [
                    {
                      id: "3",
                      createdAt: "2018-06-12T16:25:35.593+0000",
                      finishedAt: "2018-06-12T17:25:35.593+0000"
                    }
                  ]
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$
              .take(1)
              .map(({ jobRuns: { nodes } }) => nodes.map(node => node.jobID))
          ).toBeObservable(
            m.cold("(x|)", {
              x: ["1", "2", "3"]
            })
          );
        })
      );

      it(
        "contains same information for each type",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                id: "/foo",
                activeRuns: [
                  {
                    jobId: "1",
                    createdAt: "2018-06-12T16:25:35.593+0000",
                    completedAt: "2018-06-12T17:25:35.593+0000",
                    status: "ACTIVE",
                    id: "20180612162535qXvcx",
                    tasks: []
                  }
                ],
                history: {
                  successfulFinishedRuns: [
                    {
                      id: "2",
                      createdAt: "2018-06-12T16:25:35.593+0000",
                      finishedAt: "2018-06-12T17:25:35.593+0000"
                    }
                  ],
                  failedFinishedRuns: [
                    {
                      id: "3",
                      createdAt: "2018-06-12T16:25:35.593+0000",
                      finishedAt: "2018-06-12T17:25:35.593+0000"
                    }
                  ]
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          const emptyTasks = {
            longestRunningTask: null,
            nodes: []
          };

          m.expect(
            result$
              .take(1)
              .map(({ jobRuns: { nodes } }) => nodes.map(node => node))
          ).toBeObservable(
            m.cold("(x|)", {
              x: [
                {
                  dateCreated: 1528820735593,
                  dateFinished: 1528824335593,
                  jobID: "1",
                  status: "ACTIVE",
                  tasks: emptyTasks
                },
                {
                  dateCreated: 1528820735593,
                  dateFinished: 1528824335593,
                  jobID: "2",
                  status: "COMPLETED",
                  tasks: emptyTasks
                },
                {
                  dateCreated: 1528820735593,
                  dateFinished: 1528824335593,
                  jobID: "3",
                  status: "FAILED",
                  tasks: emptyTasks
                }
              ]
            })
          );
        })
      );
    });

    describe("lastRunsSummary", () => {
      it(
        "contains default if job wasnt run yet",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                history: {
                  failureCount: 0,
                  lastFailureAt: null,
                  lastSuccessAt: null,
                  successCount: 0,
                  successfulFinishedRuns: [],
                  failedFinishedRuns: []
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(response => response.lastRunsSummary)
          ).toBeObservable(
            m.cold("(x|)", {
              x: {
                failureCount: 0,
                lastFailureAt: null,
                lastSuccessAt: null,
                successCount: 0
              }
            })
          );
        })
      );
    });

    describe("docker", () => {
      it(
        "is null if no docker information is provided",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                run: {
                  ...defaultJobDetailData.run,
                  docker: null
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(response => response.docker)
          ).toBeObservable(m.cold("(x|)", { x: null }));
        })
      );

      it(
        "returns forcePullImage",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                run: {
                  ...defaultJobDetailData.run,
                  docker: {
                    forcePullImage: true,
                    image: "node:10"
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(response => response.docker.forcePullImage)
          ).toBeObservable(m.cold("(x|)", { x: true }));
        })
      );

      it(
        "returns image",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                run: {
                  ...defaultJobDetailData.run,
                  docker: {
                    forcePullImage: true,
                    image: "node:10"
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(response => response.docker.image)
          ).toBeObservable(m.cold("(x|)", { x: "node:10" }));
        })
      );
    });

    describe("json", () => {
      it(
        "returns json representation",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                id: "json-id"
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(response => JSON.parse(response.json).id)
          ).toBeObservable(m.cold("(x|)", { x: "json-id" }));
        })
      );

      it(
        "removes blacklisted keys from JSON",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(response => JSON.parse(response.json).history)
          ).toBeObservable(m.cold("(x|)", { x: undefined }));
        })
      );
    });

    it(
      "returns labels as array of key and value",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          fetchJobDetail: () =>
            Observable.of({
              ...defaultJobDetailData,
              labels: {
                foo: "bar",
                baz: "nice"
              }
            }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "xyz" });

        m.expect(
          result$.take(1).map(response => response.labels)
        ).toBeObservable(
          m.cold("(x|)", {
            x: [{ key: "foo", value: "bar" }, { key: "baz", value: "nice" }]
          })
        );
      })
    );

    describe("lastRunStatus", () => {
      it(
        "returns status of last run",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ lastRunStatus }) => lastRunStatus.status)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "Success"
            })
          );
        })
      );
      it(
        "returns time of last run",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ lastRunStatus }) => lastRunStatus.time)
          ).toBeObservable(
            m.cold("(x|)", {
              x: 1528282184471
            })
          );
        })
      );

      it(
        "returns status N/A for new Job",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                history: {
                  lastFailureAt: null,
                  lastSuccessAt: null,
                  successCount: 0,
                  failureCount: 0,
                  successfulFinishedRuns: [],
                  failedFinishedRuns: []
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ lastRunStatus }) => lastRunStatus.status)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "N/A"
            })
          );
        })
      );

      it(
        "returns time null for new Job",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                history: {
                  lastFailureAt: null,
                  lastSuccessAt: null,
                  successCount: 0,
                  failureCount: 0,
                  successfulFinishedRuns: [],
                  failedFinishedRuns: []
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ lastRunStatus }) => lastRunStatus.time)
          ).toBeObservable(
            m.cold("(x|)", {
              x: null
            })
          );
        })
      );

      it(
        "returns failed for job with only failed",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                history: {
                  lastFailureAt: "2018-06-06T09:31:47.760+0000",
                  lastSuccessAt: null,
                  successCount: 0,
                  failureCount: 1,
                  successfulFinishedRuns: [],
                  failedFinishedRuns: [
                    {
                      createdAt: "2018-06-06T09:31:46.254+0000",
                      finishedAt: "2018-06-06T09:31:47.760+0000",
                      id: "20180606093146gr5Pi"
                    }
                  ]
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ lastRunStatus }) => lastRunStatus.status)
          ).toBeObservable(
            m.cold("(x|)", {
              x: "Failed"
            })
          );
        })
      );

      it(
        "returns Success for first failed then successful Job",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ lastRunStatus }) => lastRunStatus)
          ).toBeObservable(
            m.cold("(x|)", {
              x: { status: "Success", time: 1528282184471 }
            })
          );
        })
      );
    });

    describe("schedules", () => {
      it(
        "contains empty array for schedules if response did",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ schedules }) => schedules)
          ).toBeObservable(
            m.cold("(x|)", {
              x: { nodes: [] }
            })
          );
        })
      );

      it(
        "contains schedule if response did",
        marbles(m => {
          m.bind();
          const result$ = resolvers({
            fetchJobDetail: () =>
              Observable.of({
                ...defaultJobDetailData,
                schedules: [
                  {
                    concurrencyPolicy: "ALLOW",
                    cron: "* * * * *",
                    enabled: false,
                    id: "default",
                    nextRunAt: "2018-06-13T08:39:00.000+0000",
                    startingDeadlineSeconds: 900,
                    timezone: "UTC"
                  }
                ]
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.take(1).map(({ schedules }) => schedules)
          ).toBeObservable(
            m.cold("(x|)", {
              x: {
                nodes: [
                  {
                    cron: "* * * * *",
                    enabled: false,
                    id: "default",
                    startingDeadlineSeconds: 900,
                    timezone: "UTC"
                  }
                ]
              }
            })
          );
        })
      );
    });
  });

  describe("runNow", () => {
    it(
      "returns a JobLink shaped object",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          runJob: () =>
            Observable.of({
              jobId: "bestJobEver",
              somethingElse: true
            })
        }).Mutation.runJob({}, { id: "bestJobEver" });

        m.expect(result$.take(1)).toBeObservable(
          m.cold("(x|)", {
            x: {
              jobId: "bestJobEver"
            }
          })
        );
      })
    );
  });
});
