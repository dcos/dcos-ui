const JobTask = require("../JobTask");

describe("Job", function() {
  describe("#getDateStarted", function() {
    it("should return null if startedAt is undefined", function() {
      const jobTask = new JobTask({ foo: "bar" });
      expect(jobTask.getDateStarted()).toEqual(null);
    });

    it("should properly parse the time-zone format from API", function() {
      const jobTask = new JobTask({ startedAt: "1990-01-03T02:00:00Z-1" });
      expect(jobTask.getDateStarted()).toEqual(631332000000);
    });
  });

  describe("#getDateCompleted", function() {
    it("should return null if completedAt is undefined", function() {
      const jobTask = new JobTask({ foo: "bar" });
      expect(jobTask.getDateCompleted()).toEqual(null);
    });

    it("should properly parse the time-zone format from API", function() {
      const jobTask = new JobTask({ completedAt: "1990-01-03T02:00:00Z-1" });
      expect(jobTask.getDateCompleted()).toEqual(631332000000);
    });
  });

  describe("#getTaskID", function() {
    it("should return the id", function() {
      const jobTask = new JobTask({ id: "foo" });
      expect(jobTask.getTaskID()).toEqual("foo");
    });
  });

  describe("#getStatus", function() {
    it("should return the id", function() {
      const jobTask = new JobTask({ status: "foo" });
      expect(jobTask.getStatus()).toEqual("foo");
    });
  });
});
