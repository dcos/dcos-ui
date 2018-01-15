const JobValidatorUtil = require("../JobValidatorUtil");

describe("JobValidatorUtil", function() {
  describe("#isValidJobID", function() {
    it("handles empty strings", function() {
      expect(JobValidatorUtil.isValidJobID("")).toBe(false);
    });

    it("handles undefined values", function() {
      expect(JobValidatorUtil.isValidJobID()).toBe(false);
    });

    it("handles white spaces", function() {
      expect(JobValidatorUtil.isValidJobID("white space")).toBe(false);
    });

    it("handles illegal characters", function() {
      expect(JobValidatorUtil.isValidJobID("Uppercase")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job#1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job_1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job%1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job+1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job*1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job(1)")).toBe(false);
    });

    it("handles multiple dots", function() {
      expect(JobValidatorUtil.isValidJobID("job..id")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job..id....")).toBe(false);
    });

    it("handles ending dots", function() {
      expect(JobValidatorUtil.isValidJobID("job.")).toBe(false);
    });

    it("accepts correct characters", function() {
      expect(JobValidatorUtil.isValidJobID("4")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("a")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job1234")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("123job")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job.4")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job.a")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job.1234")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job.1job")).toBe(true);
      expect(JobValidatorUtil.isValidJobID("job.job456")).toBe(true);
    });
  });

  describe("#isValidCronSchedule", function() {
    it("handles empty strings", function() {
      expect(JobValidatorUtil.isValidCronSchedule("")).toBe(false);
    });

    it("handles undefined values", function() {
      expect(JobValidatorUtil.isValidCronSchedule()).toBe(false);
    });

    it("accepts only 5 components", function() {
      expect(JobValidatorUtil.isValidCronSchedule("*")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* * * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* * * * *")).toBe(true);
      expect(JobValidatorUtil.isValidCronSchedule("* * * * * *")).toBe(false);
    });

    it("handles valid characters", function() {
      expect(
        JobValidatorUtil.isValidCronSchedule(
          "* 1-10 4,5,6,7 1/1 1-2/3,4,5,6-10"
        )
      ).toBe(true);
    });

    it("handles components that do not start with a number or *", function() {
      expect(JobValidatorUtil.isValidCronSchedule("-1 * * * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("/2 * * * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule(",2 * * * *")).toBe(false);
    });
  });
});
