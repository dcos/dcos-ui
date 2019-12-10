import List from "./List";
import UniversePackage from "./UniversePackage";

class UniversePackagesList extends List {
  constructor(options = {}) {
    // Pass in overloaded options and the rest of the arguments
    super({
      ...options,
      filterProperties: {
        name: null, // use default getter
        description: null, // use default getter
        tags: item => (item.get("tags") || []).join(" ")
      }
    });
  }
}

UniversePackagesList.type = UniversePackage;

export default UniversePackagesList;
