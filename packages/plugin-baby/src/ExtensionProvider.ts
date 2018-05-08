import { injectable, interfaces } from "inversify";
import { BehaviorSubject } from "rxjs";

import EventedContainer from "./EventedContainer";

export interface IExtensionProvider<T> {
  subscribe(callback: () => void): any;
  getAllExtensions(): T[];
  getTaggedExtensions(tagName: string, tagValue: any): T[];
}

@injectable()
export class ExtensionProvider<T> implements IExtensionProvider<T> {
  private serviceIdentifier: interfaces.ServiceIdentifier<T>;
  private container: EventedContainer;
  private services$: BehaviorSubject<any>;

  constructor(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    container: EventedContainer
  ) {
    this.serviceIdentifier = serviceIdentifier;
    this.container = container;
    this.services$ = new BehaviorSubject<any>(null);

    this.container.addEventListener<
      T
    >(
      EventedContainer.BOUND,
      (
        identifier: interfaces.ServiceIdentifier<T>,
        bindingToSyntax: interfaces.BindingToSyntax<T>
      ) => {
        if (identifier === this.serviceIdentifier) {
          this.services$.next(bindingToSyntax);
        }
      }
    );
  }

  public subscribe(callback: () => void) {
    this.services$.subscribe(callback);
  }

  public getAllExtensions(): T[] {
    let services: T[] = [];
    if (this.container.isBound(this.serviceIdentifier)) {
      try {
        services = this.container.getAll<T>(this.serviceIdentifier);
      } catch (error) {
        // console.error(error);
      }
    }

    return services;
  }

  public getTaggedExtensions(tagName: string, tagValue: any): T[] {
    let services: T[] = [];
    if (this.container.isBound(this.serviceIdentifier)) {
      try {
        services = this.container.getAllTagged<T>(
          this.serviceIdentifier,
          tagName,
          tagValue
        );
      } catch (error) {
        // console.error(error);
      }
    }

    return services;
  }
}

export function bindExtensionProvider(
  bind: interfaces.Bind,
  id: symbol | string
): void {
  bind(ExtensionProvider)
    .toDynamicValue(
      context =>
        new ExtensionProvider(id, context.container as EventedContainer)
    )
    .inSingletonScope()
    .whenTargetNamed(id);
}
