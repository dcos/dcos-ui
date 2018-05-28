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

import * as MetronomeClient from "../MetronomeClient";
import Config from "../../config/Config";

describe("MetronomeClient", () => {
  const jobId = "my/awesome/job/id";
  const jobRunId = "my/awesome/job/id.1990-01-03t00:00:00z-1";
  const jobData = {
    id: "/myJob/is/the/best",
    run: {
      cpus: 0.1,
      mem: 42,
      disk: 0
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
      MetronomeClient.createJob(jobData);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.createJob(jobData);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v0/scheduled-jobs`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      MetronomeClient.createJob(jobData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        body: expect.anything(),
        method: "POST",
        headers: expect.anything()
      });
    });

    it("sends request with the correct stringified data", () => {
      MetronomeClient.createJob(jobData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        body: JSON.stringify(jobData),
        method: expect.anything(),
        headers: expect.anything()
      });
    });

    it(
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

        const expected$ = m.cold("--j|", {
          j: jobData
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.createJob(jobData);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#fetchJobs", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(Observable.of({}));
      MetronomeClient.fetchJobs();
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      mockRequest.mockReturnValueOnce(Observable.of({}));
      MetronomeClient.fetchJobs();
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
        const expected$ = m.cold("--j|", {
          j: [jobData, jobData]
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.fetchJobs();
        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#fetchJobDetail", () => {
    it("makes a request", () => {
      MetronomeClient.fetchJobDetail(jobId);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.fetchJobDetail(jobId);
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
          j: jobData
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.fetchJobDetail(jobId);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#deleteJob", () => {
    it("makes a request", () => {
      MetronomeClient.deleteJob(jobId, true);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.deleteJob(jobId, true);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}?stopCurrentJobRuns=true`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      MetronomeClient.deleteJob(jobId, true);
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
          j: null
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.deleteJob(jobId, true);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#updateJob", () => {
    it("makes a request", () => {
      MetronomeClient.updateJob(jobId, jobData);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.updateJob(jobId, jobData);
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v0/scheduled-jobs/${jobId}?embed=activeRuns&embed=history&embed=schedules`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      MetronomeClient.updateJob(jobId, jobData);
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        method: "PUT",
        body: JSON.stringify(jobData),
        headers: expect.anything()
      });
    });

    it(
      "emits the sucessful request result",
      marbles(m => {
        m.bind();

        const expected$ = m.cold("--j|", {
          j: jobData
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.updateJob(jobId, jobData);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#runJob", () => {
    it("makes a request", () => {
      MetronomeClient.runJob(jobId);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.runJob(jobId);
      expect(mockRequest).toHaveBeenCalledWith(
        `${
          Config.metronomeAPI
        }/v1/jobs/${jobId}/runs?embed=activeRuns&embed=history&embed=schedules`,
        expect.anything()
      );
    });

    it("sends a POST request", () => {
      MetronomeClient.runJob(jobId);
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
          j: null
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.runJob(jobId);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#stopJobRun", () => {
    it("makes a request", () => {
      MetronomeClient.stopJobRun(jobId, jobRunId);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.stopJobRun(jobId, jobRunId);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}/runs/${jobRunId}/actions/stop`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      MetronomeClient.stopJobRun(jobId, jobRunId);
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
          j: null
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.stopJobRun(jobId, jobRunId);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });

  describe("#updateSchedule", () => {
    it("makes a request", () => {
      MetronomeClient.updateSchedule(jobId, scheduleData);
      expect(mockRequest).toHaveBeenCalled();
    });

    it("sends data to the correct URL", () => {
      MetronomeClient.updateSchedule(jobId, scheduleData);
      expect(mockRequest).toHaveBeenCalledWith(
        `${Config.metronomeAPI}/v1/jobs/${jobId}/schedules/my-schedule-data`,
        expect.anything()
      );
    });

    it("sends request with the correct method", () => {
      MetronomeClient.updateSchedule(jobId, scheduleData);
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
          j: null
        });

        mockRequest.mockReturnValueOnce(expected$);
        const result$ = MetronomeClient.updateSchedule(jobId, scheduleData);

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
