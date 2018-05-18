import { Container as InversifyContainer, interfaces } from "inversify";
import { Observable } from "rxjs";
// tslint:disable-next-line:no-submodule-imports
import { Observer } from "rxjs/Observer";
import { EventEmitter } from "events";

import ServiceIdentifier = interfaces.ServiceIdentifier;

const BOUND = "BOUND";
const UNBOUND = "UNBOUND";
const UNBOUND_ALL = "UNBOUND_ALL";
const REBOUND = "REBOUND";

export function observe<T>(
  container: Container,
  serviceIdentifier?: ServiceIdentifier<T>
): Observable<T> {
  return Observable.create(
    (observer: Observer<ServiceIdentifier<T> | undefined>) => {
      const listenerCallback = (identifier?: ServiceIdentifier<T>) => {
        if (
          serviceIdentifier &&
          identifier &&
          identifier !== serviceIdentifier
        ) {
          return;
        }

        observer.next(identifier);
      };

      container.addEventListener<T>(Container.BOUND, listenerCallback);
      container.addEventListener<T>(Container.UNBOUND, listenerCallback);
      container.addEventListener<T>(Container.UNBOUND_ALL, listenerCallback);
      container.addEventListener<T>(Container.REBOUND, listenerCallback);

      return function teardown() {
        container.removeEventListener(Container.BOUND, listenerCallback);
        container.removeEventListener(Container.UNBOUND, listenerCallback);
        container.removeEventListener(Container.UNBOUND_ALL, listenerCallback);
        container.removeEventListener(Container.REBOUND, listenerCallback);
      };
    }
  );
}

export default class Container extends InversifyContainer {
  private eventEmitter: EventEmitter;

  constructor(containerOptions?: interfaces.ContainerOptions) {
    super(containerOptions);

    this.eventEmitter = new EventEmitter();
  }

  public addEventListener<T>(
    type: string,
    callback: (identifier: ServiceIdentifier<T>) => void
  ) {
    this.eventEmitter.addListener(type, callback);
  }

  public removeEventListener<T>(
    type: string,
    callback: (identifier: ServiceIdentifier<T>) => void
  ) {
    this.eventEmitter.removeListener(type, callback);
  }

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>) {
    const bindingToSyntax = super.bind(serviceIdentifier);
    this.eventEmitter.emit(BOUND, serviceIdentifier);

    return bindingToSyntax;
  }

  public rebind<T>(serviceIdentifier: ServiceIdentifier<T>) {
    const bindingToSyntax = super.rebind(serviceIdentifier);
    this.eventEmitter.emit(REBOUND, serviceIdentifier);

    return bindingToSyntax;
  }

  public unbind<T>(serviceIdentifier: ServiceIdentifier<T>) {
    super.unbind(serviceIdentifier);
    this.eventEmitter.emit(UNBOUND, serviceIdentifier);
  }

  public unbindAll() {
    super.unbindAll();
    this.eventEmitter.emit(UNBOUND_ALL);
  }

  static get BOUND(): string {
    return BOUND;
  }

  static get UNBOUND(): string {
    return UNBOUND;
  }

  static get UNBOUND_ALL(): string {
    return UNBOUND_ALL;
  }

  static get REBOUND(): string {
    return REBOUND;
  }
}
