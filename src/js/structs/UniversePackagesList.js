import List from "./List";
import UniversePackage from "./UniversePackage";

class UniversePackagesList extends List {
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      options.filterProperties = {
        name: null, // use default getter
        description: null, // use default getter
        tags(item) {
          const tags = item.get("tags") || [];

          return tags.join(" ");
        }
      };
    }

    // Pass in overloaded options and the rest of the arguments
    super(options, ...Array.prototype.slice(arguments, 1));
  }

  reRankCertified(items) {
    // Can't use array sort here since sorting on a boolean value will
    // reorder nearly everything and we want to preserve the previous ordering
    let certIndex = 0;

    return items.reduce((acc, item) => {
      if (item.isCertified()) {
        acc.splice(certIndex, 0, item);
        certIndex++;
      } else {
        acc.push(item);
      }

      return acc;
    }, []);
  }

  filterItemsByText(filterText) {
    const items = List.prototype.filterItemsByText
      .call(this, filterText)
      .getItems();

    return new this.constructor({ items: this.reRankCertified(items) });
  }

  getSelectedAndNonSelectedPackages() {
    const selectedPackages = [];
    const nonSelectedPackages = [];

    this.getItems().forEach(function(universePackage) {
      if (universePackage.isCertified()) {
        selectedPackages.push(universePackage);
      } else {
        nonSelectedPackages.push(universePackage);
      }
    });

    return {
      selectedPackages: new this.constructor({ items: selectedPackages }),
      nonSelectedPackages: new this.constructor({ items: nonSelectedPackages })
    };
  }
}

UniversePackagesList.type = UniversePackage;

module.exports = UniversePackagesList;
