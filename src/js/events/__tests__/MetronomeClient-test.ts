const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

// TODO: remove this disable with https://jira.mesosphere.com/browse/DCOS_OSS-3579
// tslint:disable:no-submodule-imports
import { marbles } from "rxjs-marbles/jest";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/take";
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

describe("MetronomeClient", () => {
  const jobId = "my/awesome/job/id";
  const jobRunId = "my/awesome/job/id.1990-01-03t00:00:00z-1";

  const jobData: JobResponse = {
    id: "testid",
    labels: {},
    run: {
      cpus: 0.01,
      mem: 128,
      disk: 0,
      cmd: "sleep 10",
      maxLaunchDelay: 3600,
      restart: {
        policy: "NEVER"
      },
      volumes: [],
      env: {},
      placement: {
        constraints: []
      },
      artifacts: [],
      secrets: {}
    },
    schedules: [],
    historySummary: {
      failureCount: 0,
      lastFailureAt: null,
      lastSuccessAt: "2018-06-07T11:48:17.278+0000",
      successCount: 90
    }
  };

  const jobDetailData: JobDetailResponse = {
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
  const scheduleData = {
    id: "my-schedule-data"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("#createJob", () => {
    it("makes a request", () => {
      createJob(jobDetailData);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      createJob(jobDetailData);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v0/scheduled-jobs`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      createJob(jobDetailData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        body: expect.anything(),
        method: "POST",
        headers: expect.anything()
      });
    });

    it("sends request with the correct stringified data", () => {
      createJob(jobDetailData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        body: JSON.stringify(jobDetailData),
        method: expect.anything(),
        headers: expect.anything()
      });
    });

    it(
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

        const expected$ = m.cold("--j|", {
          j: {
            response: jobDetailData,
            code: 200,
            message: "ok"
          }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = createJob(jobDetailData);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#fetchJobs", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(Observable.of({}));
      fetchJobs();
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      mockRequest.mockReturnValueOnce(Observable.of({}));
      fetchJobs();
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v1/jobs?embed=activeRuns&embed=schedules&embed=historySummary`,
        { headers: expect.anything() }
      );
    });

    it(
      "emits an event if the data is received",
      marbles(m => {
        m.bind();
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
        }/v1/jobs/${jobId}?embed=activeRuns&embed=history&embed=schedules`,
        { headers: expect.anything() }
      );
    });

    it(
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

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
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

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
      updateJob(jobId, jobDetailData);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      updateJob(jobId, jobDetailData);
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v0/scheduled-jobs/${jobId}?embed=activeRuns&embed=history&embed=schedules`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      updateJob(jobId, jobDetailData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        method: "PUT",
        body: JSON.stringify(jobDetailData),
        headers: expect.anything()
      });
    });

    it(
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

        const expected$ = m.cold("--j|", {
          j: { response: jobDetailData, code: 200, message: "ok" }
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = updateJob(jobId, jobDetailData);

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
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

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
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

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
        m.bind();

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
