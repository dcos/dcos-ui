import { Container, interfaces } from "inversify";
import { EventEmitter } from "events";

const BOUND = Symbol("BOUND");
const UNBOUND = Symbol("UNBOUND");
const REBOUND = Symbol("UNBOUND");

interface IEventListener {
  addEventListener<T>(
    type: symbol,
    callback: (
      identifier: interfaces.ServiceIdentifier<T>,
      bindingToSyntax: interfaces.BindingToSyntax<T>
    ) => void
  ): void;
}

export default class EventedContainer extends Container
  implements IEventListener {
  private eventEmmiter: EventEmitter;

  constructor(containerOptions: interfaces.ContainerOptions) {
    super(containerOptions);

    this.eventEmmiter = new EventEmitter();
  }

  public addEventListener<T>(
    type: symbol,
    callback: (
      identifier: interfaces.ServiceIdentifier<T>,
      bindingToSyntax: interfaces.BindingToSyntax<T>
    ) => void
  ) {
    this.eventEmmiter.addListener(type, callback);
  }

  public bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>) {
    const bindingToSyntax = super.bind(serviceIdentifier);
    this.eventEmmiter.emit(BOUND, serviceIdentifier, bindingToSyntax);

    return bindingToSyntax;
  }

  public rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>) {
    const bindingToSyntax = super.rebind(serviceIdentifier);
    this.eventEmmiter.emit(REBOUND, serviceIdentifier, bindingToSyntax);

    return bindingToSyntax;
  }

  public unbind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>) {
    super.unbind(serviceIdentifier);
    this.eventEmmiter.emit(UNBOUND, serviceIdentifier);
  }

  static get BOUND(): symbol {
    return BOUND;
  }

  static get UNBOUND(): symbol {
    return UNBOUND;
  }

  static get REBOUND(): symbol {
    return REBOUND;
  }
}
