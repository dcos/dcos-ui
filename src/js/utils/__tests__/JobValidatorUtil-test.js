import JobValidatorUtil from "../JobValidatorUtil";

describe("JobValidatorUtil", () => {
  describe("#isValidJobID", () => {
    it("handles empty strings", () => {
      expect(JobValidatorUtil.isValidJobID("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(JobValidatorUtil.isValidJobID()).toBe(false);
    });

    it("handles white spaces", () => {
      expect(JobValidatorUtil.isValidJobID("white space")).toBe(false);
    });

    it("handles illegal characters", () => {
      expect(JobValidatorUtil.isValidJobID("Uppercase")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job#1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job_1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job%1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job+1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job*1")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job(1)")).toBe(false);
    });

    it("handles multiple dots", () => {
      expect(JobValidatorUtil.isValidJobID("job..id")).toBe(false);
      expect(JobValidatorUtil.isValidJobID("job..id....")).toBe(false);
    });

    it("handles ending dots", () => {
      expect(JobValidatorUtil.isValidJobID("job.")).toBe(false);
    });

    it("accepts correct characters", () => {
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

  describe("#isValidCronSchedule", () => {
    it("handles empty strings", () => {
      expect(JobValidatorUtil.isValidCronSchedule("")).toBe(false);
    });

    it("handles undefined values", () => {
      expect(JobValidatorUtil.isValidCronSchedule()).toBe(false);
    });

    it("accepts only 5 components", () => {
      expect(JobValidatorUtil.isValidCronSchedule("*")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* * * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("* * * * *")).toBe(true);
      expect(JobValidatorUtil.isValidCronSchedule("* * * * * *")).toBe(false);
    });

    it("handles valid characters", () => {
      expect(
        JobValidatorUtil.isValidCronSchedule(
          "* 1-10 4,5,6,7 1/1 1-2/3,4,5,6-10"
        )
      ).toBe(true);
    });

    it("handles components that do not start with a number or *", () => {
      expect(JobValidatorUtil.isValidCronSchedule("-1 * * * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule("/2 * * * *")).toBe(false);
      expect(JobValidatorUtil.isValidCronSchedule(",2 * * * *")).toBe(false);
    });
  });
});
