const { ADD_ITEM, SET } = require("#SRC/js/constants/TransactionTypes");
const ExternalVolumes = require("../ExternalVolumes");

describe("External Volumes", function() {
  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(ExternalVolumes.JSONParser({})).toEqual([]);
    });

    it("should return an empty array if only external volumes are present", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([]);
    });

    it("should contain the transaction for one external volume", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: {
            containerPath: "/dev/null",
            external: {
              name: "null",
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              }
            },
            mode: "RW"
          },
          path: ["externalVolumes"]
        },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        { type: SET, value: "dvdi", path: ["externalVolumes", 0, "provider"] },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should exclude the external volume", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            },
            {
              containerPath: "/dev/null",
              persistent: { size: 1024 },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: {
            containerPath: "/dev/null",
            external: {
              name: "null",
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              }
            },
            mode: "RW"
          },
          path: ["externalVolumes"]
        },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        { type: SET, value: "dvdi", path: ["externalVolumes", 0, "provider"] },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should include a unknown value for provider", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: {
            containerPath: "/dev/null",
            external: {
              name: "null",
              provider: "provider",
              options: {
                "dvdi/driver": "rexray"
              }
            },
            mode: "RW"
          },
          path: ["externalVolumes"]
        },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        {
          type: SET,
          value: "provider",
          path: ["externalVolumes", 0, "provider"]
        },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should include a unknown value for options", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                name: "null",
                provider: "provider",
                options: {
                  someValue: true
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: {
            containerPath: "/dev/null",
            external: {
              name: "null",
              provider: "provider",
              options: {
                someValue: true
              }
            },
            mode: "RW"
          },
          path: ["externalVolumes"]
        },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        {
          type: SET,
          value: "provider",
          path: ["externalVolumes", 0, "provider"]
        },
        {
          type: SET,
          value: {
            someValue: true
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });

    it("should include a size value", function() {
      const state = {
        container: {
          volumes: [
            {
              containerPath: "/dev/null",
              external: {
                size: 1024,
                name: "null",
                provider: "dvdi",
                options: {
                  "dvdi/driver": "rexray"
                }
              },
              mode: "RW"
            }
          ]
        }
      };
      expect(ExternalVolumes.JSONParser(state)).toEqual([
        {
          type: ADD_ITEM,
          value: {
            containerPath: "/dev/null",
            external: {
              size: 1024,
              name: "null",
              provider: "dvdi",
              options: {
                "dvdi/driver": "rexray"
              }
            },
            mode: "RW"
          },
          path: ["externalVolumes"]
        },
        { type: SET, value: "null", path: ["externalVolumes", 0, "name"] },
        { type: SET, value: 1024, path: ["externalVolumes", 0, "size"] },
        {
          type: SET,
          value: "/dev/null",
          path: ["externalVolumes", 0, "containerPath"]
        },
        { type: SET, value: "dvdi", path: ["externalVolumes", 0, "provider"] },
        {
          type: SET,
          value: {
            "dvdi/driver": "rexray"
          },
          path: ["externalVolumes", 0, "options"]
        },
        { type: SET, value: "RW", path: ["externalVolumes", 0, "mode"] }
      ]);
    });
  });
});
