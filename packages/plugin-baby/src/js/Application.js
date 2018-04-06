import * as inversify from "inversify";
import { ExtensionProvider } from "./ExtensionProvider";

export const ApplicationExtension = Symbol("ApplicationExtension");

export default class Application {
  constructor(extensionsProvider) {
    this._extensionsProvider = extensionsProvider;
  }

  start() {
    for (const extension of this._extensionsProvider.getExtensions()) {
      if (extension.initialize) {
        extension.initialize();
      }
      if (extension.onStart) {
        extension.onStart(this);
      }
    }
  }
}
inversify.decorate(inversify.injectable(), Application);
// Decorating extensions argument
inversify.decorate(inversify.inject(ExtensionProvider), Application, 0);
inversify.decorate(inversify.named(ApplicationExtension), Application, 0);
