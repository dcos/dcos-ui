import MarathonErrorUtil from "../MarathonErrorUtil";

const ServiceErrorTypes = require("../../constants/ServiceErrorTypes");

describe("MarathonErrorUtil", () => {
  describe("#parseErrors", () => {
    it("processes string-only errors", () => {
      const marathonError = "Some error";

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles object errors with message-only", () => {
      const marathonError = {
        message: "Some error"
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles object errors with string details", () => {
      const marathonError = {
        message: "Some error",
        details: "Some error details"
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error details",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles object errors with null message", () => {
      const marathonError = {
        message: null
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message:
            "An unknown error occurred (Marathon did not provide any description)",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles object errors with array details", () => {
      const marathonError = {
        message: "Some error",
        details: [
          {
            errors: ["First Error", "Second Error"],
            path: "/"
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "First Error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        },
        {
          path: [],
          message: "Second Error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("translates marathon paths without index", () => {
      const marathonError = {
        message: "Some error",
        details: [
          {
            errors: ["First Error"],
            path: "/some/property"
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: ["some", "property"],
          message: "First Error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("translates messages with no detail errors", () => {
      const marathonError = {
        message: "Some error",
        details: [
          {
            path: "/some/property"
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: ["some", "property"],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("translates messages with empty detail errors", () => {
      const marathonError = {
        message: "Some error",
        details: [
          {
            errors: [],
            path: "/some/property"
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: ["some", "property"],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("translates marathon paths with index", () => {
      const marathonError = {
        message: "Some error",
        details: [
          {
            errors: ["First Error"],
            path: "/some/indexed(3)/property"
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: ["some", "indexed", 3, "property"],
          message: "First Error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("is able to translate messages with no details", () => {
      const marathonError = { message: "Some error" };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles a message value of empty object as empty", () => {
      // TODO (JIRA DCOS_OSS-653): We should include these with a generic error
      const marathonError = { message: {} };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([]);
    });

    it("handles a message value of empty array as empty", () => {
      // TODO (JIRA DCOS_OSS-653): We should include these with a generic error
      const marathonError = { message: [] };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([]);
    });

    it("handles a details value of null as empty", () => {
      // TODO (JIRA DCOS_OSS-653): We should include these with a generic error
      const marathonError = { message: "Some error", details: null };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles a details value of empty object as empty", () => {
      // TODO (JIRA DCOS_OSS-653): We should include these with a generic error
      const marathonError = { message: "Some error", details: {} };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("handles a details value of empty array as empty", () => {
      // TODO (JIRA DCOS_OSS-653): We should include these with a generic error
      const marathonError = { message: "Some error", details: [] };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: "Some error",
          type: ServiceErrorTypes.GENERIC,
          variables: {}
        }
      ]);
    });

    it("discards details value of object", () => {
      // TODO (JIRA DCOS_OSS-653): We should include these with a generic error
      const marathonError = { message: "Some error", details: { foo: "bar" } };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([]);
    });
  });
});
