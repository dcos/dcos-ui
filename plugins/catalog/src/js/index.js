import { getExtensionModule } from "@extension-kid/data-layer";
import { InjectableRepositoryExtension } from "./repositories/data/repositoriesModel";

export default (_context = {}) =>
  getExtensionModule(InjectableRepositoryExtension);
