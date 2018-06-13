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
    failureCount: 0,
    lastSuccessAt: "2018-06-06T10:49:44.471+0000",
    lastFailureAt: null,
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
  describe("jobs", () => {
    it("polls the endpoint");
    it("waits for running requests to finish before sending new ones");

    // TODO: write this part in greater detail
    it("returns a JobsConnection");

    describe("ordering", () => {
      it("orders by ID");
      it("orders by STATUS");
      it("orders by LAST_RUN");
    });

    describe("filter", () => {
      it("filters by ID");
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
    it("waits for running requests to finish before sending new ones");

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
                    status: "foo",
                    createdAt: "1985-01-03t00:00:00z-1"
                  },
                  {
                    status: "bar",
                    createdAt: "1990-01-03t00:00:00z-1"
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
        "returns scheduled if there are no active runs and the schedule is enabled",
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
                    { jobId: "1", createdAt: "1990-01-03T00:00:00Z-1" },
                    { jobId: "2", createdAt: "1985-01-03T00:00:00Z-1" },
                    { jobId: "3", createdAt: "1995-01-03T00:00:00Z-1" }
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
                    { jobId: "1", createdAt: "1990-01-03T00:00:00Z-1" },
                    { jobId: "2", createdAt: null },
                    { jobId: "3", createdAt: "1995-01-03T00:00:00Z-1" }
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
                    { jobId: "1", createdAt: "1990-01-03T00:00:00Z-1" },
                    { jobId: "2", createdAt: null },
                    { jobId: "3", createdAt: "1995-01-03T00:00:00Z-1" }
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
                        id: "20180612162535qXvcx"
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
                        id: "20180612162535qXvcx"
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
                      id: "2",
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
      it("contains same information for each type");
    });

    // describe("lastRuns");
    // describe("lastRunsSummary");
    // describe("lastRunStatus");
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
              x: []
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
              x: [
                {
                  cron: "* * * * *",
                  enabled: false,
                  id: "default",
                  startingDeadlineSeconds: 900,
                  timezone: "UTC"
                }
              ]
            })
          );
        })
      );
    });
  });
});
