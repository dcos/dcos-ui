import List from './List';
import UniversePackage from './UniversePackage';

class UniversePackagesList extends List {
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      options.filterProperties = {
        description: null, // use default getter
        name: null, // use default getter
        tags: function (item) {
          let tags = item.get('tags') || [];

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

  getSelectedAndNonSelectedPackages() {
    let selectedPackages = [];
    let nonSelectedPackages = [];

    this.getItems().forEach(function (universePackage) {
      if (universePackage.isSelected()) {
        selectedPackages.push(universePackage);
      } else {
        nonSelectedPackages.push(universePackage);
      }
    });

    return {
      selectedPackages: new this.constructor({items: selectedPackages}),
      nonSelectedPackages: new this.constructor({items: nonSelectedPackages})
    };
  }
}

module.exports = UniversePackagesList;
