import { ContainerModule } from "inversify";
import { JobExtension } from "./data/JobModel";
import { DataLayerExtensionType } from "@extension-kid/data-layer";

export default (_context = {}) =>
  new ContainerModule(bind => {
    bind(DataLayerExtensionType)
      .to(JobExtension)
      .inSingletonScope();
  });
