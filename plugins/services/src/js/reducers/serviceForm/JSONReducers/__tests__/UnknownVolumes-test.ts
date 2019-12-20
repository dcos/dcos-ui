const { ADD_ITEM } = require("#SRC/js/constants/TransactionTypes");
const UnknownVolumes = require("../UnknownVolumes");

describe("UnknownVolumes", () => {
  describe("#UnknownVolumesJSONParser", () => {
    describe("with empty input", () => {
      it("returns an empty array", () => {
        expect(UnknownVolumes.UnknownVolumesJSONParser({})).toEqual([]);
      });
    });

    describe("with known volumes", () => {
      describe("external volume", () => {
        it("returns an empty array", () => {
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

      describe("persistent volume", () => {
        it("returns an empty array", () => {
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

      describe("docker volume", () => {
        it("returns an empty array", () => {
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

    describe("with unknown volume", () => {
      it("extracts the volume", () => {
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

    describe("with mixed declaration", () => {
      it("extracts only unknown volumes", () => {
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
