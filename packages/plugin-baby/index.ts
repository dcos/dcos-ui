import { ContainerModule } from "inversify";
import Application, { ApplicationExtension } from "./src/Application";
import {
  bindExtensionProvider,
  ExtensionProvider,
  IExtensionProvider
} from "./src/ExtensionProvider";
import EventedContainer from "./src/EventedContainer";

export {
  Application,
  ApplicationExtension,
  EventedContainer,
  ExtensionProvider,
  IExtensionProvider,
  bindExtensionProvider
};

export default new ContainerModule((bind, _unbind) => {
  bindExtensionProvider(bind, ApplicationExtension);
  bind(Application).toSelf().inSingletonScope();
});
