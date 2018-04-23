import { ContainerModule } from "inversify";
import Application, { ApplicationExtension } from "./src/js/Application";
import {
  bindExtensionProvider,
  ExtensionProvider
} from "./src/js/ExtensionProvider";
import EventedContainer from "./src/js/EventedContainer";

export {
  Application,
  ApplicationExtension,
  EventedContainer,
  ExtensionProvider,
  bindExtensionProvider
};

export default new ContainerModule((bind, _unbind) => {
  bindExtensionProvider(bind, ApplicationExtension);
  bind(Application).toSelf().inSingletonScope();
});
