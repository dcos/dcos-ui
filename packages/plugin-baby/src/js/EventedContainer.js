import { Container } from "inversify";
import EventEmmiter from "events";

const BOUND = Symbol("BOUND");
const UNBOUND = Symbol("UNBOUND");
const REBOUND = Symbol("UNBOUND");

export default class EventedContainer extends Container {
  constructor(containerOptions) {
    super(containerOptions);

    this._eventEmmiter = new EventEmmiter();
  }

  addEventListener(type, callback) {
    this._eventEmmiter.addListener(type, callback);
  }

  bind(serviceIdentifier) {
    const bindingToSyntax = super.bind(serviceIdentifier);
    this._eventEmmiter.emit(BOUND, serviceIdentifier, bindingToSyntax);

    return bindingToSyntax;
  }

  rebind(serviceIdentifier) {
    const bindingToSyntax = super.rebind(serviceIdentifier);
    this._eventEmmiter.emit(REBOUND, serviceIdentifier, bindingToSyntax);

    return bindingToSyntax;
  }

  unbind(serviceIdentifier) {
    super.unbind(serviceIdentifier);
    this._eventEmmiter.emit(UNBOUND, serviceIdentifier);
  }

  static get BOUND() {
    return BOUND;
  }

  static get UNBOUND() {
    return UNBOUND;
  }

  static get REBOUND() {
    return REBOUND;
  }
}
