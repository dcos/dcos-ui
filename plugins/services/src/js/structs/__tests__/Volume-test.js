import Volume from "../Volume";
import VolumeStatus from "../../constants/VolumeStatus";
import VolumeProfile from "../../constants/VolumeProfile";
import VolumeDefinitions from "../../constants/VolumeDefinitions";

describe("Volume", () => {
  describe("#getContainerPath", () => {
    it("returns correct container path", () => {
      const service = new Volume({
        containerPath: "/data"
      });

      expect(service.getContainerPath()).toEqual("/data");
    });
  });

  describe("#getHost", () => {
    it("returns correct host", () => {
      const service = new Volume({
        host: "127.0.0.1"
      });

      expect(service.getHost()).toEqual("127.0.0.1");
    });
  });

  describe("#getId", () => {
    it("returns correct id", () => {
      const service = new Volume({
        id: "volume.id"
      });

      expect(service.getId()).toEqual("volume.id");
    });
  });

  describe("#getMode", () => {
    it("returns correct mode", () => {
      const service = new Volume({
        mode: "rw"
      });

      expect(service.getMode()).toEqual("rw");
    });
  });

  describe("#getType", () => {
    it("returns unavailable if no profile is defined", () => {
      const service = new Volume({});

      expect(service.getProfile()).toEqual(VolumeProfile.UNAVAILABLE);
    });

    it("returns correct profile", () => {
      const service = new Volume({
        profileName: "SSD"
      });

      expect(service.getProfile()).toEqual("SSD");
    });
  });

  describe("#getStatus", () => {
    it("returns unavailable if no  status is defined", () => {
      const service = new Volume({});

      expect(service.getStatus()).toEqual(VolumeStatus.UNAVAILABLE);
    });

    it("returns correct status", () => {
      const service = new Volume({
        status: VolumeStatus.ATTACHED
      });

      expect(service.getStatus()).toEqual(VolumeStatus.ATTACHED);
    });
  });

  describe("#getSize", () => {
    it("returns correct size", () => {
      const service = new Volume({
        size: 256
      });

      expect(service.getSize()).toEqual(256);
    });
  });

  describe("#getType", () => {
    it("returns correct type", () => {
      const service = new Volume({
        type: VolumeDefinitions.PERSISTENT.type
      });

      expect(service.getType()).toEqual(VolumeDefinitions.PERSISTENT.type);
    });
  });

  describe("#getTaskID", () => {
    it("returns correct type", () => {
      const service = new Volume({
        taskID: "foo"
      });

      expect(service.getTaskID()).toEqual("foo");
    });
  });
});
