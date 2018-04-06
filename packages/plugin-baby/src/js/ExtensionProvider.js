import * as inversify from "inversify";

export class ExtensionProvider {
  constructor(serviceIdentifier, container) {
    this._serviceIdentifier = serviceIdentifier;
    this._container = container;
    this._services = undefined;
  }

  getExtensions() {
    if (this._services === undefined) {
      if (this._container.isBound(this._serviceIdentifier)) {
        try {
          this._services = this._container.getAll(this._serviceIdentifier);
        } catch (error) {
          console.error(error);
          this._services = [];
        }
      } else {
        this._services = [];
      }
    }

    return this._services;
  }
}
inversify.decorate(inversify.injectable(), ExtensionProvider);

export function bindExtensionProvider(bindable, id) {
  bindable(ExtensionProvider)
    .toDynamicValue(ctx => new ExtensionProvider(id, ctx.container))
    .inSingletonScope()
    .whenTargetNamed(id);
}
