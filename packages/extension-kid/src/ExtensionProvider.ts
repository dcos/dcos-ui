import { injectable, interfaces } from "inversify";
import { Observable, Subscription, PartialObserver } from "rxjs";
import { publish, refCount } from "rxjs/operators";

import Container, { observe } from "./Container";

@injectable()
export class ExtensionProvider<T> {
  private readonly serviceIdentifier: interfaces.ServiceIdentifier<T>;
  private readonly container: Container;
  private readonly updates$: Observable<T>;

  constructor(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    container: Container
  ) {
    this.serviceIdentifier = serviceIdentifier;
    this.container = container;
    this.updates$ = observe<T>(container, serviceIdentifier).pipe(
      publish(),
      refCount()
    );
  }

  public subscribe(observer: PartialObserver<T>): Subscription {
    return this.updates$.subscribe(observer);
  }

  public getAllExtensions(): T[] {
    let extensions: T[] = [];
    if (this.container.isBound(this.serviceIdentifier)) {
      try {
        extensions = this.container.getAll<T>(this.serviceIdentifier);
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
      }
    }

    return extensions;
  }

  public getTaggedExtensions(tagName: string, tagValue: any): T[] {
    let extensions: T[] = [];
    if (this.container.isBound(this.serviceIdentifier)) {
      try {
        extensions = this.container.getAllTagged<T>(
          this.serviceIdentifier,
          tagName,
          tagValue
        );
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
      }
    }

    return extensions;
  }
}

export function bindExtensionProvider(
  bind: interfaces.Bind,
  id: symbol | string
): void {
  bind(ExtensionProvider)
    .toDynamicValue(
      context => new ExtensionProvider(id, context.container as Container)
    )
    .inSingletonScope()
    .whenTargetNamed(id);
}
