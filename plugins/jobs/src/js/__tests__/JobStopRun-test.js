import { stopSingleJobRun } from "../JobStopRun";

const handlerMock = jest.fn();
const jobId = "echo";
const job = { jobId };
const onSuccess = () => {};

describe("JobStopRun", function() {
  beforeEach(function() {
    handlerMock.mockReset();
  });

  describe("#singleJobDeletion", function() {
    describe("triggers deletion", function() {
      it("when there is a single jobRun", function() {
        const jobRuns = [job];

        stopSingleJobRun(handlerMock, jobId, jobRuns, onSuccess);

        expect(handlerMock).toHaveBeenCalledWith(jobId, job, onSuccess);
      });
    });

    describe("does not trigger deletion", function() {
      it("when there is no JobRun", function() {
        const jobRuns = [];

        stopSingleJobRun(handlerMock, jobId, jobRuns, onSuccess);

        expect(handlerMock).not.toHaveBeenCalled();
      });

      it("when there is more than one JobRun", function() {
        const jobRuns = [job, job];

        stopSingleJobRun(handlerMock, jobId, jobRuns, onSuccess);

        expect(handlerMock).not.toHaveBeenCalled();
      });
    });
  });
});
