jest.mock("data-service");
const jobsRunNow = require("../JobsRunNow");

describe("Jobs Run Now Action", function() {
  it("runNowEvent call is made with onItemSelect", function(done) {
    const jobsRunNowAction = jobsRunNow.jobsRunNowAction("test");
    jobsRunNow.runNowEvent$.subscribe(job => {
      expect(job.id).toBe("test");
      done();
    });
    jobsRunNowAction.onItemSelect();
  });
});
