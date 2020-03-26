import MarathonPodValidators from "../MarathonPodValidators";

import { GENERIC } from "../../constants/ServiceErrorTypes";

describe("MarathonPodValidators", () => {
  describe("#validateProfileVolumes", () => {
    it("does not return error if volumes is not specified", () => {
      const spec = {};
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error for local host volumes", () => {
      const spec = {
        volumes: [
          {
            containerPath: "path",
            mode: "RW",
          },
        ],
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error for external volumes", () => {
      const spec = {
        volumes: [
          {
            external: {
              name: "name",
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray",
              },
              size: 3,
            },
            mode: "RW",
            containerPath: "path",
          },
        ],
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error for local persistent volumes", () => {
      const spec = {
        volumes: [
          {
            persistent: {
              size: 3,
            },
            mode: "RW",
            containerPath: "path",
          },
        ],
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("does not return error if volume type is `mount`", () => {
      const spec = {
        volumes: [
          {
            persistent: {
              type: "mount",
              size: 3,
              profileName: "profile",
            },
            mode: "RW",
            containerPath: "path",
          },
        ],
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([]);
    });

    it("returns error if volume type is not `mount`", () => {
      const spec = {
        volumes: [
          {
            persistent: {
              type: "root",
              size: 3,
              profileName: "profile",
            },
            mode: "RW",
            containerPath: "path",
          },
        ],
      };
      expect(MarathonPodValidators.validateProfileVolumes(spec)).toEqual([
        {
          path: ["volumes", 0, "persistent", "type"],
          message: "Must be mount for volumes with profile name",
          type: GENERIC,
          variables: { name: "type" },
        },
      ]);
    });
  });
});
