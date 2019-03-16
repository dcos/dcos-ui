import { JobExtension } from "./data/JobModel";
import { getExtensionModule } from "@extension-kid/data-layer";

export default (_context = {}) => getExtensionModule(JobExtension);
