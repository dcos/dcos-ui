const MetronomeUtil = require("../MetronomeUtil");

let thisJobs, thisJob;

describe("MetronomeUtil", () => {
  describe("#parseJobs", () => {
    beforeEach(() => {
      thisJobs = MetronomeUtil.parseJobs([
        { id: "name.foo" },
        { id: "name.bar" },
        { id: "name.alpha" },
        { id: "name.beta", cmd: "./beta", description: "First beta" },
        { id: "name.beta", label: "Beta", description: "Second beta" },
        { id: "name.wibble.wobble" }
      ]);
    });

    it("throws an error if the provided id  starts with a dot", () => {
      expect(() => {
        MetronomeUtil.parseJobs({ id: ".malformed.id" });
      }).toThrow();
    });

    it("throws an error if the provided id ends with a dot", () => {
      expect(() => {
        MetronomeUtil.parseJobs({ id: "malformed.id." });
      }).toThrow();
    });

    it("adds a job to the namespace", () => {
      var jobs = MetronomeUtil.parseJobs({ id: "alpha" });

      expect(jobs.items[0].id).toEqual("alpha");
    });

    it("adds nested items at the correct location based on id/path matching", () => {
      var jobs = MetronomeUtil.parseJobs({ id: "name.foo.bar" });

      expect(jobs.items[0].id).toEqual("name");
      expect(jobs.items[0].items[0].id).toEqual("name.foo");
      expect(jobs.items[0].items[0].items[0].id).toEqual("name.foo.bar");
    });

    it("throws an error if item is not an object with id", () => {
      expect(() => {
        MetronomeUtil.parseJobs({});
      }).toThrow();
      expect(() => {
        MetronomeUtil.parseJobs(NaN);
      }).toThrow();
      expect(() => {
        MetronomeUtil.parseJobs();
      }).toThrow();
    });

    it("returns root namespace if empty array is passed", () => {
      const jobs = MetronomeUtil.parseJobs([]);

      expect(jobs.id).toEqual("");
      expect(jobs.items).toEqual([]);
    });

    it("nests everything under root", () => {
      expect(thisJobs.id).toEqual("");
      expect(thisJobs.items.length).toEqual(1);
    });

    it("consolidates jobs into common parent", () => {
      expect(thisJobs.items[0].id).toEqual("name");
    });

    it("sets correct namespace id", () => {
      expect(thisJobs.items[0].id).toEqual("name");
    });

    it("accepts nested namespaces", () => {
      expect(thisJobs.items[0].items[4].items.length).toEqual(1);
    });

    it("doesn't add items to jobs with no nested items", () => {
      expect(thisJobs.items[0].items[2].items).toEqual(undefined);
    });

    it("converts a single item into a subitem of root", () => {
      const jobs = MetronomeUtil.parseJobs({ id: "name.job" });

      expect(jobs.id).toEqual("");
      expect(jobs.items[0].id).toEqual("name");
      expect(jobs.items[0].items[0].id).toEqual("name.job");
    });

    it("merges data of items that are defined multiple times", () => {
      const jobs = thisJobs.items[0].items[3];
      expect(jobs).toEqual({
        id: "name.beta",
        cmd: "./beta",
        label: "Beta",
        description: "Second beta"
      });
    });

    it("doesn't merge jobs and namespaces", () => {
      const jobs = MetronomeUtil.parseJobs([
        { id: "name.foo", cmd: "./foo" },
        { id: "name.foo.bar", cmd: "./bar" }
      ]);

      expect(jobs).toEqual({
        id: "",
        items: [
          {
            id: "name",
            items: [
              { id: "name.foo", cmd: "./foo" },
              {
                id: "name.foo",
                items: [{ id: "name.foo.bar", cmd: "./bar" }]
              }
            ]
          }
        ]
      });
    });

    it("applies parse job to all jobs", () => {
      const fooSpec = {
        id: "foo",
        history: {
          failedFinishedRuns: [
            {
              createdAt: "1990-01-02T12:10:59.571+0000",
              finishedAt: "1990-01-02T12:11:19.762+0000",
              id: "20160705121059J7cPJ"
            }
          ],
          successfulFinishedRuns: [
            {
              createdAt: "1990-01-02T12:10:59.571+0000",
              finishedAt: "1990-01-02T12:11:19.762+0000",
              id: "20160705121059J7cPJ"
            }
          ]
        }
      };

      const barSpec = {
        id: "bar",
        cmd: "./bar",
        label: "Label",
        description: "Description"
      };

      expect(MetronomeUtil.parseJobs([fooSpec, barSpec])).toEqual({
        id: "",
        items: [
          MetronomeUtil.parseJob(fooSpec),
          MetronomeUtil.parseJob(barSpec)
        ]
      });
    });
  });

  describe("#parseJob", () => {
    beforeEach(() => {
      thisJob = MetronomeUtil.parseJob({
        id: "foo",
        history: {
          failedFinishedRuns: [
            {
              createdAt: "1990-01-02T12:10:59.571+0000",
              finishedAt: "1990-01-02T12:11:19.762+0000",
              id: "20160705121059J7cPJ"
            }
          ],
          successfulFinishedRuns: [
            {
              createdAt: "1990-01-02T12:10:59.571+0000",
              finishedAt: "1990-01-02T12:11:19.762+0000",
              id: "20160705121059J7cPJ"
            }
          ]
        }
      });
    });

    it("does nothing if history is undefined", () => {
      const job = MetronomeUtil.parseJob({ id: "foo" });

      expect(job).toEqual({ id: "foo" });
    });

    it("adds the proper status to the failed finished runs", () => {
      expect(thisJob.history.failedFinishedRuns[0].status).toEqual("FAILED");
    });

    it("adds the job id to the failed finished runs", () => {
      expect(thisJob.history.failedFinishedRuns[0].jobId).toEqual("foo");
    });

    it("adds the proper status to the successful finished runs", () => {
      expect(thisJob.history.successfulFinishedRuns[0].status).toEqual(
        "COMPLETED"
      );
    });

    it("adds the job id to the successful finished runs", () => {
      expect(thisJob.history.successfulFinishedRuns[0].jobId).toEqual("foo");
    });
  });
});
