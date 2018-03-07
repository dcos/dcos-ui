const MetronomeUtil = require("../MetronomeUtil");

let thisJobs, thisJob;

describe("MetronomeUtil", function() {
  describe("#parseJobs", function() {
    beforeEach(function() {
      thisJobs = MetronomeUtil.parseJobs([
        { id: "name.foo" },
        { id: "name.bar" },
        { id: "name.alpha" },
        { id: "name.beta", cmd: "./beta", description: "First beta" },
        { id: "name.beta", label: "Beta", description: "Second beta" },
        { id: "name.wibble.wobble" }
      ]);
    });

    it("throws an error if the provided id  starts with a dot", function() {
      expect(function() {
        MetronomeUtil.parseJobs({ id: ".malformed.id" });
      }).toThrow();
    });

    it("throws an error if the provided id ends with a dot", function() {
      expect(function() {
        MetronomeUtil.parseJobs({ id: "malformed.id." });
      }).toThrow();
    });

    it("adds a job to the namespace", function() {
      var jobs = MetronomeUtil.parseJobs({ id: "alpha" });

      expect(jobs.items[0].id).toEqual("alpha");
    });

    it("adds nested items at the correct location based on id/path matching", function() {
      var jobs = MetronomeUtil.parseJobs({ id: "name.foo.bar" });

      expect(jobs.items[0].id).toEqual("name");
      expect(jobs.items[0].items[0].id).toEqual("name.foo");
      expect(jobs.items[0].items[0].items[0].id).toEqual("name.foo.bar");
    });

    it("throws an error if item is not an object with id", function() {
      expect(function() {
        MetronomeUtil.parseJobs({});
      }).toThrow();
      expect(function() {
        MetronomeUtil.parseJobs(NaN);
      }).toThrow();
      expect(function() {
        MetronomeUtil.parseJobs();
      }).toThrow();
    });

    it("returns root namespace if empty array is passed", function() {
      const jobs = MetronomeUtil.parseJobs([]);

      expect(jobs.id).toEqual("");
      expect(jobs.items).toEqual([]);
    });

    it("nests everything under root", function() {
      expect(thisJobs.id).toEqual("");
      expect(thisJobs.items.length).toEqual(1);
    });

    it("consolidates jobs into common parent", function() {
      expect(thisJobs.items[0].id).toEqual("name");
    });

    it("sets correct namespace id", function() {
      expect(thisJobs.items[0].id).toEqual("name");
    });

    it("accepts nested namespaces", function() {
      expect(thisJobs.items[0].items[4].items.length).toEqual(1);
    });

    it("doesn't add items to jobs with no nested items", function() {
      expect(thisJobs.items[0].items[2].items).toEqual(undefined);
    });

    it("converts a single item into a subitem of root", function() {
      const jobs = MetronomeUtil.parseJobs({ id: "name.job" });

      expect(jobs.id).toEqual("");
      expect(jobs.items[0].id).toEqual("name");
      expect(jobs.items[0].items[0].id).toEqual("name.job");
    });

    it("merges data of items that are defined multiple times", function() {
      const jobs = thisJobs.items[0].items[3];
      expect(jobs).toEqual({
        id: "name.beta",
        cmd: "./beta",
        label: "Beta",
        description: "Second beta"
      });
    });

    it("doesn't merge jobs and namespaces", function() {
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

    it("applies parse job to all jobs", function() {
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

  describe("#parseJob", function() {
    beforeEach(function() {
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

    it("does nothing if history is undefined", function() {
      const job = MetronomeUtil.parseJob({ id: "foo" });

      expect(job).toEqual({ id: "foo" });
    });

    it("adds the proper status to the failed finished runs", function() {
      expect(thisJob.history.failedFinishedRuns[0].status).toEqual("FAILED");
    });

    it("adds the job id to the failed finished runs", function() {
      expect(thisJob.history.failedFinishedRuns[0].jobId).toEqual("foo");
    });

    it("adds the proper status to the successful finished runs", function() {
      expect(thisJob.history.successfulFinishedRuns[0].status).toEqual(
        "COMPLETED"
      );
    });

    it("adds the job id to the successful finished runs", function() {
      expect(thisJob.history.successfulFinishedRuns[0].jobId).toEqual("foo");
    });
  });
});
