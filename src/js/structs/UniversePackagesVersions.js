import Item from "./Item";

const sortPackageVersions = selectedPackage => {
  if (selectedPackage.packageVersions == null) {
    return [];
  }
  const versions = selectedPackage.packageVersions;

  return Object.keys(versions).sort((a, b) => {
    if (+versions[a] > +versions[b]) {
      return -1;
    }
    if (+versions[a] < +versions[b]) {
      return 1;
    }

    return 0;
  });
};

class UniversePackagesVersions extends Item {
  getPackageByName(packageName) {
    return sortPackageVersions(this.get()[packageName] || {});
  }
}

module.exports = UniversePackagesVersions;
