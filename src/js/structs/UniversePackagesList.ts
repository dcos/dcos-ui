import List from "./List";
import UniversePackage from "./UniversePackage";

export default class UniversePackagesList extends List<UniversePackage> {
  static type = UniversePackage;
  constructor(options = {}) {
    // Pass in overloaded options and the rest of the arguments
    super({
      ...options,
      filterProperties: {
        name: null, // use default getter
        description: null, // use default getter
        tags: (item) => (item.get("tags") || []).join(" "),
      },
    });
  }
}
