import { injectable, inject, named } from "inversify";
import { EventEmitter } from "events";
import { IExtensionProvider, ExtensionProvider } from "plugin-baby";
import { IPartialNextState } from "react-router"

const ROUTING_CHANGED = Symbol("ROUTING_CHANGED");

export const RoutingServiceExtension = Symbol("RoutingServiceExtension");

export interface IRoutingExtension {
  getRoutes(partialNextState: IPartialNextState): any[];
}

@injectable()
export default class RoutingService {
  private extensionProvider: IExtensionProvider<IRoutingExtension>;
  private eventEmmiter: EventEmitter;

  constructor(
    @inject(ExtensionProvider)
    @named(RoutingServiceExtension)
    extensionProvider: IExtensionProvider<IRoutingExtension>
  ) {
    this.extensionProvider = extensionProvider;
    this.eventEmmiter = new EventEmitter();
  }

  public on(type: symbol, callback: () => void) {
    this.eventEmmiter.on(type, callback);
  }

  public getRoutes(partialNextState: IPartialNextState) {
    return this.extensionProvider
      .getAllExtensions()
      .reduce((acc: any[], extension: IRoutingExtension) =>
        acc.concat(extension.getRoutes(partialNextState))
      , []);
  }

  static get ROUTING_CHANGED() {
    return ROUTING_CHANGED;
  }
}
