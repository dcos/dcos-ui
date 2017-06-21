import List from "./List";
import UniversePackage from "./UniversePackage";

class UniverseInstalledPackagesList extends List {
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      options.filterProperties = {
        appId(item) {
          return item.getAppId();
        },
        description(item) {
          return item.getDescription();
        },
        name(item) {
          return item.getName();
        },
        tags(item) {
          return item.getTags().join(" ");
        }
      };
    }

    // Pass in overloaded options and the rest of the arguments
    super(options, ...Array.prototype.slice(arguments, 1));

    // Replace list items instances of UniversePackage.
    this.list = this.list.map(function(item) {
      if (item instanceof UniversePackage) {
        return item;
      } else {
        return new UniversePackage(item);
      }
    });
  }
}

module.exports = UniverseInstalledPackagesList;
