const MarathonPodValidators = require("../MarathonPodValidators");
const { GENERIC } = require("../../constants/ServiceErrorTypes");

describe("MarathonPodValidators", function() {
  describe("#validateProfileVolumes", function() {
    it("does not return error if volumes is not specified", function() {
      const spec = {};
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error for local host volumes", function() {
      const spec = {
        volumes: [
          {
            containerPath: "path",
            mode: "RW"
          }
        ]
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error for external volumes", function() {
      const spec = {
        volumes: [
          {
            external: {
              name: "name",
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              },
              size: 3
            },
            mode: "RW",
            containerPath: "path"
          }
        ]
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error for local persistent volumes", function() {
      const spec = {
        volumes: [
          {
            persistent: {
              size: 3
            },
            mode: "RW",
            containerPath: "path"
          }
        ]
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error if volume type is `mount`", function() {
      const spec = {
        volumes: [
          {
            persistent: {
              type: "mount",
              size: 3,
              profileName: "profile"
            },
            mode: "RW",
            containerPath: "path"
          }
        ]
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("returns error if volume type is not `mount`", function() {
      const spec = {
        volumes: [
          {
            persistent: {
              type: "root",
              size: 3,
              profileName: "profile"
            },
            mode: "RW",
            containerPath: "path"
          }
        ]
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([
        {
          path: ["volumes", 0, "persistent", "type"],
          message: "Must be mount for volumes with profile name",
          type: GENERIC,
          variables: { name: "type" }
        }
      ]);
    });
  });
});
