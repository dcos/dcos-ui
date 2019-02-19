import { BehaviorSubject } from "rxjs";
import { ContainerModule, injectable, inject, named } from "inversify";
import { ExtensionProvider, bindExtensionProvider } from "@extension-kid/core";

export const DynamicResolverExtensionType = Symbol("DynamicResolverExtension");
export const DynamicResolverType = Symbol("DynamicResolver");
export interface DynamicResolverExtensionInterface {
  id: symbol;
}

@injectable()
class DynamicResolver {
  extensionType = DynamicResolverExtensionType;

  _extensionProvider: ExtensionProvider<DynamicResolverExtensionInterface>;
  _extensions$: BehaviorSubject<any>;

  constructor(
    @inject(ExtensionProvider)
    @named(DynamicResolverExtensionType)
    extensionProvider: ExtensionProvider<DynamicResolverExtensionInterface>
  ) {
    this._extensionProvider = extensionProvider;
    this._extensions$ = new BehaviorSubject(null);

    this._extensionProvider.subscribe({
      next: () => this._extensions$.next("")
    });
  }

  importModule(window: any, url: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const tempGlobal =
        `__tempModuleLoadingVariable_${url}_` +
        Math.random()
          .toString(32)
          .substring(2);
      script.type = "module";
      script.textContent = `import * as m from "${url}"; window[${tempGlobal}] = m;`;

      script.onload = () => {
        resolve(window[tempGlobal]);
        delete window[tempGlobal];
        script.remove();
      };

      script.onerror = () => {
        reject(new Error("Failed to load module script with URL " + url));
        delete window[tempGlobal];
        script.remove();
      };

      document.documentElement.appendChild(script);
    });
  }
}

export default new ContainerModule(bind => {
  bindExtensionProvider(bind, DynamicResolverExtensionType);
  bind(DynamicResolverType)
    .to(DynamicResolver)
    .inSingletonScope();
});
