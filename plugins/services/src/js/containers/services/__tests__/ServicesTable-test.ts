import Application from "../../../structs/Application";
import Framework from "../../../structs/Framework";
import { sortData } from "../ServicesTable";

const application = opts => new Application({ instances: 1, ...opts });

describe("ServicesTable", () => {
  describe("#sortData", () => {
    it("sorts by name", () => {
      const one = application({ id: "/a" });
      const two = application({ id: "/b" });

      expect(sortData([one, two], "name", "ASC").data).toEqual([one, two]);
      expect(sortData([one, two], "name", "DESC").data).toEqual([two, one]);
    });

    it("sorts by status", () => {
      // stopped
      const one = application({ instances: 0, tasksRunning: 0 });
      // running
      const two = application();

      expect(sortData([one, two], "status", "ASC").data).toEqual([one, two]);
      expect(sortData([one, two], "status", "DESC").data).toEqual([two, one]);
    });

    it("sorts by cpus", () => {
      const one = application({ cpus: 1 });
      const two = application({ cpus: 2 });

      expect(sortData([one, two], "cpus", "ASC").data).toEqual([one, two]);
      expect(sortData([one, two], "cpus", "DESC").data).toEqual([two, one]);
    });

    it("sorts by gpus", () => {
      const one = application({ gpus: 1 });
      const two = application({ gpus: 2 });

      expect(sortData([one, two], "gpus", "ASC").data).toEqual([one, two]);
      expect(sortData([one, two], "gpus", "DESC").data).toEqual([two, one]);
    });

    it("sorts by mem", () => {
      const one = application({ mem: 1024 });
      const two = application({ mem: 2048 });

      expect(sortData([one, two], "mem", "ASC").data).toEqual([one, two]);
      expect(sortData([one, two], "mem", "DESC").data).toEqual([two, one]);
    });

    it("sorts by disk", () => {
      const one = application({ disk: 0 });
      const two = application({ disk: 1 });

      expect(sortData([one, two], "disk", "ASC").data).toEqual([one, two]);
      expect(sortData([one, two], "disk", "DESC").data).toEqual([two, one]);
    });

    it("sorts by version", () => {
      const framework = version =>
        new Framework({ labels: { DCOS_PACKAGE_VERSION: version } });

      const highSemver = framework("2.3.0-3.0.16");
      const lowSemver = framework("2.3.0-1.1.0");
      const nonSemver = framework("not-semver-beta");
      const no = framework("");

      const data = [highSemver, lowSemver, nonSemver, no];

      expect(sortData(data, "version", "ASC").data).toEqual([
        no,
        nonSemver,
        lowSemver,
        highSemver
      ]);
      expect(sortData(data, "version", "DESC").data).toEqual([
        highSemver,
        lowSemver,
        nonSemver,
        no
      ]);
    });
  });
});
