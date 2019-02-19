const mockRequest = jest.fn(() => of("test"));
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

// TODO: remove this disable with https://jira.mesosphere.com/browse/DCOS_OSS-3579
// tslint:disable:no-submodule-imports
import { of } from "rxjs";
import { tap } from "rxjs/operators";
import { marbles, observe } from "rxjs-marbles/jest";
// tslint:enable
import {
  fetchJobDetail,
  fetchJobs,
  createJob,
  updateJob,
  updateSchedule,
  runJob,
  deleteJob,
  stopJobRun,
  JobResponse,
  JobDetailResponse
} from "../MetronomeClient";
import Config from "../../config/Config";
import { RestartPolicyOptions } from "plugins/jobs/src/js/components/form/helpers/JobFormData";

describe("MetronomeClient", () => {
  const jobId = "my/awesome/job/id";
  const jobRunId = "my/awesome/job/id.1990-01-03t00:00:00z-1";
  const restartPolicy: RestartPolicyOptions = "NEVER";

  const job = {
    id: "testid",
    labels: {},
    run: {
      cpus: 0.01,
      mem: 128,
      disk: 0,
      cmd: "sleep 10",
      maxLaunchDelay: 3600,
      restart: {
        policy: restartPolicy
      },
      volumes: [],
      env: {},
      placement: {
        constraints: []
      },
      artifacts: [],
      secrets: {}
    }
  };
  const jobData: JobResponse = {
    ...job,
    schedules: [],
    historySummary: {
      failureCount: 0,
      lastFailureAt: null,
      lastSuccessAt: "2018-06-07T11:48:17.278+0000",
      successCount: 90
    }
  };

  const jobDetailData: JobDetailResponse = {
    ...job,
    description: "test description",
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
  const createUpdateV1Data = {
    job,
    schedule: undefined
  };
  const scheduleData = {
    id: "my-schedule-data",
    cron: "0 4 * * *"
  };
  const createUpdateWithSchedule = {
    job,
    schedule: scheduleData
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("#createJob", () => {
    it("makes a request", () => {
      createJob(createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      createJob(createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      createJob(createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        body: expect.anything(),
        method: "POST",
        headers: expect.anything()
      });
    });

    it("sends request with the correct stringified data", () => {
      createJob(createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        body: JSON.stringify(createUpdateV1Data.job),
        method: expect.anything(),
        headers: expect.anything()
      });
    });

    it(
      "sends 2 requests if schedule is present",
      observe(() => {
        return createJob(createUpdateWithSchedule).pipe(
          tap(() => expect(mockRequest).toHaveBeenCalledTimes(2))
        );
      })
    );

    it(
      "sends schedule request to correct URL if schedule is present",
      observe(() => {
        return createJob(createUpdateWithSchedule).pipe(
          tap(() =>
            expect(mockRequest).toHaveBeenLastCalledWith(
              `${Config.metronomeAPI}/v1/jobs/${
                createUpdateWithSchedule.job.id
              }/schedules`,
              expect.anything()
            )
          )
        );
      })
    );

    it(
      "sends schedule request with correct data if schedule is present",
      observe(() => {
        return createJob(createUpdateWithSchedule).pipe(
          tap(() =>
            expect(mockRequest).toHaveBeenLastCalledWith(expect.anything(), {
              body: JSON.stringify(createUpdateWithSchedule.schedule),
              method: "POST",
              headers: expect.anything()
            })
          )
        );
      })
    );

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: {
            response: jobDetailData,
            code: 200,
            message: "ok"
          }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = createJob(createUpdateV1Data);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#fetchJobs", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(of({}));
      fetchJobs();
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      mockRequest.mockReturnValueOnce(of({}));
      fetchJobs();
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v1/jobs?embed=activeRuns&embed=schedules&embed=historySummary`
      );
    });

    it(
      "emits an event if the data is received",
      marbles(m => {
        const expectedResult = [jobData, jobData] as JobResponse[];
        const expected$ = m.cold("--j|", {
          j: {
            response: expectedResult,
            code: 200,
            message: "ok"
          }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = fetchJobs();
        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#fetchJobDetail", () => {
    it("makes a request", () => {
      fetchJobDetail(jobId);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      fetchJobDetail(jobId);
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v1/jobs/${jobId}?embed=activeRuns&embed=history&embed=schedules`
      );
    });

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: {
            response: jobDetailData as JobDetailResponse,
            code: 200,
            message: "ok"
          }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = fetchJobDetail(jobId);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#deleteJob", () => {
    it("makes a request", () => {
      deleteJob(jobId, true);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      deleteJob(jobId, true);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}?stopCurrentJobRuns=true`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      deleteJob(jobId, true);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        method: "DELETE",
        headers: expect.anything()
      });
    });

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: { response: null, code: 200, message: "ok" }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = deleteJob(jobId, true);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#updateJob", () => {
    it("makes a request", () => {
      updateJob(jobId, createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      updateJob(jobId, createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      updateJob(jobId, createUpdateV1Data);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        method: "PUT",
        body: JSON.stringify(createUpdateV1Data.job),
        headers: expect.anything()
      });
    });

    it(
      "sends 2 requests if schedule is present",
      observe(() => {
        const {
          job: { id }
        } = createUpdateWithSchedule;
        return updateJob(id, createUpdateWithSchedule).pipe(
          tap(() => expect(mockRequest).toHaveBeenCalledTimes(2))
        );
      })
    );

    it(
      "sends schedule request to correct URL if schedule is present",
      observe(() => {
        const {
          job: { id }
        } = createUpdateWithSchedule;
        return updateJob(id, createUpdateWithSchedule).pipe(
          tap(() =>
            expect(mockRequest).toHaveBeenLastCalledWith(
              `${Config.metronomeAPI}/v1/jobs/${
                createUpdateWithSchedule.job.id
              }/schedules/${createUpdateWithSchedule.schedule.id}`,
              expect.anything()
            )
          )
        );
      })
    );

    it(
      "sends schedule request with correct data if schedule is present",
      observe(() => {
        const {
          job: { id }
        } = createUpdateWithSchedule;
        return updateJob(id, createUpdateWithSchedule).pipe(
          tap(() =>
            expect(mockRequest).toHaveBeenLastCalledWith(expect.anything(), {
              body: JSON.stringify(createUpdateWithSchedule.schedule),
              method: "PUT",
              headers: expect.anything()
            })
          )
        );
      })
    );

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: { response: jobDetailData, code: 200, message: "ok" }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = updateJob(jobId, createUpdateV1Data);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#runJob", () => {
    it("makes a request", () => {
      runJob(jobId);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      runJob(jobId);
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v1/jobs/${jobId}/runs?embed=activeRuns&embed=history&embed=schedules`,
        expect.anything()
      );
    });

    it("sends a POST request", () => {
      runJob(jobId);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        headers: expect.anything(),
        method: "POST",
        body: "{}"
      });
    });

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: { response: null, code: 200, message: "ok" }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = runJob(jobId);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#stopJobRun", () => {
    it("makes a request", () => {
      stopJobRun(jobId, jobRunId);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      stopJobRun(jobId, jobRunId);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}/runs/${jobRunId}/actions/stop`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      stopJobRun(jobId, jobRunId);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        method: "POST",
        headers: expect.anything(),
        body: "{}"
      });
    });

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: { response: null, code: 200, message: "ok" }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = stopJobRun(jobId, jobRunId);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#updateSchedule", () => {
    it("makes a request", () => {
      updateSchedule(jobId, scheduleData);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      updateSchedule(jobId, scheduleData);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}/schedules/my-schedule-data`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      updateSchedule(jobId, scheduleData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        method: "PUT",
        headers: expect.anything(),
        body: JSON.stringify(scheduleData)
      });
    });

    it(
      "emits the successful request result",
      marbles(m => {
        const expected$ = m.cold("--j|", {
          j: { response: null, code: 200, message: "ok" }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = updateSchedule(jobId, scheduleData);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
