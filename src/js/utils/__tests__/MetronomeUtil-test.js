const MetronomeUtil = require("../MetronomeUtil");

describe("MetronomeUtil", function() {
  describe("#addJob", function() {
    it("should throw error if the provided id  starts with a dot", function() {
      expect(function() {
        MetronomeUtil.parseJobs({ id: ".malformed.id" });
      }).toThrow();
    });

    it("should throw error if the provided id ends with a dot", function() {
      expect(function() {
        MetronomeUtil.parseJobs({ id: "malformed.id." });
      }).toThrow();
    });

    it("adds a job to the tree", function() {
      var instance = MetronomeUtil.parseJobs({ id: "alpha" });

      expect(instance.items[0].id).toEqual("alpha");
    });

    it("adds nested items at the correct location based on id/path matching", function() {
      var instance = MetronomeUtil.parseJobs({ id: "group.foo.bar" });

      expect(instance.items[0].id).toEqual("group");
      expect(instance.items[0].items[0].id).toEqual("group.foo");
      expect(instance.items[0].items[0].items[0].id).toEqual("group.foo.bar");
    });

    it("should throw error if item is not an object with id", function() {
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

    it("should return root group if empty array is passed", function() {
      var instance = MetronomeUtil.parseJobs([]);
      expect(instance.id).toEqual("");
      expect(instance.items).toEqual(undefined);
    });
  });

  describe("#parseJobs", function() {
    beforeEach(function() {
      this.instance = MetronomeUtil.parseJobs([
        { id: "group" },
        { id: "group.foo" },
        { id: "group.bar" },
        { id: "group.alpha" },
        { id: "group.beta", cmd: ">beta", description: "First beta" },
        { id: "group.beta", label: "Beta", description: "Second beta" },
        { id: "group.wibble.wobble" }
      ]);
    });

    it("nests everything under root", function() {
      expect(this.instance.id).toEqual("");
    });

    it("consolidates jobs into common parent", function() {
      expect(this.instance.items.length).toEqual(1);
      expect(this.instance.items[0].id).toEqual("group");
    });

    it("defaults id to empty string (root group id)", function() {
      const tree = MetronomeUtil.parseJobs([]);
      expect(tree.id).toEqual("");
    });

    it("sets correct tree id", function() {
      expect(this.instance.items[0].id).toEqual("group");
    });

    it("accepts nested trees (groups)", function() {
      expect(this.instance.items[0].items[4].items.length).toEqual(1);
    });

    it("doesn't add items to jobs with no nested items", function() {
      expect(this.instance.items[0].items[2].items).toEqual(undefined);
    });

    it("converts a single item into a subitem of root", function() {
      const instance = MetronomeUtil.parseJobs({ id: "group.job" });

      expect(instance.id).toEqual("");
      expect(instance.items[0].id).toEqual("group");
      expect(instance.items[0].items[0].id).toEqual("group.job");
    });

    it("merges data of items that are defined multiple times", function() {
      const result = this.instance.items[0].items[3];
      expect(result).toEqual({
        id: "group.beta",
        cmd: ">beta",
        label: "Beta",
        description: "Second beta"
      });
    });
  });

  describe("#parseJobs", function() {
    beforeEach(function() {
      this.job = MetronomeUtil.parseJob({
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

    it("should just do nothing if history is undefined", function() {
      const job = MetronomeUtil.parseJob({ id: "foo" });

      expect(job).toEqual({ id: "foo" });
    });

    it("should add the proper status to the failed finished runs", function() {
      expect(this.job.history.failedFinishedRuns[0].status).toEqual("FAILED");
    });

    it("should add the job id to the failed finished runs", function() {
      expect(this.job.history.failedFinishedRuns[0].jobId).toEqual("foo");
    });

    it("should add the proper status to the successful finished runs", function() {
      expect(this.job.history.successfulFinishedRuns[0].status).toEqual(
        "COMPLETED"
      );
    });

    it("should add the job id to the successful finished runs", function() {
      expect(this.job.history.successfulFinishedRuns[0].jobId).toEqual("foo");
    });
  });
});
