import { getExtensionModule } from "@extension-kid/data-layer";
import { RepositoryExtension } from "./repositories/data/repositoriesModel";

export default (_context = {}) => getExtensionModule(RepositoryExtension);
