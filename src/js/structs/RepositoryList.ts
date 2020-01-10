import List from "./List";
import Item from "./Item";

export default class RepositoryList extends List<Item> {
  static type = Item;
  constructor(options = {}) {
    // Specify filter properties if not specified
    if (!options.filterProperties) {
      // Use default getters
      options.filterProperties = { name: null, uri: null, index: null };
    }

    // Pass in overloaded options and the rest of the arguments
    super(options, ...Array.prototype.slice(arguments, 1));
  }

  getPriority(repository) {
    return this.getItems().indexOf(repository);
  }
}
