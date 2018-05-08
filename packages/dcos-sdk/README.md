# DC/OS UI SDK

DC/OS plugin developer's best friend!

## NavigationService

ExtensionProvider that provides extension point for navigation.

Most probably you don't want to use it directly but rather implement its `INavigationExtension` and bind it to `ExtensionProvider` named `NavigationExtensionProvider`.

### Example NavigationExtension

```ts
class PluginNavigation implements INavigationExtension {
  getElements() {
    return [
      {
        path: "/plugin-path",
        link: "Plugin name for the Sidebar",
        parent: "root",
        icon: <Icon />
      },
      {
        parent: "/plugin-path",
        path: "/plugin-path/sub-page",
        link: "Plugin page"
      }
    ];
  }
}
```

## RoutingService

ExtensionProvider that provides extension point for routing.

Most probably you don't want to use it directly but rather implement its `IRoutingExtension` and bind it to `ExtensionProvider` named `RoutingExtensionProvider`.

### Expample RoutingExtension

```tsx
class PluginRouting implements IRoutingExtension {
  getRoues() {
    return [
      <Redirect from="/old-plugin" to="/plugin-path" />,
      <Route path="/plugin-path" component={PluginPageComponent}>
        <Route path="sub-page" component={PluginSubPageComponent} />
      </Route>
    ];
  }
}
```
