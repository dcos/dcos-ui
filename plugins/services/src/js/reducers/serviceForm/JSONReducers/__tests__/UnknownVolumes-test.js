const { ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const UnknownVolumes = require("../UnknownVolumes");

describe("UnknownVolumes", function() {
  describe("#UnknownVolumesJSONParser", function() {
    describe("with empty input", function() {
      it("returns an empty array", function() {
        expect(UnknownVolumes.UnknownVolumesJSONParser({})).toEqual([]);
      });
    });

    describe("with known volumes", function() {
      describe("external volume", function() {
        it("returns an empty array", function() {
          const externalVolume = {
            container: {
              volumes: [
                {
                  containerPath: "/mnt/volume",
                  external: {
                    name: "someVolume",
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
          expect(
            UnknownVolumes.UnknownVolumesJSONParser(externalVolume)
          ).toEqual([]);
        });
      });

      describe("persistent volume", function() {
        it("returns an empty array", function() {
          const persistentVolume = {
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
          expect(
            UnknownVolumes.UnknownVolumesJSONParser(persistentVolume)
          ).toEqual([]);
        });
      });

      describe("docker volume", function() {
        it("returns an empty array", function() {
          const dockerVolume = {
            container: {
              volumes: [
                {
                  hostPath: "some/path",
                  containerPath: "/mnt/volume",
                  mode: "RW"
                }
              ]
            }
          };
          expect(UnknownVolumes.UnknownVolumesJSONParser(dockerVolume)).toEqual(
            []
          );
        });
      });
    });

    describe("with unknown volume", function() {
      it("extracts the volume", function() {
        const unknownVolumes = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null"
              }
            ]
          }
        };
        expect(UnknownVolumes.UnknownVolumesJSONParser(unknownVolumes)).toEqual(
          [
            {
              type: ADD_ITEM,
              value: {
                containerPath: "/dev/null"
              },
              path: ["unknownVolumes"]
            }
          ]
        );
      });
    });

    describe("with mixed declaration", function() {
      it("extracts only unknown volumes", function() {
        const unknownVolumes = {
          container: {
            volumes: [
              {
                containerPath: "/dev/null",
                persistent: { size: 1024 },
                mode: "RW"
              },
              {
                containerPath: "/dev/null1"
              },
              {
                containerPath: "/dev/null",
                persistent: { size: 1024 },
                mode: "RW"
              },
              {
                containerPath: "/dev/null2"
              }
            ]
          }
        };
        expect(UnknownVolumes.UnknownVolumesJSONParser(unknownVolumes)).toEqual(
          [
            {
              type: ADD_ITEM,
              value: {
                containerPath: "/dev/null1"
              },
              path: ["unknownVolumes"]
            },
            {
              type: ADD_ITEM,
              value: {
                containerPath: "/dev/null2"
              },
              path: ["unknownVolumes"]
            }
          ]
        );
      });
    });
  });
});
