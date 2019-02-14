import { concat, of } from "rxjs";
import { take, map } from "rxjs/operators";
import { marbles, fakeSchedulers } from "rxjs-marbles/jest";
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
      const fetchJobs = () => m.cold("(j|)", { j: { response: jobsList } });
      const fetchJobDetail = id =>
        m.cold("(j|)", { j: { response: jobsData[id] } });
      const resolverResult$ = resolvers({
        fetchJobs,
        fetchJobDetail,
        pollingInterval: m.time("--|")
      }).Query.jobs({}, { sortBy, sortDirection, filter, path: [] });

      return resolverResult$.pipe(take(1));
    };

    describe("nodes", () => {
      it(
        "returns a list of jobs",
        marbles(m => {
          const fetchJobs = () =>
            m.cold("(j|)", { j: { response: [defaultJobDetailData] } });
          const fetchJobDetail = _id =>
            m.cold("(j|)", { j: { response: defaultJobDetailData } });
          const resolverResult$ = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: m.time("--|")
          }).Query.jobs({}, { path: [] });

          const expected$ = m.cold("(j|)", {
            j: true
          });

          const result$ = resolverResult$.pipe(
            take(1),
            map(jobsConnection => Array.isArray(jobsConnection.nodes))
          );

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "polls the endpoint",
        marbles(m => {
          const fetchJobs = () =>
            m.cold("(j|)", { j: { response: [defaultJobDetailData] } });
          const fetchJobDetail = _id =>
            m.cold("(j|)", { j: { response: defaultJobDetailData } });
          const resolverResult$ = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: m.time("--|")
          }).Query.jobs({}, { path: [] });

          const expected$ = m.cold("(j|)", {
            j: ["testid"]
          });

          const result$ = resolverResult$.pipe(
            take(1),
            map(({ nodes }) => nodes.map(job => job.id))
          );
          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "shares the subscription",
        fakeSchedulers(advance => {
          jest.useFakeTimers();
          const fetchJobs = jest.fn(() =>
            of({ response: [defaultJobDetailData] })
          );
          const fetchJobDetail = _id => of({ response: defaultJobDetailData });
          const jobsQuery = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: 20
          }).Query.jobs;

          concat(
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1)),
            jobsQuery({}, { path: [] }).pipe(take(1))
          ).subscribe();
          advance(20);
          expect(fetchJobs).toHaveBeenCalledTimes(1);
        })
      );

      describe("ordering", () => {
        it(
          "orders by ID",
          marbles(m => {
            const result$ = oneJobsResponse(m, undefined, "ID", "ASC").pipe(
              map(({ nodes }) => nodes.map(job => job.id)),
              map(jobs => jobs)
            );

            const expected$ = m.cold("(j|)", {
              j: ["a", "b", "c"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "orders by ID DESC",
          marbles(m => {
            const result$ = oneJobsResponse(m, undefined, "ID", "DESC").pipe(
              map(({ nodes }) => nodes.map(job => job.id))
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
            const result$ = oneJobsResponse(m, undefined, "STATUS", "ASC").pipe(
              map(({ nodes }) => nodes.map(job => job.scheduleStatus))
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
            const result$ = oneJobsResponse(
              m,
              undefined,
              "LAST_RUN",
              "ASC"
            ).pipe(
              map(({ nodes }) => nodes.map(job => job.lastRunStatus.status))
            );

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
            const result$ = oneJobsResponse(m, "b").pipe(
              map(({ nodes }) => nodes.map(job => job.id))
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
            const result$ = oneJobsResponse(m, "").pipe(
              map(({ nodes }) => nodes.map(job => job.id))
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
            const result$ = oneJobsResponse(m).pipe(
              map(({ nodes }) => nodes.map(job => job.id))
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
              j: { response: ids.map(id => ({ ...defaultJobDetailData, id })) }
            });
          const fetchJobDetail = id =>
            m.cold("(j|)", {
              j: { response: { ...defaultJobDetailData, id } }
            });
          const resolverResult$ = resolvers({
            fetchJobs,
            fetchJobDetail,
            pollingInterval: m.time("--|")
          }).Query.jobs({}, { path, filter });

          return resolverResult$.pipe(take(1));
        };

        it(
          "only shows jobs within the path",
          marbles(m => {
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
            ).pipe(map(({ nodes }) => nodes.map(job => job.id)));

            const expected$ = m.cold("(j|)", {
              j: ["foo.bar.baz", "foo.bar.clock", "foo.bar.other"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "handles nested path",
          marbles(m => {
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
            ).pipe(map(({ nodes }) => nodes.map(job => job.id)));

            const expected$ = m.cold("(j|)", {
              j: ["foo.bar.baz"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "filters by ID within the path",
          marbles(m => {
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
            ).pipe(map(({ nodes }) => nodes.map(job => job.id)));

            const expected$ = m.cold("(j|)", {
              j: ["foo.bar.baz", "foo.baz.clock"]
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "calculates the filteredCount from pathd jobs",
          marbles(m => {
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
            ).pipe(map(({ filteredCount }) => filteredCount));

            const expected$ = m.cold("(j|)", {
              j: 2
            });

            m.expect(result$).toBeObservable(expected$);
          })
        );

        it(
          "calculates the totalCount from pathd jobs",
          marbles(m => {
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
            ).pipe(map(({ totalCount }) => totalCount));

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
          const result$ = oneJobsResponse(m, "b").pipe(
            map(jobsConnection => jobsConnection.filteredCount)
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
          const result$ = oneJobsResponse(m, "b").pipe(
            map(jobsConnection => jobsConnection.totalCount)
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
        const fetchJobDetail = id =>
          m.cold("--x|", { x: { response: { ...defaultJobDetailData, id } } });
        const result$ = resolvers({
          fetchJobDetail,
          pollingInterval: m.time("--|")
        }).Query.job({}, { id: "foo" });

        const expected$ = m.cold("--x-x-(x|)", {
          x: "foo"
        });

        m.expect(
          result$.pipe(
            take(3),
            map(x => x.id)
          )
        ).toBeObservable(expected$);
      })
    );

    it(
      "returns plain job data (id, disk, description, cpus, command, mem)",
      marbles(m => {
        const result$ = resolvers({
          fetchJobDetail: () => of({ response: defaultJobDetailData }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(
          result$.pipe(
            take(1),
            map(({ id, disk, description, cpus, command, mem }) => ({
              id,
              disk,
              description,
              cpus,
              command,
              mem
            }))
          )
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
        const result$ = resolvers({
          fetchJobDetail: () =>
            of({
              response: { ...defaultJobDetailData, id: "foo.bar.baz" }
            }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(
          result$.pipe(
            take(1),
            map(({ name }) => name)
          )
        ).toBeObservable(
          m.cold("(x|)", {
            x: "baz"
          })
        );
      })
    );

    it(
      "returns path when job has one",
      marbles(m => {
        const result$ = resolvers({
          fetchJobDetail: () =>
            of({
              response: { ...defaultJobDetailData, id: "foo.bar.baz" }
            }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(
          result$.pipe(
            take(1),
            map(({ path }) => path)
          )
        ).toBeObservable(
          m.cold("(x|)", {
            x: ["foo", "bar"]
          })
        );
      })
    );

    it(
      "returns empty array when job has no path",
      marbles(m => {
        const result$ = resolvers({
          fetchJobDetail: () =>
            of({ response: { ...defaultJobDetailData, id: "foo" } }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "foo" });

        m.expect(
          result$.pipe(
            take(1),
            map(({ path }) => path)
          )
        ).toBeObservable(
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
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
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ scheduleStatus }) => scheduleStatus)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [],
                  schedules: [
                    {
                      enabled: true
                    }
                  ]
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ scheduleStatus }) => scheduleStatus)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [],
                  scheduled: [
                    {
                      enabled: false
                    }
                  ]
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ scheduleStatus }) => scheduleStatus)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: []
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ scheduleStatus }) => scheduleStatus)
            )
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
            const result$ = resolvers({
              fetchJobDetail: () =>
                of({
                  response: {
                    ...defaultJobDetailData,
                    id: "/foo",
                    activeRuns: []
                  }
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$.pipe(
                take(1),
                map(
                  ({ activeRuns: { longestRunningActiveRun } }) =>
                    longestRunningActiveRun
                )
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
            const result$ = resolvers({
              fetchJobDetail: () =>
                of({
                  response: {
                    ...defaultJobDetailData,
                    id: "/foo",
                    activeRuns: [
                      {
                        id: "1",
                        jobId: "foo",
                        createdAt: "1990-01-03T00:00:00Z-1",
                        tasks: []
                      },
                      {
                        id: "2",
                        jobId: "foo",
                        createdAt: "1985-01-03T00:00:00Z-1",
                        tasks: []
                      },
                      {
                        id: "3",
                        jobId: "foo",
                        createdAt: "1995-01-03T00:00:00Z-1",
                        tasks: []
                      }
                    ]
                  }
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$.pipe(
                take(1),
                map(
                  ({ activeRuns: { longestRunningActiveRun } }) =>
                    longestRunningActiveRun.jobID
                )
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
            const result$ = resolvers({
              fetchJobDetail: () =>
                of({
                  response: {
                    ...defaultJobDetailData,
                    id: "/foo",
                    activeRuns: [
                      {
                        id: "1",
                        jobId: "foo",
                        createdAt: "1990-01-03T00:00:00Z-1",
                        tasks: []
                      },
                      { id: "2", jobId: "foo", createdAt: null, tasks: [] },
                      {
                        id: "3",
                        jobId: "foo",
                        createdAt: "1995-01-03T00:00:00Z-1",
                        tasks: []
                      }
                    ]
                  }
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$.pipe(
                take(1),
                map(
                  ({ activeRuns: { longestRunningActiveRun } }) =>
                    longestRunningActiveRun.jobID
                )
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
            const result$ = resolvers({
              fetchJobDetail: () =>
                of({
                  response: {
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
                  }
                }),
              pollingInterval: m.time("-|")
            }).Query.job({}, { id: "xyz" });

            m.expect(
              result$.pipe(
                take(1),
                map(({ activeRuns: { nodes } }) => nodes.length)
              )
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
              const result$ = resolvers({
                fetchJobDetail: () =>
                  of({
                    response: {
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
                    }
                  }),
                pollingInterval: m.time("-|")
              }).Query.job({}, { id: "xyz" });

              m.expect(
                result$.pipe(
                  take(1),
                  map(({ activeRuns: { nodes } }) => ({
                    dateCreated: nodes[0].dateCreated,
                    dateFinished: nodes[0].dateFinished
                  }))
                )
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
              const result$ = resolvers({
                fetchJobDetail: () =>
                  of({
                    response: {
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
                    }
                  }),
                pollingInterval: m.time("-|")
              }).Query.job({}, { id: "xyz" });

              m.expect(
                result$.pipe(
                  take(1),
                  map(({ activeRuns: { nodes } }) => nodes[0].status)
                )
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
                const result$ = resolvers({
                  fetchJobDetail: () =>
                    of({
                      response: {
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
                      }
                    }),
                  pollingInterval: m.time("-|")
                }).Query.job({}, { id: "xyz" });

                m.expect(
                  result$.pipe(
                    take(1),
                    map(
                      ({ activeRuns: { nodes } }) => nodes[0].tasks.nodes.length
                    )
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
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      of({
                        response: {
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
                        }
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.pipe(
                      take(1),
                      map(({ activeRuns: { nodes } }) => ({
                        dateCompleted: nodes[0].tasks.nodes[3].dateCompleted,
                        dateStarted: nodes[0].tasks.nodes[3].dateStarted
                      }))
                    )
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
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      of({
                        response: {
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
                        }
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.pipe(
                      take(1),
                      map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.nodes[0].taskId
                      )
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
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      of({
                        response: {
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
                        }
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.pipe(
                      take(1),
                      map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.nodes[0].status
                      )
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
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      of({
                        response: {
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
                        }
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.pipe(
                      take(1),
                      map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.longestRunningTask.taskId
                      )
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
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      of({
                        response: {
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
                        }
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.pipe(
                      take(1),
                      map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.longestRunningTask.taskId
                      )
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
                  const result$ = resolvers({
                    fetchJobDetail: () =>
                      of({
                        response: {
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
                        }
                      }),
                    pollingInterval: m.time("-|")
                  }).Query.job({}, { id: "xyz" });

                  m.expect(
                    result$.pipe(
                      take(1),
                      map(
                        ({ activeRuns: { nodes } }) =>
                          nodes[0].tasks.longestRunningTask
                      )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [
                    {
                      id: "1",
                      jobId: "foo",
                      createdAt: "2018-06-12T16:25:35.593+0000",
                      completedAt: "2018-06-12T17:25:35.593+0000",
                      status: "ACTIVE",
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
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ jobRuns: { nodes } }) => nodes.map(node => node.jobID))
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  id: "/foo",
                  activeRuns: [
                    {
                      jobId: "foo",
                      createdAt: "2018-06-12T16:25:35.593+0000",
                      completedAt: "2018-06-12T17:25:35.593+0000",
                      status: "ACTIVE",
                      id: "1",
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
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          const emptyTasks = {
            longestRunningTask: null,
            nodes: []
          };

          m.expect(
            result$.pipe(
              take(1),
              map(({ jobRuns: { nodes } }) => nodes.map(node => node))
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  history: {
                    failureCount: 0,
                    lastFailureAt: null,
                    lastSuccessAt: null,
                    successCount: 0,
                    successfulFinishedRuns: [],
                    failedFinishedRuns: []
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(response => response.lastRunsSummary)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  run: {
                    ...defaultJobDetailData.run,
                    docker: null
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(response => response.docker)
            )
          ).toBeObservable(m.cold("(x|)", { x: null }));
        })
      );

      it(
        "returns forcePullImage",
        marbles(m => {
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  run: {
                    ...defaultJobDetailData.run,
                    docker: {
                      forcePullImage: true,
                      image: "node:10"
                    }
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(response => response.docker.forcePullImage)
            )
          ).toBeObservable(m.cold("(x|)", { x: true }));
        })
      );

      it(
        "returns image",
        marbles(m => {
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  run: {
                    ...defaultJobDetailData.run,
                    docker: {
                      forcePullImage: true,
                      image: "node:10"
                    }
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(response => response.docker.image)
            )
          ).toBeObservable(m.cold("(x|)", { x: "node:10" }));
        })
      );
    });

    describe("json", () => {
      it(
        "returns json representation",
        marbles(m => {
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  id: "json-id"
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(response => JSON.parse(response.json).id)
            )
          ).toBeObservable(m.cold("(x|)", { x: "json-id" }));
        })
      );

      it(
        "removes blacklisted keys from JSON",
        marbles(m => {
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(response => JSON.parse(response.json).history)
            )
          ).toBeObservable(m.cold("(x|)", { x: undefined }));
        })
      );
    });

    it(
      "returns labels as array of key and value",
      marbles(m => {
        const result$ = resolvers({
          fetchJobDetail: () =>
            of({
              response: {
                ...defaultJobDetailData,
                labels: {
                  foo: "bar",
                  baz: "nice"
                }
              }
            }),
          pollingInterval: m.time("-|")
        }).Query.job({}, { id: "xyz" });

        m.expect(
          result$.pipe(
            take(1),
            map(response => response.labels)
          )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ lastRunStatus }) => lastRunStatus.status)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ lastRunStatus }) => lastRunStatus.time)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  history: {
                    lastFailureAt: null,
                    lastSuccessAt: null,
                    successCount: 0,
                    failureCount: 0,
                    successfulFinishedRuns: [],
                    failedFinishedRuns: []
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ lastRunStatus }) => lastRunStatus.status)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData,
                  history: {
                    lastFailureAt: null,
                    lastSuccessAt: null,
                    successCount: 0,
                    failureCount: 0,
                    successfulFinishedRuns: [],
                    failedFinishedRuns: []
                  }
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ lastRunStatus }) => lastRunStatus.time)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
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
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ lastRunStatus }) => lastRunStatus.status)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ lastRunStatus }) => lastRunStatus)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
                  ...defaultJobDetailData
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ schedules }) => schedules)
            )
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
          const result$ = resolvers({
            fetchJobDetail: () =>
              of({
                response: {
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
                }
              }),
            pollingInterval: m.time("-|")
          }).Query.job({}, { id: "xyz" });

          m.expect(
            result$.pipe(
              take(1),
              map(({ schedules }) => schedules)
            )
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
        const result$ = resolvers({
          runJob: () =>
            of({
              response: {
                jobId: "bestJobEver",
                somethingElse: true
              }
            })
        }).Mutation.runJob({}, { id: "bestJobEver" });

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold("(x|)", {
            x: {
              jobId: "bestJobEver"
            }
          })
        );
      })
    );

    it(
      "throws when arguments are missing",
      marbles(m => {
        const result$ = resolvers({
          runjob: () => {}
        }).Mutation.runJob({}, {});

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold(
            "#",
            {},
            {
              response: {
                message: "runJob requires the `id` of the job to run"
              }
            }
          )
        );
      })
    );
  });

  describe("deleteJob", () => {
    it(
      "returns a JobLink shaped object",
      marbles(m => {
        const result$ = resolvers({
          deleteJob: () =>
            of({
              response: {
                jobId: "bestJobEver",
                somethingElse: true
              }
            })
        }).Mutation.deleteJob(
          {},
          { id: "bestJobEver", stopCurrentJobRuns: false }
        );

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold("(x|)", {
            x: {
              jobId: "bestJobEver"
            }
          })
        );
      })
    );

    it(
      "throws when arguments are missing",
      marbles(m => {
        const result$ = resolvers({
          deleteJob: () => {}
        }).Mutation.deleteJob({}, {});

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold(
            "#",
            {},
            {
              response: {
                message:
                  "deleteJob requires both `id` and `stopCurrentJobRuns` to be provided!"
              }
            }
          )
        );
      })
    );
  });

  describe("stopJobRun", () => {
    it(
      "returns a JobLink shaped object",
      marbles(m => {
        const result$ = resolvers({
          stopJobRun: () =>
            of({
              response: {
                jobId: "bestJobEver",
                somethingElse: true
              }
            })
        }).Mutation.stopJobRun(
          {},
          { id: "bestJobEver", jobRunId: "theBestRun" }
        );

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold("(x|)", {
            x: {
              jobId: "bestJobEver"
            }
          })
        );
      })
    );

    it(
      "throws when arguments are missing",
      marbles(m => {
        const result$ = resolvers({
          stopJobRun: () => {}
        }).Mutation.stopJobRun({}, {});

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold(
            "#",
            {},
            {
              response: {
                message:
                  "stopJobRun requires both `id` and `jobRunId` to be provided!"
              }
            }
          )
        );
      })
    );
  });

  describe("updateSchedule", () => {
    it(
      "returns a JobLink shaped object",
      marbles(m => {
        const result$ = resolvers({
          updateSchedule: () =>
            of({
              response: {
                jobId: "bestJobEver",
                somethingElse: true
              }
            })
        }).Mutation.updateSchedule({}, { id: "bestJobEver", data: {} });

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold("(x|)", {
            x: {
              jobId: "bestJobEver"
            }
          })
        );
      })
    );

    it(
      "throws when arguments are missing",
      marbles(m => {
        const result$ = resolvers({
          updateSchedule: () => {}
        }).Mutation.updateSchedule({}, {});

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold(
            "#",
            {},
            {
              response: {
                message:
                  "updateSchedule requires the `id` and `data` of the job to run"
              }
            }
          )
        );
      })
    );
  });

  describe("updateJob", () => {
    const jobData = {
      id: "bestJobEver"
    };

    it(
      "returns a JobDetailResponse shaped object",
      marbles(m => {
        const result$ = resolvers({
          updateJob: (_id, data) => of({ response: data })
        }).Mutation.updateJob({}, { id: "bestJobEver", data: jobData });

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold("(x|)", {
            x: jobData
          })
        );
      })
    );

    it(
      "throws when arguments are missing",
      marbles(m => {
        const result$ = resolvers({
          update: () => {}
        }).Mutation.updateJob({}, {});

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold(
            "#",
            {},
            {
              response: {
                message:
                  "updateJob requires both `id` and `data` to be provided!"
              }
            }
          )
        );
      })
    );
  });

  describe("createJob", () => {
    const jobData = {
      id: "bestJobEver"
    };

    it(
      "returns a JobDetailResponse shaped object",
      marbles(m => {
        const result$ = resolvers({
          createJob: data => of({ response: data })
        }).Mutation.createJob({}, { data: jobData });

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold("(x|)", {
            x: jobData
          })
        );
      })
    );

    it(
      "throws when arguments are missing",
      marbles(m => {
        const result$ = resolvers({
          createJob: () => {}
        }).Mutation.createJob({}, {});

        m.expect(result$.pipe(take(1))).toBeObservable(
          m.cold(
            "#",
            {},
            {
              response: {
                message: "createJob requires `data` to be provided!"
              }
            }
          )
        );
      })
    );
  });
});
