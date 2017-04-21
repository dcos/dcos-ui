import List from "./List";
import UniversePackage from "./UniversePackage";

class UniversePackagesList extends List {
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      options.filterProperties = {
        description: null, // use default getter
        name: null, // use default getter
        tags(item) {
          const tags = item.get("tags") || [];

          return tags.join(" ");
        }
      };
    }

    // Pass in overloaded options and the rest of the arguments
    super(options, ...Array.prototype.slice(arguments, 1));
  }

  getSelectedAndNonSelectedPackages() {
    const selectedPackages = [];
    const nonSelectedPackages = [];

    this.getItems().forEach(function(universePackage) {
      if (universePackage.isSelected()) {
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
