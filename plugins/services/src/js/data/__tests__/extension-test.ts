import { Container } from "@extension-kid/core";
import dataLayerContainerModuleFactory, {
  DataLayer,
  DataLayerType
} from "@extension-kid/data-layer";

import extensionFactory from "../extension";

export function createTestContainer(): Container {
  const container = new Container();

  container.load(dataLayerContainerModuleFactory());
  const servicesModule = extensionFactory();
  if (servicesModule) {
    container.load(servicesModule);
  } else {
    throw new Error("Failed to get services data-layer extension module");
  }
  return container;
}

describe("DataLayer - Services Extension", () => {
  it("can load container module", () => {
    let container = createTestContainer();

    const dl = container.get<DataLayer>(DataLayerType);
    expect(dl).not.toBeNull();
  });
});
