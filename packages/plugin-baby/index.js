import "reflect-metadata";

import { ContainerModule } from "inversify";
import Application, { ApplicationExtension } from "./src/js/Application";
import { bindExtensionProvider } from "./src/js/ExtensionProvider";

export { Application, ApplicationExtension };

export default new ContainerModule((bind, _unbind) => {
  bindExtensionProvider(bind, ApplicationExtension);
  bind(Application).toSelf().inSingletonScope();
});
