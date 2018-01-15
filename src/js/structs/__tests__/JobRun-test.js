const JobRun = require("../JobRun");
const JobTaskList = require("../JobTaskList");

describe("JobRun", function() {
  describe("#getDateCreated", function() {
    it("returns null if createdAt is undefined", function() {
      const activeRun = new JobRun({ foo: "bar" });
      expect(activeRun.getDateCreated()).toEqual(null);
    });

    it("returns the correct value in milliseconds", function() {
      const activeRun = new JobRun({ createdAt: "1990-01-03T02:00:00Z-1" });
      expect(activeRun.getDateCreated()).toEqual(631332000000);
    });
  });

  describe("#getDateFinished", function() {
    it("returns null if finishedAt is undefined", function() {
      const activeRun = new JobRun({ foo: "bar" });
      expect(activeRun.getDateFinished()).toEqual(null);
    });

    it("returns the correct value in milliseconds", function() {
      const activeRun = new JobRun({ finishedAt: "1990-01-03T02:00:00Z-1" });
      expect(activeRun.getDateFinished()).toEqual(631332000000);
    });
  });

  describe("#getJobID", function() {
    it("returns the jobId", function() {
      const activeRun = new JobRun({ jobId: "foo" });
      expect(activeRun.getJobID()).toEqual("foo");
    });
  });

  describe("#getStatus", function() {
    it("returns the id", function() {
      const activeRun = new JobRun({ status: "foo" });
      expect(activeRun.getStatus()).toEqual("foo");
    });
  });

  describe("#getTasks", function() {
    it("returns an instance of JobTaskList", function() {
      const activeRun = new JobRun({ id: "foo", tasks: [] });
      expect(activeRun.getTasks() instanceof JobTaskList).toBeTruthy();
    });
  });
});
