import List from './List';
import Item from './Item';

class RepositoryList extends List {
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      // Use default getters
      options.filterProperties = {name: null, uri: null};
    }

    // Pass in overloaded options and the rest of the arguments
    super(options, ...Array.prototype.slice(arguments, 1));
  }

  getPriority(repository) {
    return this.getItems().indexOf(repository);
  }
}

RepositoryList.type = Item;

module.exports = RepositoryList;
