import List from './List';
import UniversePackage from './UniversePackage';

function propertyGetter(item, prop) {
  return item.get('packageDefinition')[prop];
}

class UniverseInstalledPackagesList extends List {
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      options.filterProperties = {
        appId: null, // default getter
        description: propertyGetter,
        name: propertyGetter,
        tags: function (item, prop) {
          let tags = propertyGetter(item, prop) || [];

          return tags.join(' ');
        }
      };
    }

    // Pass in overloaded options and the rest of the arguments
    super(options, ...Array.prototype.slice(arguments, 1));

    // Replace list items instances of UniversePackage.
    this.list = this.list.map(function (item) {
      if (item instanceof UniversePackage) {
        return item;
      } else {
        return new UniversePackage(item);
      }
    });
  }
}

module.exports = UniverseInstalledPackagesList;
