import { ContainerModule, injectable } from "inversify";
import { Container } from "@extension-kid/core";

export const DynamicResolverExtensionType = Symbol("DynamicResolverExtension");
export const DynamicResolverType = Symbol("DynamicResolver");
export interface DynamicResolverExtensionInterface {
  id: symbol;
}

// tslint:disable-next-line
export interface DynamicResolverInterface {
  resolve(url: string): void;
}

@injectable()
class DynamicResolver implements DynamicResolverInterface {
  extensionType = DynamicResolverExtensionType;

  private container: Container;
  private urlRegistry: { [index: string]: boolean };

  constructor(container: Container) {
    this.container = container;
    this.urlRegistry = {};
  }

  public resolve(url: string) {
    if (this.urlRegistry[url]) {
      return;
    }

    this.importModule({}, url)
      .then(module => {
        this.container.load(module as ContainerModule);
        this.urlRegistry[url] = true;
      })
      // tslint:disable-next-line:no-console
      .catch(error => console.error(error));
  }

  private importModule(window: any, url: string) {
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
  bind(DynamicResolverType)
    .toDynamicValue(
      ({ container }) => new DynamicResolver(container as Container)
    )
    .inSingletonScope();
});
