import { injectable, inject, named } from "inversify";
import { ExtensionProvider } from "extension-kid";

export const ApplicationExtension = Symbol("ApplicationExtension");
export interface IApplicationExtension {
  onStart(service: Application): void;
}

@injectable()
export default class Application {
  private extensionsProvider: ExtensionProvider<IApplicationExtension>;

  constructor(
    @inject(ExtensionProvider)
    @named(ApplicationExtension)
    extensionsProvider: ExtensionProvider<IApplicationExtension>
  ) {
    this.extensionsProvider = extensionsProvider;
  }

  public start(): void {
    this.extensionsProvider.subscribe(this.initExtensions.bind(this));
    this.initExtensions();
  }

  private initExtensions() {
    for (const extension of this.extensionsProvider.getAllExtensions()) {
      if (extension.onStart) {
        extension.onStart(this);
      }
    }
  }
}
