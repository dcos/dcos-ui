import Item from "./Item";

class UniversePackageVersions extends Item {
  getVersions() {
    if (this.get("packageVersions") == null) {
      return [];
    }
    const versions = this.get("packageVersions");

    return Object.keys(versions).sort((a, b) => {
      if (+versions[a] > +versions[b]) {
        return -1;
      }
      if (+versions[a] < +versions[b]) {
        return 1;
      }

      return 0;
    });
  }
}

export default UniversePackageVersions;
