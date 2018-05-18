# Extension Kid 👶

👩‍🔬 Please be aware that this package is still experimental —
changes to the interface and underlying implementation are likely,
and future development or maintenance is not guaranteed.

---

<!-- TOC -->

- [Acknowledgments](#acknowledgments)
- [Expected knowledge](#expected-knowledge)
- [Key Concepts](#key-concepts)
  - [Service](#service)
  - [Extension](#extension)
  - [ExtensionProvider](#extensionprovider)
  - [Container](#container)
- [Packages](#packages)
  - [Package resolver (TBD)](#package-resolver-tbd)
  - [Authoring a package](#authoring-a-package)
  - [Loading packages into your application](#loading-packages-into-your-application)

<!-- /TOC -->

## Acknowledgments

The Framework is based and heavily inspired by the internal package system used in [Theia IDE](https://github.com/theia-ide/theia). Precisely [@theia/core package version v0.3.7](https://github.com/theia-ide/theia/blob/f81fe0139dfa1a8ef36a0eae2b4439d8ef3d2fe2/packages/core/package.json). The version was distributed under Apache 2.0 license.

## Expected knowledge

Developer is expected to have prior knowledge of [inversify.js](http://inversify.io/) and Dependency Injection pattern.

## Key Concepts

The framework provides a way of modularizing applications. It brings two key concepts: `Service` and `Extension`.

### Service

Service represents a place of your app you'd like to have extendable. Service has a named `ExtensionProvider` and expects its extensions to implement a certain interface.

```ts
export const MyServiceExtension = Symbol("MyServiceExtension");

export interface IMyServiceExtension {
  // ...
}

@injectable
export class MyService {
  constructor(
    @inject(ExtensionProvider)
    @named(MyServiceExtension)
    extensionProvider: ExtensionProvider
  ) {
    this._extensionProvider = extensionProvider;
  }
}
```

The Framework comes with one service `Application`.

### Extension

Piece of code that implements interface of a specific `Service`

```ts
export class MyExtension implements IMyServiceExtension {
  // ...
}
```

Extensions are meant to be bound to an `ExtensionProvider`.

### ExtensionProvider

Extension provider holds references to a container and a service identifier. The purpose of the provider is to fetch extensions from the container named after the service identifier.

Unless you need a very specific behavior from an extension provider you are highly encouraged to use the provided implementation. Otherwise you're free to implement your own provider.

To bind an extension provider to a service identifier use `bindExtensionProvider` helper:

```ts
new ContainerModule(bind => {
  bindExtensionProvider(bind, MyServiceExtension);
});
```

then you can simply bind extensions to the provider:

```ts
new ContainerModule(bind => {
  bind(MyServiceExtension).to(MyExtension1);
  bind(MyServiceExtension).to(MyExtension2);
});
```

### Container

Extends inversify.js `Container` and wraps `EventEmitter`. The container emits events on every `bind`, `unbind` and `rebind` method calls.

`ExtensionProvider` uses this feature to expose observable interface, so that your service can be notified every time a new extension is being bound to the container.

## Packages

### Package resolver (TBD)

There's no package resolver mechanism in place yet.

### Authoring a package

Typical package consists of one or several `Extensions`.

The default export of a package should be a factory function that accepts one argument `context` and returns a [ContainerModule](https://github.com/inversify/InversifyJS/blob/4d9f2fc363be94850bb20fde80ad06aca15b700e/wiki/container_modules.md).

```ts
export default _context => {
  return new ContainerModule(bind => {
    // Do all the bindings you need here
  });
};
```

`context` argument is optional and will be used by the resolver (TBD) to parameterize the package. There's no more information currently, we just would like to establish the interface so that nobody will have to adjust their packages in the future.

### Loading packages into your application

As there's no resolver yet, you should figure out the way of loading all your packages either at compile time or runtime or both.

At compile time in your application's [composition root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/) you can import packages and load them into a container.

```ts
import extensionFramework, { Container } from "extension-kid";
import packageFactory from "your-package";

const container = new Container();

container.load(extensionsFramework);

const package = packageFactory();
container.load(package);

export default container;
```
