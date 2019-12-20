import JobTask from "../JobTask";

describe("Job", () => {
  describe("#getDateStarted", () => {
    it("returns null if startedAt is undefined", () => {
      const jobTask = new JobTask({ foo: "bar" });
      expect(jobTask.getDateStarted()).toEqual(null);
    });

    it("parses the time-zone format from API", () => {
      const jobTask = new JobTask({ startedAt: "1990-01-03T02:00:00Z-1" });
      expect(jobTask.getDateStarted()).toEqual(631332000000);
    });
  });

  describe("#getDateCompleted", () => {
    it("returns null if completedAt is undefined", () => {
      const jobTask = new JobTask({ foo: "bar" });
      expect(jobTask.getDateCompleted()).toEqual(null);
    });

    it("parses the time-zone format from API", () => {
      const jobTask = new JobTask({ completedAt: "1990-01-03T02:00:00Z-1" });
      expect(jobTask.getDateCompleted()).toEqual(631332000000);
    });
  });

  describe("#getTaskID", () => {
    it("returns the id", () => {
      const jobTask = new JobTask({ id: "foo" });
      expect(jobTask.getTaskID()).toEqual("foo");
    });
  });

  describe("#getStatus", () => {
    it("returns the id", () => {
      const jobTask = new JobTask({ status: "foo" });
      expect(jobTask.getStatus()).toEqual("foo");
    });
  });
});
