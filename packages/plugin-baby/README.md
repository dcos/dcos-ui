# Plugin helpers

Set of helpers based on the inversify.js that enable implementing a plugin architecture in your app.

## EventedContainer

Tiny wrapper on top of inversify.js Container that allow you to subscribe to the bind, unbind and rebind events.

## ExtensionProvider

Generic Extension provider that holds a container and a service identifier. You can bind your concrete implementations using `bindExtensionProvider` function like so:

```js
const MyServiceExtension = Symbol("MyServiceExtension");

bindExtensionProvider(container.bind, MyServiceExtension)
```

then you can inject named provider in your service

```js
@injectable
class MyService {
  constructor(
    @inject(ExtensionProvider) @named(MyServiceExtension) extensionProvider: ExtensionProvider
  ) {
    this._extensionProvider = extensionProvider;
  }
}
```

having `MyService` you can go ahead and bind `MyServiceExtension` to your extensions and the `ExtensionProvider` will make sure `MyService` gets them.

```js
container.bind(MyServiceExtension).to(RandomExtension)
```

## Application

`Application` service is a generic application that you can use or you can use your own. `Application` exposes only one public method `start` that will re-initialize all `ApplicationExtension`s bound to the container right after they were bound.

You can use it like this:

```js
container.load(pluginBaby);

container.bind(ApplicationExtension).to(Auth);
container.bind(ApplicationExtension).to(Greeter);

const app = container.get(Application);
app.start(); // will initialize and start both extensions
```