import * as inversify from "inversify";
import Rx from "rxjs";

import EventedContainer from "./EventedContainer";

export class ExtensionProvider {
  constructor(serviceIdentifier, container) {
    this._serviceIdentifier = serviceIdentifier;
    this._container = container;
    this._services$ = new Rx.BehaviorSubject();

    this._container.addEventListener(
      EventedContainer.BOUND,
      (identifier, bindingToSyntax) => {
        if (identifier === this._serviceIdentifier) {
          this._services$.onNext(bindingToSyntax);
        }
      }
    );
  }

  subscribe(callback) {
    this._services$.subscribe(callback);
  }

  getAllExtensions() {
    let services = [];
    if (this._container.isBound(this._serviceIdentifier)) {
      try {
        services = this._container.getAll(this._serviceIdentifier);
      } catch (error) {
        console.error(error);
      }
    }

    return services;
  }

  getTaggedExtensions(tagName, tagValue) {
    let services = [];
    if (this._container.isBound(this._serviceIdentifier)) {
      try {
        services = this._container.getAllTagged(
          this._serviceIdentifier,
          tagName,
          tagValue
        );
      } catch (error) {
        console.error(error);
      }
    }

    return services;
  }
}
inversify.decorate(inversify.injectable(), ExtensionProvider);

export function bindExtensionProvider(bind, id) {
  bind(ExtensionProvider)
    .toDynamicValue(context => new ExtensionProvider(id, context.container))
    .inSingletonScope()
    .whenTargetNamed(id);
}
